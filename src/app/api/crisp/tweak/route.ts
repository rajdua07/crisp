import Anthropic from "@anthropic-ai/sdk";
import { getOrCreateUser } from "@/lib/auth";
import { AI_CRUTCH_RULES } from "@/lib/prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    await getOrCreateUser();

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { content, instruction, output_config } = body;

    if (!content || !instruction) {
      return Response.json(
        { error: "content and instruction are required" },
        { status: 400 }
      );
    }

    const configContext = output_config
      ? `Output settings: ${output_config.length} length, ${output_config.format} format${output_config.humanify ? ", humanified" : ""}`
      : "";

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are Crisp, a content tweaker. The user has a refined output and wants you to modify it based on their instruction.

${configContext ? `=== CONTEXT ===\n${configContext}\n` : ""}
=== CURRENT CONTENT ===
${content}

=== USER'S TWEAK INSTRUCTION ===
${instruction}

=== RULES ===
- Apply the user's instruction precisely
- Keep the same general format and length
- NEVER use em dashes (-). Always use regular hyphens (-) instead.
- Write naturally like a real human
- Return ONLY the tweaked content, no meta-commentary or explanations

=== AI CRUTCH ELIMINATION ===
${AI_CRUTCH_RULES}`,
        },
      ],
    });

    const tweakedContent =
      response.content[0].type === "text" ? response.content[0].text : "";

    return Response.json({ tweaked_content: tweakedContent });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Tweak failed" },
      { status: 500 }
    );
  }
}
