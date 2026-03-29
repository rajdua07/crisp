import Anthropic from "@anthropic-ai/sdk";
import { VOICE_ANALYSIS_PROMPT } from "@/lib/prompts";
import { getOrCreateUser } from "@/lib/auth";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    await getOrCreateUser();

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { samples, categories } = body;

    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return Response.json({ error: "At least one writing sample is required" }, { status: 400 });
    }

    const samplesText = samples
      .map((s: string, i: number) => {
        const category = categories?.[i] ? ` (${categories[i]})` : "";
        return `--- Sample ${i + 1}${category} ---\n${s}`;
      })
      .join("\n\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `${VOICE_ANALYSIS_PROMPT}\n\n=== WRITING SAMPLES ===\n${samplesText}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return Response.json({ error: "Failed to parse voice analysis" }, { status: 500 });
    }

    const profileData = JSON.parse(jsonMatch[0]);
    return Response.json({ profileData });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
