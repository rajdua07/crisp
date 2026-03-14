import Anthropic from "@anthropic-ai/sdk";
import { ALL_OUTPUT_TYPES } from "@/lib/output-types";
import { buildRecastPrompt } from "@/lib/prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const { edited_content, output_types, voice_profile } = await request.json();

    if (!edited_content || !output_types?.length) {
      return Response.json({ error: "edited_content and output_types required" }, { status: 400 });
    }

    const voiceJson = voice_profile ? JSON.stringify(voice_profile, null, 2) : undefined;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const selectedTypes = ALL_OUTPUT_TYPES.filter((t) =>
            output_types.includes(t.slug)
          );

          const outputPromises = selectedTypes.map(async (outputType) => {
            const prompt = buildRecastPrompt(
              outputType.name,
              outputType.instructions,
              edited_content,
              undefined,
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
          controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ success: true })}\n\n`));
        } catch (err) {
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: err instanceof Error ? err.message : "Chain failed" })}\n\n`)
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
