import Anthropic from "@anthropic-ai/sdk";
import { ALL_OUTPUT_TYPES } from "@/lib/output-types";
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      input_text,
      output_types = ["exec_brief", "email_draft", "action_items", "slack_message"],
      voice_profile,
      custom_types,
    } = body;

    if (!input_text || typeof input_text !== "string") {
      return Response.json({ error: "input_text is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const voiceJson = voice_profile ? JSON.stringify(voice_profile, null, 2) : undefined;

    // Merge system types with any custom types from client
    const allTypes = [...ALL_OUTPUT_TYPES, ...(custom_types || [])];

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
          const selectedTypes = allTypes.filter((t) =>
            output_types.includes(t.slug)
          );

          const outputPromises = selectedTypes.map(async (outputType) => {
            const prompt = buildRecastPrompt(
              outputType.name,
              outputType.instructions,
              input_text,
              thoughtContext,
              voiceJson
            );

            const response = await anthropic.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 1024,
              messages: [{ role: "user", content: prompt }],
            });

            const content = response.content[0].type === "text" ? response.content[0].text : "";
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
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
