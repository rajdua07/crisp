import Anthropic from "@anthropic-ai/sdk";
import { VOICE_ANALYSIS_PROMPT } from "@/lib/prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { samples } = body;

    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return Response.json({ error: "At least one writing sample is required" }, { status: 400 });
    }

    const samplesText = samples
      .map((s: string, i: number) => `--- Sample ${i + 1} ---\n${s}`)
      .join("\n\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
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
