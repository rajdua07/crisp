export type OutputLength = "short" | "medium" | "long";
export type OutputFormat = "default" | "voice_note" | "sms";

export interface OutputConfig {
  length: OutputLength;
  format: OutputFormat;
  humanify: boolean;
}

export const LENGTH_OPTIONS: { value: OutputLength; label: string; description: string }[] = [
  { value: "short", label: "Short", description: "2-4 sentences" },
  { value: "medium", label: "Medium", description: "1-2 paragraphs" },
  { value: "long", label: "Long", description: "Full detail" },
];

export const FORMAT_OPTIONS: { value: OutputFormat; label: string; description: string }[] = [
  { value: "default", label: "Default", description: "Clean written text" },
  { value: "voice_note", label: "Voice Note", description: "Speakable, conversational" },
  { value: "sms", label: "SMS / Text", description: "Ultra-short, casual" },
];

export function outputConfigLabel(config: OutputConfig): string {
  const parts: string[] = [];
  parts.push(config.length.charAt(0).toUpperCase() + config.length.slice(1));
  if (config.format !== "default") {
    const fmt = FORMAT_OPTIONS.find((f) => f.value === config.format);
    if (fmt) parts.push(fmt.label);
  }
  if (config.humanify) parts.push("Humanified");
  return parts.join(" - ");
}

export function outputConfigKey(config: OutputConfig): string {
  return `${config.length}_${config.format}_${config.humanify ? "h" : "n"}`;
}

const LENGTH_INSTRUCTIONS: Record<OutputLength, string> = {
  short: `LENGTH: SHORT (2-4 sentences, under 80 words)
- Get to the point immediately. One core message.
- Cut everything that isn't essential to understanding.
- If you can say it in fewer words, do it.`,

  medium: `LENGTH: MEDIUM (1-2 paragraphs, 100-250 words)
- Lead with the key point, follow with supporting detail.
- Include the most important specifics from the input (numbers, names, options).
- Tight but complete - someone reading this should have what they need.`,

  long: `LENGTH: LONG (3+ paragraphs, 300-600 words)
- Full substance extraction. Include all meaningful details from the input.
- Organize with clear structure - use line breaks and CAPS headers for sections.
- Still be concise within each section. Long doesn't mean padded.`,
};

const FORMAT_INSTRUCTIONS: Record<OutputFormat, string> = {
  default: `FORMAT: WRITTEN TEXT
- Clean, direct prose. No special formatting constraints.
- Structure for readability - short paragraphs, line breaks between ideas.`,

  voice_note: `FORMAT: VOICE NOTE SCRIPT
- Write for the EAR, not the eye. This will be spoken aloud.
- Use natural speech patterns: "so basically," "the thing is," "right?"
- Short sentences. Nobody speaks in compound-complex sentences.
- No bullet points, no formatting, no headers. Just speakable text.
- Open naturally: "OK so..." or "Quick thing -" or "Hey so..."
- Never use written-word phrases: "regarding," "furthermore," "in conclusion."
- Read it in your head. If it sounds like an essay being read, rewrite it.`,

  sms: `FORMAT: SMS / TEXT MESSAGE
- Under 160 characters per message. 1-3 messages max.
- No greeting, no sign-off. Just the substance.
- Use lowercase if it fits the tone. Contractions always.
- Break grammar rules if it sounds more natural.
- No emoji unless the voice profile uses them.
- If it requires scrolling, it's failed.`,
};

const HUMANIFY_INSTRUCTIONS = `HUMANIFY MODE (CRITICAL - READ CAREFULLY):
Your job is to make this sound like a real human typed it fast, not like AI polished it.

Apply these imperfections NATURALLY and SPARINGLY (not every sentence):
- Occasional lowercase where caps would be "correct" (start of sentences, proper nouns)
- Skip a comma or two where meaning is still clear
- Use casual contractions: "gonna", "wanna", "gotta", "kinda", "tbh", "ngl"
- Occasional sentence fragments. Like this.
- Run-on thoughts connected with "and" or "-" instead of proper punctuation
- One or two minor typos that a fast typer would make (double letters, missed letters) - but keep it readable
- Start sentences with "And" or "But" or "So"
- Use "..." for trailing thoughts
- Abbreviate where natural: "bc", "w/", "rn", "idk", "prob"

DO NOT overdo it. The output should still be clear and readable. Think "typed on phone while walking" not "drunk texting." The imperfections should feel INVISIBLE - a reader shouldn't think "this has intentional typos." They should just think "this person typed this themselves."`;

export function buildOutputInstructions(config: OutputConfig): string {
  const parts = [
    LENGTH_INSTRUCTIONS[config.length],
    FORMAT_INSTRUCTIONS[config.format],
  ];

  if (config.humanify) {
    parts.push(HUMANIFY_INSTRUCTIONS);
  }

  return parts.join("\n\n");
}
