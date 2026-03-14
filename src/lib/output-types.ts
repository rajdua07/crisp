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
    name: "Slide Content",
    icon: "presentation",
    description: "Headline + 3 bullets",
    instructions: `Headline (max 8 words) + 3 supporting bullets (max 12 words each). The headline should be a claim, not a topic. "Revenue grew 23% in Q2" not "Q2 Revenue Update." Bullets should support the headline claim.`,
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
];
