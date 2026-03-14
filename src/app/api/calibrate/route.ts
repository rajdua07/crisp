import Anthropic from "@anthropic-ai/sdk";
import { CALIBRATION_PROMPT } from "@/lib/prompts";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const { original_content, edited_content, output_type } = await request.json();

    if (!original_content || !edited_content) {
      return Response.json({ error: "Both original and edited content required" }, { status: 400 });
    }

    const prompt = CALIBRATION_PROMPT
      .replace("{original}", original_content)
      .replace("{edited}", edited_content);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return Response.json({ error: "Failed to parse calibration" }, { status: 500 });
    }

    const adjustments = JSON.parse(jsonMatch[0]);

    // Persist calibration data
    await prisma.calibration.create({
      data: {
        userId: user.id,
        originalContent: original_content,
        editedContent: edited_content,
        adjustments,
        outputType: output_type,
      },
    });

    return Response.json({ adjustments });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: err instanceof Error ? err.message : "Calibration failed" },
      { status: 500 }
    );
  }
}
