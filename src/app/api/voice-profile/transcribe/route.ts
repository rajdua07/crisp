import { VOICE_ANALYSIS_PROMPT } from "@/lib/prompts";
import Anthropic from "@anthropic-ai/sdk";
import { getOrCreateUser } from "@/lib/auth";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    await getOrCreateUser();

    const contentType = request.headers.get("content-type") || "";

    let transcript: string;

    if (contentType.includes("application/json")) {
      // Browser-side transcription via Web Speech API - transcript sent directly
      const body = await request.json();
      transcript = body.transcript;

      if (!transcript || transcript.trim().length === 0) {
        return Response.json({ error: "Transcript is empty" }, { status: 400 });
      }
    } else {
      // Fallback: audio file upload with OpenAI Whisper
      const formData = await request.formData();
      const audioFile = formData.get("audio") as File;

      if (!audioFile) {
        return Response.json({ error: "Audio file is required" }, { status: 400 });
      }

      if (!process.env.OPENAI_API_KEY) {
        return Response.json(
          { error: "Voice transcription is not available. Please use browser-based recording instead." },
          { status: 500 }
        );
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

      const result = await whisperResponse.json();
      transcript = result.text;
    }

    // Analyze voice patterns from transcript
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
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
