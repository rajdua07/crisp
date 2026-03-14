import { VOICE_ANALYSIS_PROMPT } from "@/lib/prompts";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return Response.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Transcribe with Whisper
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OPENAI_API_KEY not configured for transcription" }, { status: 500 });
    }

    const audioFormData = new FormData();
    audioFormData.append("file", audioFile);
    audioFormData.append("model", "whisper-1");
    audioFormData.append("language", "en");

    const whisperResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: audioFormData,
      }
    );

    if (!whisperResponse.ok) {
      const err = await whisperResponse.text();
      return Response.json({ error: `Transcription failed: ${err}` }, { status: 500 });
    }

    const { text: transcript } = await whisperResponse.json();

    // Analyze voice patterns from transcript
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `${VOICE_ANALYSIS_PROMPT}\n\nThis is a transcription of the user speaking naturally. Analyze their spoken voice patterns:\n\n=== VOICE TRANSCRIPT ===\n${transcript}`,
        },
      ],
    });

    const analysisText = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return Response.json({ error: "Failed to parse voice analysis" }, { status: 500 });
    }

    const profileData = JSON.parse(jsonMatch[0]);
    return Response.json({ profileData, transcript });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
