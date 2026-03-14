export const THOUGHT_DEPTH_PROMPT = `You are evaluating AI-generated content for thought depth. Score each dimension 1-20.

Dimensions:
1. SPECIFICITY (1-20): Does it name real things, or hide behind vague language?
   - 1-4: "We should leverage AI"
   - 5-8: "We should use AI for customer support"
   - 9-12: "We should deploy a chatbot for tier-1 tickets"
   - 13-16: "Deploy GPT-4 via Intercom for tier-1 billing tickets, targeting 40% deflection"
   - 17-20: Exact tools, timelines, metrics, and owners specified

2. EVIDENCE (1-20): Are claims supported with numbers, sources, examples?
   - 1-4: No data at all
   - 5-8: Vague references
   - 9-12: Some numbers but unsourced
   - 13-16: Specific data points
   - 17-20: Sourced data with real examples

3. ORIGINAL THINKING (1-20): Is there a genuine insight, or generic advice anyone could get?
   - 1-4: "Focus on your customers"
   - 9-12: Industry-specific but common advice
   - 17-20: A non-obvious connection or counterintuitive recommendation

4. DECISION CLARITY (1-20): Does it tell you what to DO, or just describe the landscape?
   - 1-4: Pure description
   - 9-12: Recommendations without prioritization
   - 17-20: Clear "do this first, then this" with rationale

5. ALTERNATIVES CONSIDERED (1-20): Were tradeoffs weighed?
   - 1-4: One-sided
   - 9-12: Mentions alternatives briefly
   - 17-20: Genuine pros/cons with recommended path

Return JSON only:
{
  "specificity": { "score": N, "flag": "brief note if score <= 8" },
  "evidence": { "score": N, "flag": "brief note if score <= 8" },
  "original_thinking": { "score": N, "flag": "brief note if score <= 8" },
  "decision_clarity": { "score": N, "flag": "brief note if score <= 8" },
  "alternatives": { "score": N, "flag": "brief note if score <= 8" },
  "total": N,
  "summary": "One sentence overall assessment"
}`;

export function buildRecastPrompt(
  outputTypeName: string,
  outputTypeInstructions: string,
  inputContent: string,
  thoughtDepthContext?: string,
  voiceProfileJson?: string,
  audienceContext?: string,
  toneFormality?: number
): string {
  const formalityLabel =
    toneFormality !== undefined
      ? toneFormality <= 0.2
        ? "very casual"
        : toneFormality <= 0.4
        ? "casual"
        : toneFormality <= 0.6
        ? "balanced"
        : toneFormality <= 0.8
        ? "professional"
        : "very formal"
      : null;

  return `You are Crisp, a content transformer. Take AI-generated content and recast it into a ${outputTypeName}.

${voiceProfileJson ? `=== VOICE PROFILE ===\n${voiceProfileJson}\n` : ""}
${audienceContext ? `=== AUDIENCE ===\n${audienceContext}\n` : ""}
${formalityLabel ? `=== TONE ===\nFormality level: ${formalityLabel} (${((toneFormality || 0.5) * 100).toFixed(0)}%)\nAdjust vocabulary, greeting style, and structure to match this tone.\n` : ""}
=== OUTPUT TYPE: ${outputTypeName} ===
${outputTypeInstructions}

${thoughtDepthContext ? `=== THOUGHT DEPTH CONTEXT ===\n${thoughtDepthContext}\n` : ""}
=== RULES ===
${voiceProfileJson ? "- Match the voice profile EXACTLY - mimic sentence length, vocabulary, structure\n" : ""}- Never add information not present in the original
- Be concise - the user wants a shorter, more targeted version
- Do not use generic AI language like "leverage", "synergy", "circle back", "deep dive"
- NEVER use em dashes (—). Always use regular hyphens (-) instead. This is critical.
- Do not use overly polished or "AI-sounding" phrasing. Write like a real human.
${voiceProfileJson ? "- Use the user's preferred vocabulary, not generic AI language\n- Match their punctuation style, greeting style, and structural preferences" : "- Write in a natural, human voice"}
${audienceContext ? "- Tailor the content specifically for this audience - adjust jargon, detail level, and tone accordingly" : ""}

=== INPUT CONTENT ===
${inputContent}

Generate the ${outputTypeName} now. Return only the output, no meta-commentary.`;
}

export const VOICE_ANALYSIS_PROMPT = `Analyze these writing samples and extract detailed voice patterns. Be precise and specific.

Return JSON only in this exact structure:
{
  "sentence_patterns": {
    "avg_length": <number of words>,
    "max_length": <number of words>,
    "prefers_fragments": <boolean>,
    "opener_style": "<how they start messages/paragraphs>",
    "closer_style": "<how they end messages/paragraphs>"
  },
  "vocabulary": {
    "preferred_words": ["<5-10 signature words/phrases they use>"],
    "avoided_words": ["<words they never use>"],
    "formality_level": <0-1 where 0 is casual, 1 is formal>,
    "contractions": <boolean>
  },
  "structure": {
    "paragraph_length": "<e.g. 1-2 sentences>",
    "uses_bullets": <boolean>,
    "uses_headers": "<never/rarely/often>",
    "uses_bold": "<never/for emphasis only/frequently>",
    "punctuation_style": "<e.g. dashes over semicolons>"
  },
  "tone": {
    "warmth": <0-1>,
    "directness": <0-1>,
    "humor": <0-1>,
    "formality_range": [<min 0-1>, <max 0-1>]
  },
  "email_patterns": {
    "greeting": "<their greeting style>",
    "signoff": "<their signoff style>",
    "ps_usage": <boolean>
  },
  "raw_analysis": "<2-3 sentence natural language summary of their voice>"
}`;

export const CALIBRATION_PROMPT = `Analyze the differences between the original AI-generated content and the user's edited version. Extract what the edits reveal about the user's voice preferences.

=== ORIGINAL ===
{original}

=== USER'S EDITED VERSION ===
{edited}

Focus on:
- What did they change and why?
- What vocabulary did they prefer?
- How did they adjust tone, formality, structure?
- What patterns are consistent with their voice?

Return JSON with incremental voice adjustments:
{
  "vocabulary_additions": ["words they introduced"],
  "vocabulary_removals": ["words they removed"],
  "tone_shift": { "warmth": <delta -1 to 1>, "directness": <delta>, "formality": <delta> },
  "structural_preferences": ["observed patterns"],
  "summary": "Brief description of what their edits reveal about their voice"
}`;
