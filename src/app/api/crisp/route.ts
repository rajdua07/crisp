import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_OUTPUT_TYPES } from "@/lib/output-types";
import { THOUGHT_DEPTH_PROMPT, buildRecastPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function scoreThoughtDepth(inputText: string) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `${THOUGHT_DEPTH_PROMPT}\n\n=== CONTENT TO EVALUATE ===\n${inputText}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}

async function generateOutput(
  outputTypeSlug: string,
  outputTypeName: string,
  instructions: string,
  inputText: string,
  thoughtDepthContext?: string
): Promise<string> {
  const prompt = buildRecastPrompt(
    outputTypeName,
    instructions,
    inputText,
    thoughtDepthContext
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      input_text,
      output_types = ["exec_brief", "email_draft", "action_items", "slack_message"],
    } = body;

    if (!input_text || typeof input_text !== "string") {
      return new Response(JSON.stringify({ error: "input_text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. Score thought depth
          const thoughtDepth = await scoreThoughtDepth(input_text);
          if (thoughtDepth) {
            controller.enqueue(
              encoder.encode(
                `event: thought_depth\ndata: ${JSON.stringify(thoughtDepth)}\n\n`
              )
            );
          }

          const thoughtContext = thoughtDepth
            ? `Score: ${thoughtDepth.total}/25\nGaps: ${Object.entries(thoughtDepth)
                .filter(
                  ([key, val]) =>
                    key !== "total" &&
                    key !== "summary" &&
                    typeof val === "object" &&
                    val !== null &&
                    "flag" in val &&
                    (val as { score: number; flag: string }).flag
                )
                .map(
                  ([key, val]) =>
                    `${key}: ${(val as { flag: string }).flag}`
                )
                .join(", ")}`
            : undefined;

          // 2. Generate outputs concurrently
          const selectedTypes = DEFAULT_OUTPUT_TYPES.filter((t) =>
            output_types.includes(t.slug)
          );

          const outputPromises = selectedTypes.map(async (outputType) => {
            const content = await generateOutput(
              outputType.slug,
              outputType.name,
              outputType.instructions,
              input_text,
              thoughtContext
            );
            controller.enqueue(
              encoder.encode(
                `event: output\ndata: ${JSON.stringify({
                  type: outputType.slug,
                  name: outputType.name,
                  content,
                })}\n\n`
              )
            );
          });

          await Promise.all(outputPromises);

          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({ success: true })}\n\n`
            )
          );
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                error: err instanceof Error ? err.message : "Unknown error",
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
