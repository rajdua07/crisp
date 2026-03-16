import Anthropic from "@anthropic-ai/sdk";
import { getOrCreateUser, getPlanLimits } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Quick Rewrite — optimized for the desktop app and browser extension.
 * Single input → single rewritten output in the user's voice.
 * Designed for <3s latency. No thought depth scoring, no multi-output fan-out.
 */
export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();
    const limits = getPlanLimits(user.plan);

    if (
      limits.crispsPerMonth !== Infinity &&
      user.crispsUsedThisMonth >= limits.crispsPerMonth
    ) {
      return Response.json(
        { error: "Monthly limit reached. Upgrade your plan." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { input_text, context } = body;

    if (!input_text || input_text.length < 20) {
      return Response.json(
        { error: "Text too short to rewrite." },
        { status: 400 }
      );
    }

    // Fetch the user's active voice profile
    const voiceProfile = await prisma.voiceProfile.findFirst({
      where: { userId: user.id, isDefault: true },
      select: { profileData: true },
    });

    const voiceJson = voiceProfile?.profileData
      ? JSON.stringify(voiceProfile.profileData)
      : null;

    // Context-aware prompt: adjust output style based on where the user is pasting
    const contextHint = getContextHint(context);

    const prompt = `You are Crisp. Rewrite this AI-generated text in the user's authentic voice.

${voiceJson ? `=== VOICE PROFILE ===\n${voiceJson}\n` : ""}
=== CONTEXT ===
${contextHint}

=== RULES ===
${voiceJson ? "- Match the voice profile EXACTLY — sentence length, vocabulary, tone, structure" : "- Write in a natural, direct human voice. No AI-speak."}
- Keep the same core meaning and information
- Never add information not in the original
- No generic AI language: "leverage", "synergy", "comprehensive", "in today's landscape"
- NEVER use em dashes (—). Use hyphens (-) instead.
- Be concise. Humans don't over-explain.
- If the original is an email, keep email format. If it's a message, keep it casual.
${voiceJson ? "- Use the user's preferred greetings, sign-offs, and punctuation habits" : ""}

=== TEXT TO REWRITE ===
${input_text}

Rewrite now. Return ONLY the rewritten text, nothing else.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const rewritten =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Increment usage (fire and forget)
    prisma.user
      .update({
        where: { id: user.id },
        data: { crispsUsedThisMonth: { increment: 1 } },
      })
      .catch(() => {});

    return Response.json({ rewritten, context });
  } catch (error: unknown) {
    console.error("Quick rewrite error:", error);
    return Response.json(
      { error: "Rewrite failed. Please try again." },
      { status: 500 }
    );
  }
}

function getContextHint(context?: string): string {
  switch (context) {
    case "slack":
    case "discord":
      return "The user is pasting into a chat/messaging app. Keep it casual, short, and scannable. No subject lines or formal greetings.";
    case "email":
    case "gmail":
    case "outlook":
      return "The user is composing an email. Keep appropriate greeting and sign-off. Be professional but human.";
    case "notion":
    case "docs":
    case "google_docs":
      return "The user is writing a document. Maintain structure (headers, bullets) but make the voice authentic.";
    case "linkedin":
      return "The user is posting on LinkedIn. Keep it professional but personable. No cringe.";
    case "clipboard_paste":
    default:
      return "The user copied AI-generated text and wants it rewritten in their voice. Infer the appropriate format from the content itself.";
  }
}
