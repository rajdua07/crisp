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
    instructions: `Write a 3-sentence executive brief using the Minto Pyramid structure: conclusion first, then supporting evidence, then action needed.

Sentence 1: The bottom line - what happened and whether it's good or bad. Lead with a number or concrete fact.
Sentence 2: The "so what" - why this matters, with one supporting data point or comparison.
Sentence 3: The "now what" - the specific decision or action needed, with a deadline if possible.

Rules:
- Never open with "This report covers..." or any context-setting. A CEO doesn't need to be told what they asked for.
- Use specific numbers, names, and dates - never "significant improvement" or "several key areas."
- If the input lacks specifics, preserve whatever numbers exist and flag gaps: "[revenue figure needed]."
- A CEO should fully understand the situation in under 10 seconds of reading.
- Tone: direct, confident, no hedging. "We need to" not "It might be worth considering."`,
  },
  {
    slug: "email_draft",
    name: "Email Draft",
    icon: "mail",
    description: "Ready-to-send email",
    instructions: `Write a ready-to-send email following the BLUF (Bottom Line Up Front) framework used by military and top consultants.

Structure:
1. "Subject: " line - specific and actionable. "Q2 churn hit 4.2% - need to approve retention plan by Friday" not "Q2 Update"
2. Opening line - the single most important thing the reader needs to know or do. No "I hope this finds you well."
3. Context - 2-3 sentences of supporting detail. Only what's needed to make the decision or understand the ask.
4. Clear ask - what you need from them, by when. Bold or bullet the ask if there are multiple.
5. Sign-off - match the voice profile if available, otherwise keep it simple.

Rules:
- Under 150 words for the body (not counting subject). If the content is dense, use bullets.
- Every email must have a clear ask or next step. If the input is purely informational, frame it as "FYI - no action needed."
- Never use "please find attached" or "I wanted to reach out." Start with the point.
- Use the reader's name if inferrable from context. "Sarah -" not "Dear Colleague."`,
  },
  {
    slug: "action_items",
    name: "Action Items",
    icon: "check-square",
    description: "Bulleted task list with owners and deadlines",
    instructions: `Extract a prioritized action item list using the format: Verb + Object + Owner + Deadline.

Format each item as:
- [Verb] [specific thing] - [Owner] by [Deadline]

Example: "Lock in Q3 pricing - Jake by Thursday EOD"

Rules:
- Every item starts with a concrete verb: "Ship", "Review", "Schedule", "Decide", "Cut", "Hire." Never "Consider" or "Think about."
- If the input doesn't specify owners, use [OWNER?]. If no deadline, use [BY WHEN?]. Flagging gaps IS the value.
- Max 7 items. If you extract more, ruthlessly cut or combine. The reader should feel this is the complete list, not a brain dump.
- Order by priority/urgency, not by how they appeared in the input.
- Group related items if logical (e.g., "Revenue" and "Churn" items together).
- Each item must be independently actionable - someone should be able to do it without reading the original document.
- If an item is vague in the original ("improve customer experience"), make it specific or flag it: "**Define 3 specific CX improvements** - [OWNER?] by [BY WHEN?] (original was vague)"`,
  },
  {
    slug: "slack_message",
    name: "Slack Message",
    icon: "message-square",
    description: "Casual, scannable channel post",
    instructions: `Write a Slack message the way a sharp operator actually writes in Slack - not how an AI thinks a Slack message looks.

Structure:
Line 1: The headline. What's happening and why the reader cares. No "Hi team" or "Quick update."
Line 2-3: The key details, separated by line breaks. Use CAPS for emphasis on key names, numbers, or urgent items.
Last line: The ask or next step. "Need eyes on this by 3pm" or "LMK if questions."

Rules:
- Max 5 lines. Slack is not email.
- Never start with "Hey team" or "Just wanted to share." Start with the news.
- Use lowercase for casual feel when appropriate. "heads up" not "Heads Up."
- One emoji max, and only if it adds meaning (a red circle for urgent, a check for complete). Never decorative emoji.
- Write for a channel, not a DM - assume some readers have zero context.
- If there's a link or doc to reference, mention it: "(see Q2 deck in #strategy)"
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
    instructions: `Frame the decision using the Amazon-style "disagree and commit" format. The goal is to get to a decision in one read.

Structure:
THE DECISION: [Frame as a specific, binary or ternary question]

Option A: [Name it]
- What it is (1 sentence)
- Upside: [specific benefit with number if possible]
- Downside: [specific risk or cost]
- Reversibility: [easy to undo / hard to undo / one-way door]

Option B: [Name it]
[Same format]

Option C (if applicable): [Name it]
[Same format]

RECOMMENDATION: [Pick one and say why in 1-2 sentences. Be opinionated.]
DECISION NEEDED BY: [Extract from context or flag as [DATE?]]

Rules:
- The decision question must be specific enough that someone can answer "A" or "B" and everyone knows what happens next.
- Never present more than 3 options. If there are more, you haven't filtered enough.
- "Reversibility" is critical - it tells the reader how much deliberation this actually deserves.
- Don't present "do nothing" as an option unless it has real consequences worth stating.`,
  },
  {
    slug: "slide_content",
    name: "Slide Deck",
    icon: "presentation",
    description: "Narrative slide deck for Gamma/PPT/Google Slides",
    instructions: `Create a narrative-driven slide deck following McKinsey's "Situation-Complication-Resolution" storytelling framework.

Format each slide as:

SLIDE 1: [Title Slide]
[Title: A bold claim or question, NOT a topic. "We're leaving $2M on the table" not "Q2 Revenue Review"]
[Subtitle: One line of context or the presenter's name/date]

SLIDE 2: [Situation]
[Headline: What's true today that everyone agrees on]
- Supporting fact 1 (max 12 words)
- Supporting fact 2
- Supporting fact 3

SLIDE 3: [Complication]
[Headline: What changed, what's broken, or what's at risk]
- Key tension or problem
- Impact if unaddressed

SLIDES 4-7: [Resolution/Evidence]
[Each headline tells the story - someone reading ONLY the headlines should understand the full argument]
- Max 3 bullets per slide, each under 12 words
- Data points, examples, or proof
[Speaker note in italics if the slide needs verbal context]

FINAL SLIDE: [The Ask]
[What you need from the audience: approval, budget, a decision, feedback]
- Specific next step with timeline

Rules:
- 6-10 slides. Fewer is almost always better.
- Headlines are CLAIMS, not topics. "Customer churn doubled in 60 days" not "Churn Analysis."
- The headline sequence alone should tell a complete story.
- Max 30 words of text per slide (excluding headlines). If you need more words, you need more slides.
- No slide should require more than 5 seconds to read.`,
  },
  {
    slug: "client_one_pager",
    name: "Client One-Pager",
    icon: "file-text",
    description: "External-facing polished summary",
    instructions: `Write a polished, external-facing one-pager suitable for clients, investors, or partners.

Structure:
[HEADLINE] - A clear statement of value or finding (not "Overview" or "Summary")

[Opening paragraph: 2-3 sentences. What this is and why it matters to the reader. Write from their perspective, not yours.]

KEY POINTS
- [3-5 bullets, each 1-2 sentences. Lead with the insight, follow with evidence.]

NEXT STEPS
[1-2 sentences. What happens now and who does what.]

Rules:
- 150-250 words total. One page means ONE page.
- No internal jargon, project codenames, or company acronyms the reader wouldn't know.
- Write for the reader's self-interest: "This reduces your onboarding time by 40%" not "We improved our onboarding flow."
- Professional but warm. Not stiff, not casual. The tone of a trusted advisor.
- End with momentum - the reader should feel like progress is happening.`,
  },
  {
    slug: "social_post",
    name: "Social Post",
    icon: "share-2",
    description: "LinkedIn + Twitter ready",
    instructions: `Write a LinkedIn post that follows the "hook-story-insight-CTA" framework used by top creators.

LinkedIn version:

Line 1: Hook - a bold claim, surprising stat, or pattern interrupt. This is the only line visible before "see more." Make it count.

[blank line]

Lines 2-8: The story or context. Short paragraphs (1-2 sentences each). Make it personal or specific - "Last Tuesday, our churn hit 4.2%" not "Many companies face churn issues."

[blank line]

Lines 9-11: The insight or lesson. What did you learn? What's the non-obvious takeaway?

[blank line]

Last line: Engagement prompt. A specific question, not "What do you think?" Better: "What's the one metric you stopped tracking that you shouldn't have?"

---

Twitter/X version (under 280 chars):
[Same core insight, compressed. Lead with the most shareable line. No hashtags unless they add real context.]

Rules:
- No "I'm excited to announce" or "Thrilled to share." Start mid-story.
- Use "I" not "We" for personal posts. LinkedIn rewards personal voice.
- One idea per post. If you have two insights, make two posts.
- No bullet points on LinkedIn (they kill engagement). Use short paragraphs instead.`,
  },
  {
    slug: "text_message",
    name: "Text Message",
    icon: "smartphone",
    description: "Short iMessage/SMS-ready",
    instructions: `Write this as 1-3 text messages, the way a real person actually texts.

Rules:
- Each message under 160 characters.
- No greeting, no sign-off. Just start.
- Use lowercase if it fits the tone. "hey can you look at the q2 numbers" not "Hey, Can You Look At The Q2 Numbers?"
- Contractions always. "can't" not "cannot."
- Break grammar rules if it sounds more natural. Real people text "gonna" and "tbh" and "ngl."
- First message: the point. Second message: the context (only if needed). Third message: the ask (only if different from the point).
- No emoji unless it's genuinely how the person would text (match voice profile if available).
- If the content is complex, simplify ruthlessly. A text message that requires scrolling has failed.`,
  },
  {
    slug: "voice_note_script",
    name: "Voice Note Script",
    icon: "mic",
    description: "Speakable script for voice memos",
    instructions: `Write exactly how someone would say this out loud in a 30-45 second voice note. This is a script meant to be READ ALOUD or recorded.

Structure:
- Open mid-thought, like a real voice note: "Hey so I just went through the numbers and..." or "OK quick thing before the meeting..."
- Deliver the key point in the first 10 seconds.
- Add 1-2 supporting details conversationally.
- Close with a clear ask or "let me know what you think."

Rules:
- 80-120 words (30-45 seconds when spoken).
- Write for the EAR, not the eye. No bullet points, no formatting, no headers.
- Use natural speech patterns: "so basically," "the thing is," "right?" — but sparingly. Don't overdo filler.
- Short sentences. People don't speak in compound-complex sentences.
- Use "like" and "you know" only if the voice profile calls for it.
- No written-word phrases: never "regarding," "furthermore," "in conclusion."
- Read it out loud to yourself. If it sounds like an essay being read, rewrite it.`,
  },
  {
    slug: "formatted_document",
    name: "Document (DOCX)",
    icon: "file-text",
    description: "Professional document, downloadable as DOCX",
    instructions: `Create a well-structured professional document suitable for sharing with stakeholders.

Use markdown headers (## Section Title) to organize content. Follow this structure:

## Executive Summary
[2-3 sentences. The entire document condensed. Someone who reads only this section should understand the conclusion and next steps.]

## Background
[What context does the reader need? Keep to 1-2 paragraphs. Only include what's necessary to understand the analysis.]

## [Core Section - name it based on content]
[The meat. Use a mix of paragraphs and bullets. Paragraphs for analysis and narrative, bullets for lists and data points.]

## Recommendations
[Numbered list. Each recommendation is specific and actionable. Include expected impact where possible.]

## Next Steps
[Who does what by when. Table format if 3+ items.]

Rules:
- 300-600 words depending on content depth.
- Write in complete, polished paragraphs. This is a document, not a list.
- Headers should be descriptive: "Q2 Revenue Analysis" not "Section 2."
- No metadata, no subject lines, no "Dear..." — just the document body.
- Professional third-person tone unless the voice profile calls for first person.
- Every section should be independently skimmable — a reader jumping to "Recommendations" should not need to have read "Background."`,
  },
  {
    slug: "pdf_report",
    name: "Report (PDF)",
    icon: "file-text",
    description: "Formal report, downloadable as PDF",
    instructions: `Create a formal report suitable for board meetings, client presentations, or regulatory contexts.

Use markdown headers (## Section Title). Follow this structure:

## Executive Overview
[3-4 sentences. Purpose of the report, key finding, and primary recommendation. This replaces a cover letter.]

## Key Findings
[3-5 findings, each as a bold statement followed by 1-2 sentences of evidence. Format:]
Finding 1: [Claim with number]
[Supporting evidence and context.]

## Detailed Analysis
[The full analysis. Use subheaders (### Subsection) if the content spans multiple topics. Mix paragraphs with data callouts.]

## Risk Assessment
[What could go wrong? 2-3 risks with likelihood and mitigation. Only include if the content warrants it.]

## Recommendations
1. [Action] - [Expected impact] - [Timeline]
2. [Action] - [Expected impact] - [Timeline]

## Appendix (if needed)
[Supporting data, methodology notes, or definitions. Only if the content is technical.]

Rules:
- 400-800 words. Quality over quantity.
- Professional, third-person tone throughout. "The data indicates" not "I think."
- Every claim should cite the evidence from the original input. No fabricated data.
- Clean structure and clear headers are essential — this will be rendered as a formatted PDF.
- If the original input is thin, acknowledge gaps: "Further analysis needed on [topic]."`,
  },
];
