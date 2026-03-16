import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_OUTPUT_TYPES } from "@/lib/output-types";
import { buildRecastPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 45;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Demo endpoint — no auth required.
 * Generates 4 default output types from pasted text.
 * Rate limited by IP (simple in-memory counter).
 * No voice profile (that's the upsell).
 */

// Simple in-memory rate limit: 5 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }

  if (entry.count >= 5) return false;

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: "Demo limit reached. Sign up for free to continue." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { input_text } = body;

    if (!input_text || input_text.length < 30) {
      return Response.json(
        { error: "Text too short. Paste at least a paragraph." },
        { status: 400 }
      );
    }

    // Cap input to 3000 chars for demo
    const text = input_text.substring(0, 3000);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate all 4 default outputs concurrently
          const outputPromises = DEFAULT_OUTPUT_TYPES.map(async (outputType) => {
            const prompt = buildRecastPrompt(
              outputType.name,
              outputType.instructions,
              text
            );

            const response = await anthropic.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 1000,
              messages: [{ role: "user", content: prompt }],
            });

            const content =
              response.content[0].type === "text"
                ? response.content[0].text
                : "";

            // Stream each output as it completes
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: outputType.slug,
                  name: outputType.name,
                  content,
                })}\n\n`
              )
            );
          });

          await Promise.all(outputPromises);
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Demo generation error:", error);
          controller.error(error);
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
  } catch (error: unknown) {
    console.error("Demo error:", error);
    return Response.json({ error: "Demo failed." }, { status: 500 });
  }
}
