/** Output type slugs that support file download (DOCX/PDF) */
export const DOCUMENT_OUTPUT_SLUGS: Record<string, "docx" | "pdf"> = {
  formatted_document: "docx",
  pdf_report: "pdf",
};

export interface OutputType {
  slug: string;
  name: string;
  icon: string;
  description: string;
  instructions: string;
}

export const DEFAULT_OUTPUT_TYPES: OutputType[] = [
  {
    slug: "exec_brief",
    name: "Exec Brief",
    icon: "briefcase",
    description: "3-sentence CEO summary",
    instructions: `3 sentences maximum. First sentence: what this is about. Second sentence: the key finding or recommendation. Third sentence: what needs to happen next. No fluff, no context-setting. A CEO should be able to read this in 10 seconds.`,
  },
  {
    slug: "email_draft",
    name: "Email Draft",
    icon: "mail",
    description: "Ready-to-send email",
    instructions: `Format as a ready-to-send email. Include subject line prefixed with "Subject: ". Keep under 200 words unless the content requires more. Lead with the key point. Use a professional but natural tone.`,
  },
  {
    slug: "action_items",
    name: "Action Items",
    icon: "check-square",
    description: "Bulleted task list",
    instructions: `Bulleted list format. Each item starts with a verb. Include who/what/when where possible. If the original doesn't specify owners or deadlines, flag with [OWNER?] or [BY WHEN?]. Max 7 items — prioritize ruthlessly.`,
  },
  {
    slug: "slack_message",
    name: "Slack Message",
    icon: "message-square",
    description: "Casual, scannable",
    instructions: `Casual, scannable. Max 4 lines. Use line breaks between thoughts. No formal greeting or signoff. End with a clear ask or next step. Can use emoji sparingly.`,
  },
];

export const ALL_OUTPUT_TYPES: OutputType[] = [
  ...DEFAULT_OUTPUT_TYPES,
  {
    slug: "decision_needed",
    name: "Decision Needed",
    icon: "git-branch",
    description: "Options with tradeoffs",
    instructions: `State the actual decision buried in the content as a clear question. Then list 2-3 options with one-line tradeoffs for each. Format: "The decision: [question]" then "Option A: ... / Option B: ..."`,
  },
  {
    slug: "slide_content",
    name: "Slide Deck",
    icon: "presentation",
    description: "Full slide deck, text-only for Gamma/PPT",
    instructions: `Create a complete slide deck outline (text only, to be pasted into tools like Gamma or Google Slides). Format each slide as:

SLIDE 1: [Title Slide]
[Title - a bold claim or hook, not a generic topic]
[Subtitle - one line of context]

SLIDE 2-N: [Content Slides]
[Slide headline - a claim, not a topic. "Revenue grew 23% in Q2" not "Q2 Revenue Update"]
- Bullet 1 (max 12 words)
- Bullet 2 (max 12 words)
- Bullet 3 (max 12 words)
[Optional: Speaker note in italics]

FINAL SLIDE: [Closing/CTA]
[Clear next step or call to action]

Aim for 5-10 slides depending on content depth. Every headline should be a claim that tells the story on its own - someone skimming just the headlines should understand the full narrative.`,
  },
  {
    slug: "client_one_pager",
    name: "Client One-Pager",
    icon: "file-text",
    description: "External-facing summary",
    instructions: `Professional, polished, external-facing. 150-250 words. Start with the key insight or recommendation. No internal jargon. End with a clear next step or call to action.`,
  },
  {
    slug: "social_post",
    name: "Social Post",
    icon: "share-2",
    description: "LinkedIn/Twitter-ready",
    instructions: `LinkedIn-optimized. Hook in the first line (pattern interrupt or bold claim). Short paragraphs (1-2 sentences). Personal angle where possible. End with engagement prompt (question or CTA). 150-300 words for LinkedIn, then a "---" separator, then a <280 chars Twitter variant.`,
  },
  {
    slug: "text_message",
    name: "Text Message",
    icon: "smartphone",
    description: "Short iMessage/SMS-ready",
    instructions: `Write as a text message - the way a real person texts. Max 3 messages (separated by line breaks). Keep each under 160 chars. No greetings or signoffs. Casual, direct, human. Use contractions. Can break grammar rules if it sounds more natural. No emoji unless the tone calls for it.`,
  },
  {
    slug: "voice_note_script",
    name: "Voice Note Script",
    icon: "mic",
    description: "Speakable voice memo",
    instructions: `Write exactly how someone would say this out loud in a voice note. Conversational, not written. Use filler phrases sparingly ("so basically", "the thing is") to sound natural. No bullet points or formatting - just flowing speech. Keep under 45 seconds when read aloud (roughly 100-120 words). Start mid-thought like a real voice note ("Hey so I just looked at this and..."). End with a clear ask or next step.`,
  },
  {
    slug: "formatted_document",
    name: "Document (DOCX)",
    icon: "file-text",
    description: "Professional document, downloadable as DOCX",
    instructions: `Create a well-structured professional document. Use markdown-style headers (## Section Title) to organize content. Include:
- A clear executive summary or introduction paragraph
- Logically organized sections with descriptive headers
- Bullet points for lists and key points
- Concluding section with recommendations or next steps

Write in complete, polished paragraphs. Aim for 300-600 words depending on content depth. This will be exported as a formatted DOCX file, so structure matters. No metadata or subject lines — just the document body.`,
  },
  {
    slug: "pdf_report",
    name: "Report (PDF)",
    icon: "file-text",
    description: "Formal report, downloadable as PDF",
    instructions: `Create a formal report suitable for external distribution. Use markdown-style headers (## Section Title) to delineate sections. Structure as:

## Overview
Brief context and purpose (2-3 sentences).

## Key Findings
The core insights, data points, or analysis. Use bullet points for clarity.

## Analysis
Deeper discussion of implications, tradeoffs, or supporting evidence. Full paragraphs.

## Recommendations
Actionable next steps, numbered if possible.

Write in a professional, third-person tone. Aim for 400-800 words. This will be exported as a formatted PDF, so clean structure and clear headers are essential.`,
  },
];
