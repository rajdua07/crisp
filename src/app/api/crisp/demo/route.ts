import Anthropic from "@anthropic-ai/sdk";
import { buildRecastPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 45;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function callClaude(params: Anthropic.Messages.MessageCreateParamsNonStreaming, retries = 3): Promise<Anthropic.Messages.Message> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await client.messages.create(params);
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
 * Generates a single refined output from pasted text.
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

    const prompt = buildRecastPrompt(
      `Refine this text to be clearer, more direct, and free of AI patterns. Preserve the original meaning, structure, and approximate length. Do not change the format - if it's an email, keep it as an email. If it's bullet points, keep bullet points. Just make every sentence sound like a real human wrote it.`,
      text
    );

    const response = await callClaude({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const refined = response.content[0].type === "text" ? response.content[0].text : "";

    return Response.json({ original: text, refined });
  } catch (error: unknown) {
    console.error("Demo error:", error);
    return Response.json({ error: "Demo failed." }, { status: 500 });
  }
}
