import Anthropic from "@anthropic-ai/sdk";
import { buildOutputInstructions, outputConfigLabel, outputConfigKey } from "@/lib/output-types";
import type { OutputConfig } from "@/lib/output-types";
import { buildRecastPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 45;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function callClaude(params: Parameters<typeof anthropic.messages.create>[0], retries = 3): Promise<Anthropic.Messages.Message> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await anthropic.messages.create(params);
    } catch (err: unknown) {
      const status = err instanceof Anthropic.APIError ? err.status : undefined;
      if (status === 429 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Demo endpoint - no auth required.
 * Generates 3 outputs (short/medium/long) from pasted text.
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

const DEMO_CONFIGS: OutputConfig[] = [
  { length: "short", format: "default", humanify: false },
  { length: "medium", format: "default", humanify: false },
  { length: "long", format: "default", humanify: false },
];

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
          for (const config of DEMO_CONFIGS) {
            const instructions = buildOutputInstructions(config);
            const prompt = buildRecastPrompt(instructions, text);

            const response = await callClaude({
              model: "claude-sonnet-4-20250514",
              max_tokens: 2048,
              messages: [{ role: "user", content: prompt }],
            });

            const content =
              response.content[0].type === "text"
                ? response.content[0].text
                : "";

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  key: outputConfigKey(config),
                  label: outputConfigLabel(config),
                  config,
                  content,
                })}\n\n`
              )
            );
          }
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
