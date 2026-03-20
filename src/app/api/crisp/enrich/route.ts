import Anthropic from "@anthropic-ai/sdk";
import { getOrCreateUser } from "@/lib/auth";
import { AI_CRUTCH_RULES } from "@/lib/prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const ENRICH_PROMPT = `You are an expert content enhancer. The user pasted AI-generated content that scored poorly on thought depth. Your job is to ENRICH the content by:

1. SPECIFICITY: Replace vague language with concrete details, real tools, specific metrics, named examples
2. EVIDENCE: Add plausible data points, benchmarks, or real-world references where claims are unsupported
3. ORIGINAL THINKING: Surface non-obvious insights, counterintuitive angles, or connections the original missed
4. DECISION CLARITY: Turn descriptions into clear recommendations with prioritized next steps
5. ALTERNATIVES CONSIDERED: Add tradeoffs, risks, and alternative approaches where the original was one-sided

=== THOUGHT DEPTH ANALYSIS ===
{depth_analysis}

=== RULES ===
- Keep the same general topic and intent
- Do NOT change the length dramatically - enrich depth, not volume
- Do NOT use em dashes (—). Use regular hyphens (-) instead.
- Write like a smart human, not a corporate AI
- Focus your enrichment on the dimensions that scored lowest
- Preserve any good parts of the original

=== AI CRUTCH ELIMINATION ===
${AI_CRUTCH_RULES}

=== ORIGINAL CONTENT ===
{input_text}

Return ONLY the enriched content. No meta-commentary or explanations.`;

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
    const { input_text, thought_depth } = body;

    if (!input_text) {
      return Response.json(
        { error: "input_text is required" },
        { status: 400 }
      );
    }

    const depthAnalysis = thought_depth
      ? JSON.stringify(thought_depth, null, 2)
      : "No specific analysis available - enrich all dimensions.";

    const prompt = ENRICH_PROMPT.replace("{depth_analysis}", depthAnalysis).replace(
      "{input_text}",
      input_text
    );

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const enrichedText =
      response.content[0].type === "text" ? response.content[0].text : "";

    return Response.json({ enriched_text: enrichedText });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Enrichment failed" },
      { status: 500 }
    );
  }
}
