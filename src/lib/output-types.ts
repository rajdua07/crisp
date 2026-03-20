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
    instructions: `Extract the core substance from the input and compress it into exactly 3 sentences using the Minto Pyramid structure.

Sentence 1: The bottom line - what the input is about and the key takeaway. Lead with a number or concrete fact FROM the input.
Sentence 2: The "so what" - why this matters, with one supporting data point or comparison FROM the input.
Sentence 3: The "now what" - the specific decision or action described in the input. If no action exists in the input, summarize the main implication instead.

Rules:
- EXTRACT, don't invent. Every fact, number, name, and date must come from the input. Never fabricate deadlines, metrics, or context.
- Never open with "This report covers..." or any context-setting.
- Use specific numbers, names, and dates from the input - never "significant improvement" or "several key areas."
- If the input lacks specifics, preserve whatever exists and flag gaps: "[revenue figure needed]."
- Readable in under 10 seconds.
- Tone: direct, confident, no hedging. "We need to" not "It might be worth considering."`,
  },
  {
    slug: "email_draft",
    name: "Email Draft",
    icon: "mail",
    description: "Ready-to-send email",
    instructions: `Reformat the input content into a ready-to-send email using the BLUF (Bottom Line Up Front) framework.

Structure:
1. "Subject: " line - specific, drawn from the actual content. "Reel script ready - need text option pick" not "Video Update"
2. Opening line - the single most important thing from the input. No "I hope this finds you well."
3. Context - 2-3 sentences of key details FROM the input. Only what's needed to understand.
4. Ask or next step - ONLY if one exists in the input. If the input is purely informational, say "FYI - no action needed."
5. Sign-off - match the voice profile if available, otherwise keep it simple.

Rules:
- Under 150 words for the body (not counting subject). If the content is dense, use bullets.
- ONLY include asks, deadlines, names, and next steps that are IN the input. Never invent a recipient, deadline, or action.
- Never use "please find attached" or "I wanted to reach out." Start with the point.
- Use names only if they appear in the input. Never guess at a recipient name.
- Include the most important specific details from the input (numbers, options, key decisions) - don't just vaguely reference them.`,
  },
  {
    slug: "action_items",
    name: "Action Items",
    icon: "check-square",
    description: "Bulleted task list with owners",
    instructions: `Extract action items from the input content. Only extract actions that are stated or clearly implied in the input. Format: Verb + Object + Owner.

Format each item as:
- [Verb] [specific thing] - [Owner]

Example: "Lock in Q3 pricing - Jake"

Rules:
- Every action must come FROM the input. Never invent tasks, owners, or priorities that aren't there.
- Every item starts with a concrete verb: "Ship", "Review", "Schedule", "Decide", "Cut", "Hire." Never "Consider" or "Think about."
- If the input doesn't specify owners, use [OWNER?]. Flagging gaps IS the value.
- Max 7 items. If you extract more, ruthlessly cut or combine.
- Order by priority/urgency, not by how they appeared in the input.
- Group related items if logical.
- Each item must be independently actionable - someone should be able to do it without reading the original document.
- If an item is vague in the original ("improve customer experience"), make it specific or flag it: "Define 3 specific CX improvements - [OWNER?] (original was vague)"
- If the input has no clear action items, extract the key decisions or choices that need to be made instead.`,
  },
  {
    slug: "slack_message",
    name: "Slack Message",
    icon: "message-square",
    description: "Casual, scannable channel post",
    instructions: `Extract the most useful details from the input and present them as a Slack message - short, casual, scannable.

Structure:
Line 1: The single most important fact or takeaway. Not what the content IS ("got a reel script") but what's IN it ("reel script: LOST JOB OFFER to $10M arc, 7-10 sec vertical").
Line 2-4: The specific details someone would actually need. Name the options, list the key numbers, state the choices. Use CAPS for emphasis on key items.
Last line: A natural next step IF one exists in the original content. Otherwise skip it.

Rules:
- CRITICAL: Only include information that exists in the original input. NEVER invent deadlines, meetings, documents, links, or next steps that aren't in the source material.
- NEVER role-play as a coworker or pretend you're discussing the content with someone. You are EXTRACTING the content, not reacting to it.
- NEVER describe the input from the outside. BAD: "Got a detailed reel script with three voiceover options." GOOD: "reel script ready - voiceover options: story-driven, Moses/biblical frame, or simple question hook"
- NAME every option, version, or choice. "story-driven, biblical, question-format" not "three voiceover options." The names ARE the message.
- Max 5 lines. Slack is not email.
- Never start with "Hey team" or "Just wanted to share." Start with the substance.
- Use lowercase for casual feel when appropriate. "heads up" not "Heads Up."
- One emoji max, and only if it adds meaning. Never decorative emoji.
- Match the energy: bad news should feel direct and honest, good news can feel slightly more casual.`,
  },
];

export const ALL_OUTPUT_TYPES: OutputType[] = [
  ...DEFAULT_OUTPUT_TYPES,
  {
    slug: "decision_needed",
    name: "Decision Needed",
    icon: "git-branch",
    description: "Options with tradeoffs for fast decisions",
    instructions: `Extract the key decision(s) from the input and frame them using the Amazon-style "disagree and commit" format.

Structure:
THE DECISION: [Frame as a specific question based on what the input is actually deciding]

Option A: [Name it - from the input]
- What it is (1 sentence)
- Upside: [from the input, or logically implied]
- Downside: [from the input, or logically implied]
- Reversibility: [easy to undo / hard to undo / one-way door]

Option B: [Name it - from the input]
[Same format]

Option C (if applicable): [Name it - from the input]
[Same format]

RECOMMENDATION: [Pick one based on evidence in the input. Be opinionated but grounded.]
DECISION NEEDED BY: [Only if a date exists in the input. Otherwise use [DATE?]]

Rules:
- Options must come from the input. If the input presents 4 text overlay options, those are the options. Don't invent alternatives.
- Never fabricate deadlines, costs, or metrics not in the source material.
- The decision question must be specific enough that someone can answer "A" or "B" and everyone knows what happens next.
- Never present more than 3 options. If the input has more, pick the top 3 and note others were considered.
- "Reversibility" is critical - it tells the reader how much deliberation this actually deserves.`,
  },
  {
    slug: "slide_content",
    name: "Slide Deck",
    icon: "presentation",
    description: "Narrative slide deck for Gamma/PPT/Google Slides",
    instructions: `Restructure the input content into a narrative slide deck. Every slide's content must be extracted from the input.

Format each slide as:

SLIDE 1: [Title Slide]
[Title: A bold claim or question drawn from the input's core message. NOT a generic topic label.]
[Subtitle: Context from the input - author, date, or one-line framing]

SLIDE 2: [Situation/Context]
[Headline: The key context from the input]
- Supporting fact 1 from input (max 12 words)
- Supporting fact 2 from input
- Supporting fact 3 from input

SLIDE 3: [Problem/Opportunity]
[Headline: The tension, challenge, or opportunity described in the input]
- Key detail from input
- Impact or stakes from input

SLIDES 4-7: [Key Content]
[Each headline tells part of the story from the input - someone reading ONLY headlines should get the full picture]
- Max 3 bullets per slide, each under 12 words
- Data points, examples, or details FROM the input

FINAL SLIDE: [Next Step / Key Takeaway]
[The conclusion or ask from the input. If no ask exists, use the strongest takeaway.]

Rules:
- 6-10 slides. Fewer is almost always better.
- ALL content must come from the input. Never invent data, claims, or context.
- Headlines are CLAIMS, not topics. "Customer churn doubled in 60 days" not "Churn Analysis."
- The headline sequence alone should tell the complete story from the input.
- Max 30 words of text per slide (excluding headlines).
- No slide should require more than 5 seconds to read.`,
  },
  {
    slug: "client_one_pager",
    name: "Client One-Pager",
    icon: "file-text",
    description: "External-facing polished summary",
    instructions: `Reformat the input content into a polished, external-facing one-pager. Extract and reorganize - don't invent.

Structure:
[HEADLINE] - A clear statement of value or finding drawn from the input (not "Overview" or "Summary")

[Opening paragraph: 2-3 sentences. What this content is about and why it matters. Ground it in the input's specifics.]

KEY POINTS
- [3-5 bullets extracted from the input, each 1-2 sentences. Lead with the insight, follow with evidence from the input.]

NEXT STEPS
[Only if next steps exist in the input. If none, skip this section entirely rather than inventing steps.]

Rules:
- 150-250 words total. One page means ONE page.
- ALL facts, figures, and claims must come from the input.
- No internal jargon the reader wouldn't know - translate if needed.
- Write for the reader's self-interest where the input supports it.
- Professional but warm. Not stiff, not casual. The tone of a trusted advisor.
- Never fabricate next steps, timelines, or outcomes not in the source material.`,
  },
  {
    slug: "social_post",
    name: "Social Post",
    icon: "share-2",
    description: "LinkedIn + Twitter ready",
    instructions: `Transform the input content into a social post using the hook-story-insight-CTA framework. The story and insight must come from the input.

LinkedIn version:

Line 1: Hook - the most compelling fact, number, or claim FROM the input. This is the only line visible before "see more."

[blank line]

Lines 2-8: The story or context FROM the input. Short paragraphs (1-2 sentences each). Use specific details from the input, not generic statements.

[blank line]

Lines 9-11: The insight or takeaway. What's the non-obvious lesson from this content?

[blank line]

Last line: Engagement prompt tied to the input's topic. A specific question, not "What do you think?"

---

Twitter/X version (under 280 chars):
[Same core insight from the input, compressed. Lead with the most shareable line. No hashtags unless they add real context.]

Rules:
- ALL story details, facts, and claims must come from the input. Never fabricate anecdotes, dates, or scenarios.
- No "I'm excited to announce" or "Thrilled to share." Start mid-story.
- Use "I" not "We" for personal posts. LinkedIn rewards personal voice.
- One idea per post. Pick the strongest angle from the input.
- No bullet points on LinkedIn (they kill engagement). Use short paragraphs instead.
- If the input is a script, plan, or technical doc - extract the human story or key insight from it, don't just describe the doc.`,
  },
  {
    slug: "text_message",
    name: "Text Message",
    icon: "smartphone",
    description: "Short iMessage/SMS-ready",
    instructions: `Compress the input content into 1-3 text messages that capture the essential point. You are summarizing the content as a text, not role-playing as someone sending it.

Rules:
- Each message under 160 characters.
- No greeting, no sign-off. Just start with the substance.
- Use lowercase if it fits the tone. "reel script ready - story-driven or biblical voiceover, lost job to $10M arc" not formal casing.
- Contractions always. "can't" not "cannot."
- Break grammar rules if it sounds more natural.
- First message: the core point from the input. Second message: key detail (only if needed). Third message: next step ONLY if one exists in the input.
- No emoji unless it's genuinely how the person would text (match voice profile if available).
- If the content is complex, simplify ruthlessly. A text message that requires scrolling has failed.
- NEVER invent asks, deadlines, or context not in the input. If there's no action needed, don't fabricate one.`,
  },
  {
    slug: "voice_note_script",
    name: "Voice Note Script",
    icon: "mic",
    description: "Speakable script for voice memos",
    instructions: `Summarize the input content as a speakable voice note script (30-45 seconds). The content of what you say must come from the input.

Structure:
- Open naturally: "OK so here's the rundown..." or "Quick summary of what we've got..."
- Deliver the key point from the input in the first 10 seconds.
- Add 1-2 supporting details from the input conversationally.
- Close with a next step ONLY if one exists in the input. Otherwise just wrap it naturally.

Rules:
- 80-120 words (30-45 seconds when spoken).
- Write for the EAR, not the eye. No bullet points, no formatting, no headers.
- Use natural speech patterns: "so basically," "the thing is," "right?" - but sparingly.
- Short sentences. People don't speak in compound-complex sentences.
- No written-word phrases: never "regarding," "furthermore," "in conclusion."
- ALL facts, details, and claims must come from the input. Never invent context, meetings, or deadlines.
- If the input is detailed (scripts, plans, specs), hit the highlights - don't try to cover everything in 30 seconds.
- Read it out loud to yourself. If it sounds like an essay being read, rewrite it.`,
  },
  {
    slug: "formatted_document",
    name: "Document (DOCX)",
    icon: "file-text",
    description: "Professional document, downloadable as DOCX",
    instructions: `Restructure the input content into a well-organized professional document. Extract, reorganize, and polish - don't invent.

Use markdown headers (## Section Title) to organize content. Adapt this structure to fit the input:

## Executive Summary
[2-3 sentences capturing the core of the input. Someone who reads only this should understand the key point.]

## Background / Context
[Relevant context FROM the input. Keep to 1-2 paragraphs. Only include what's in the source material.]

## [Core Section - name it based on what the input is actually about]
[The substance from the input, reorganized for clarity. Use a mix of paragraphs and bullets.]

## Recommendations / Key Takeaways
[Only if the input contains or clearly implies recommendations. Extract them, don't invent them. If the input has no recommendations, rename this to "Key Takeaways" and summarize the most important points.]

## Next Steps
[Only if next steps exist in the input. If none exist, SKIP this section entirely.]

Rules:
- 300-600 words depending on content depth.
- ALL content must come from the input. Never fabricate data, recommendations, or next steps.
- Headers should be descriptive and specific to the input's content.
- No metadata, no subject lines, no "Dear..." - just the document body.
- Professional tone unless the voice profile calls for otherwise.
- Every section should be independently skimmable.
- Adapt the section structure to the input. A reel script doesn't need "Recommendations" - it needs "Script," "Visual Direction," "Production Notes."`,
  },
  {
    slug: "pdf_report",
    name: "Report (PDF)",
    icon: "file-text",
    description: "Formal report, downloadable as PDF",
    instructions: `Restructure the input content into a formal report format. Extract and organize - every claim must trace back to the input.

Use markdown headers (## Section Title). Adapt this structure to the input:

## Executive Overview
[3-4 sentences. What the input is about, the key finding or point, and the primary takeaway. All from the input.]

## Key Findings
[3-5 findings EXTRACTED from the input, each as a statement followed by 1-2 sentences of evidence from the input. Format:]
Finding 1: [Claim from input]
[Supporting evidence from input.]

## Detailed Analysis
[The input's content reorganized for depth and clarity. Use subheaders (### Subsection) if the content spans multiple topics.]

## Risk Assessment
[Only if risks are discussed in the input. Never fabricate risks. Skip this section if not relevant.]

## Recommendations
[Only if the input contains or clearly implies recommendations. Format:]
1. [Action from input] - [Expected impact from input]
[If no recommendations exist in input, rename to "Key Takeaways" and summarize.]

## Appendix (if needed)
[Supporting details from the input that don't fit the main narrative but are worth preserving.]

Rules:
- 400-800 words. Quality over quantity.
- Professional, third-person tone throughout. "The data indicates" not "I think."
- EVERY claim, number, and finding must come from the input. No fabricated data, risks, or recommendations.
- Clean structure and clear headers are essential - this will be rendered as a formatted PDF.
- If the input is thin on a topic, acknowledge it: "Further analysis needed on [topic]." Don't fill gaps with invented content.
- Adapt sections to the input. A creative script gets "Creative Direction," "Production Specs," "Options" - not "Risk Assessment."`,
  },
];
