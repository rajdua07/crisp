import Anthropic from "@anthropic-ai/sdk";
import { buildOutputInstructions } from "@/lib/output-types";
import type { OutputConfig } from "@/lib/output-types";
import { buildRecastPrompt } from "@/lib/prompts";
import { getOrCreateUser, getPlanLimits } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

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

const QUALITY_SCORE_PROMPT = `Score this text on 5 dimensions, 1-10 each. Be harsh - most AI text scores 3-5.

Dimensions:
1. NATURAL VOICE (1-10): Does it sound like a real person wrote it? Or does it sound like AI?
2. CLARITY (1-10): Is the message clear and direct? Or buried in fluff?
3. CONCISENESS (1-10): Is every word earning its place? Or is it padded?
4. SUBSTANCE (1-10): Does it say something specific? Or hide behind vague language?
5. NO AI CRUTCHES (1-10): Free of "leverage", "delve", false contrasts, throat-clearing? (1 = full of AI slop, 10 = completely clean)

Return JSON only, no other text:
{"natural_voice":N,"clarity":N,"conciseness":N,"substance":N,"no_ai_crutches":N,"total":N}

Where total = average of all 5, rounded to nearest integer.

TEXT TO SCORE:
`;

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();
    const limits = getPlanLimits(user.plan);
    const hasClerk = !!process.env.CLERK_SECRET_KEY;

    if (
      hasClerk &&
      limits.crispsPerMonth !== Infinity &&
      user.crispsUsedThisMonth >= limits.crispsPerMonth
    ) {
      return Response.json(
        { error: "Monthly crisp limit reached. Upgrade your plan." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      input_text,
      output_config,
      voice_profile,
      audience,
      tone_formality,
    } = body;

    if (!input_text || typeof input_text !== "string") {
      return Response.json({ error: "input_text is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const config: OutputConfig = output_config || { length: "medium", format: "default", humanify: false };
    const voiceJson = voice_profile ? JSON.stringify(voice_profile, null, 2) : undefined;
    const audienceContext = audience
      ? `Target audience: ${audience.name}\nDescription: ${audience.description}\nExpected tone: formality ${(audience.tonePreset?.formality * 100 || 50).toFixed(0)}%, warmth ${(audience.tonePreset?.warmth * 100 || 50).toFixed(0)}%`
      : undefined;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. Score the original text
          let originalScore = null;
          try {
            const scoreRes = await callClaude({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 200,
              messages: [{
                role: "user",
                content: `${QUALITY_SCORE_PROMPT}${input_text.slice(0, 2000)}`,
              }],
            });
            const scoreText = scoreRes.content[0].type === "text" ? scoreRes.content[0].text : "";
            const jsonMatch = scoreText.match(/\{[\s\S]*\}/);
            if (jsonMatch) originalScore = JSON.parse(jsonMatch[0]);
          } catch {
            // Scoring is optional
          }

          // 2. Generate summary
          let summary = "";
          try {
            const summaryRes = await callClaude({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 30,
              messages: [{
                role: "user",
                content: `Summarize the theme of this text in 3-6 words. No quotes, no punctuation at the end. Examples: "Q3 revenue analysis", "Team offsite planning", "Product launch strategy"\n\nText:\n${input_text.slice(0, 500)}`,
              }],
            });
            summary = summaryRes.content[0].type === "text" ? summaryRes.content[0].text.trim() : "";
            controller.enqueue(
              encoder.encode(
                `event: summary\ndata: ${JSON.stringify({ summary })}\n\n`
              )
            );
          } catch {
            // Summary is optional
          }

          // 3. Generate refined output with output config
          const outputInstructions = buildOutputInstructions(config);
          const prompt = buildRecastPrompt(
            outputInstructions,
            input_text,
            undefined,
            voiceJson,
            audienceContext,
            tone_formality
          );

          const response = await callClaude({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
          });

          const refined = response.content[0].type === "text" ? response.content[0].text : "";

          controller.enqueue(
            encoder.encode(
              `event: refined\ndata: ${JSON.stringify({ refined })}\n\n`
            )
          );

          // 4. Score the refined text
          let crispedScore = null;
          try {
            const scoreRes = await callClaude({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 200,
              messages: [{
                role: "user",
                content: `${QUALITY_SCORE_PROMPT}${refined.slice(0, 2000)}`,
              }],
            });
            const scoreText = scoreRes.content[0].type === "text" ? scoreRes.content[0].text : "";
            const jsonMatch = scoreText.match(/\{[\s\S]*\}/);
            if (jsonMatch) crispedScore = JSON.parse(jsonMatch[0]);
          } catch {
            // Scoring is optional
          }

          // Send quality scores
          if (originalScore && crispedScore) {
            const qualityScore = {
              original: originalScore.total,
              crisped: crispedScore.total,
              dimensions: [
                { name: "Natural Voice", original: originalScore.natural_voice, crisped: crispedScore.natural_voice },
                { name: "Clarity", original: originalScore.clarity, crisped: crispedScore.clarity },
                { name: "Conciseness", original: originalScore.conciseness, crisped: crispedScore.conciseness },
                { name: "Substance", original: originalScore.substance, crisped: crispedScore.substance },
                { name: "No AI Crutches", original: originalScore.no_ai_crutches, crisped: crispedScore.no_ai_crutches },
              ],
            };
            controller.enqueue(
              encoder.encode(
                `event: quality_score\ndata: ${JSON.stringify(qualityScore)}\n\n`
              )
            );
          }

          // Persist session
          await prisma.session.create({
            data: {
              userId: user.id,
              inputText: input_text,
              summary: summary || undefined,
              audienceId: audience?.id,
              toneFormality: tone_formality,
              outputs: {
                create: [{
                  outputConfig: JSON.parse(JSON.stringify(config)),
                  outputLabel: "Crisped",
                  content: refined,
                }],
              },
            },
          });

          // Increment usage
          await prisma.user.update({
            where: { id: user.id },
            data: { crispsUsedThisMonth: { increment: 1 } },
          });

          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({ success: true })}\n\n`
            )
          );
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Unknown error";
          console.error("Crisp API error:", errMsg);
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ error: errMsg })}\n\n`
            )
          );
        } finally {
          controller.close();
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
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
