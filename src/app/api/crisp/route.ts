import Anthropic from "@anthropic-ai/sdk";
import { buildOutputInstructions, outputConfigLabel, outputConfigKey } from "@/lib/output-types";
import type { OutputConfig } from "@/lib/output-types";
import { THOUGHT_DEPTH_PROMPT, buildRecastPrompt } from "@/lib/prompts";
import { getOrCreateUser, getPlanLimits } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function callClaude(params: Parameters<typeof callClaude>[0], retries = 3): Promise<Anthropic.Messages.Message> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await callClaude(params);
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

async function scoreThoughtDepth(inputText: string) {
  const response = await callClaude({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `${THOUGHT_DEPTH_PROMPT}\n\n=== CONTENT TO EVALUATE ===\n${inputText}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Auth + usage check
    const user = await getOrCreateUser();
    const limits = getPlanLimits(user.plan);

    if (
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
      output_configs = [{ length: "medium", format: "default", humanify: false }] as OutputConfig[],
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

    const voiceJson = voice_profile ? JSON.stringify(voice_profile, null, 2) : undefined;
    const audienceContext = audience
      ? `Target audience: ${audience.name}\nDescription: ${audience.description}\nExpected tone: formality ${(audience.tonePreset?.formality * 100 || 50).toFixed(0)}%, warmth ${(audience.tonePreset?.warmth * 100 || 50).toFixed(0)}%`
      : undefined;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. Score thought depth
          const thoughtDepth = await scoreThoughtDepth(input_text);
          if (thoughtDepth) {
            controller.enqueue(
              encoder.encode(
                `event: thought_depth\ndata: ${JSON.stringify(thoughtDepth)}\n\n`
              )
            );
          }

          const thoughtContext = thoughtDepth
            ? `Score: ${thoughtDepth.total}/100\nGaps: ${Object.entries(thoughtDepth)
                .filter(
                  ([key, val]) =>
                    key !== "total" &&
                    key !== "summary" &&
                    typeof val === "object" &&
                    val !== null &&
                    "flag" in val &&
                    (val as { score: number; flag: string }).flag
                )
                .map(
                  ([key, val]) =>
                    `${key}: ${(val as { flag: string }).flag}`
                )
                .join(", ")}`
            : undefined;

          // 2. Generate summary + outputs concurrently
          const summaryPromise = callClaude({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 30,
            messages: [{
              role: "user",
              content: `Summarize the theme of this text in 3-6 words. No quotes, no punctuation at the end. Examples: "Q3 revenue analysis", "Team offsite planning", "Product launch strategy"\n\nText:\n${input_text.slice(0, 500)}`,
            }],
          }).then((res) => {
            const summary = res.content[0].type === "text" ? res.content[0].text.trim() : "";
            controller.enqueue(
              encoder.encode(
                `event: summary\ndata: ${JSON.stringify({ summary })}\n\n`
              )
            );
            return summary;
          }).catch(() => null);

          const configs: OutputConfig[] = output_configs;
          const collectedOutputs: { key: string; label: string; config: OutputConfig; content: string }[] = [];

          // Run outputs sequentially to avoid rate limits
          const outputsPromise = (async () => {
            for (const config of configs) {
              const instructions = buildOutputInstructions(config);
              const prompt = buildRecastPrompt(
                instructions,
                input_text,
                thoughtContext,
                voiceJson,
                audienceContext,
                tone_formality
              );

              const response = await callClaude({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 2048,
                messages: [{ role: "user", content: prompt }],
              });

              const content = response.content[0].type === "text" ? response.content[0].text : "";
              const key = outputConfigKey(config);
              const label = outputConfigLabel(config);
              const output = { key, label, config, content };
              collectedOutputs.push(output);

              controller.enqueue(
                encoder.encode(
                  `event: output\ndata: ${JSON.stringify(output)}\n\n`
                )
              );
            }
          })();

          const [summary] = await Promise.all([summaryPromise, outputsPromise]);

          // Persist session to DB
          await prisma.session.create({
            data: {
              userId: user.id,
              inputText: input_text,
              summary: summary || undefined,
              thoughtDepth: thoughtDepth || undefined,
              audienceId: audience?.id,
              toneFormality: tone_formality,
              outputs: {
                create: collectedOutputs.map((o) => ({
                  outputConfig: JSON.parse(JSON.stringify(o.config)),
                  outputLabel: o.label,
                  content: o.content,
                })),
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
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                error: err instanceof Error ? err.message : "Unknown error",
              })}\n\n`
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
