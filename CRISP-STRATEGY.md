# CRISP — Product Strategy & Build Plan

**Domain:** crispit.ai
**Tagline:** *AI gave you the draft. Crisp makes it yours.*
**One-liner:** Paste any AI output. Get it instantly recast into every format you need — in your voice — in 5 seconds.

---

## The Problem

Every knowledge worker using ChatGPT, Claude, or Gemini hits the same wall: they get a 2,000-word AI dump and then spend 20-30 minutes re-prompting it into the formats they actually need. An email for their boss. A Slack message for the team. Action items for Monday. A slide for the deck. A one-pager for the client.

Most people don't re-prompt at all. They just forward the raw AI output — and that's how "AI slop" spreads through organizations. Generic, bloated, sounds-like-everyone-else content that nobody reads past the first paragraph.

**The data:**
- $9.1M/year lost per 10,000-person company dealing with AI-generated content issues (HBR, 2024)
- 1 hour 56 minutes average time spent per instance of "workslop" — AI output that needs human rework (BCG)
- 47% of workers report spending more time editing AI output than it would have taken to write from scratch (CNBC)
- Zero tools exist for the *receiving* end of AI content

## The Insight

The problem isn't that AI writes badly. It's that AI writes *once* and people need it *six ways*. And it never sounds like them.

Crisp solves both problems simultaneously: **one input → many outputs → all in your voice.**

---

## Product Overview

### Core Experience

**Left panel:** Paste zone. Drop any AI-generated content — ChatGPT output, Claude response, Gemini draft, or any AI-generated text.

**Right panel:** Output cards that generate simultaneously. Each card is a different format of the same content, rewritten in your voice:

| Output Card | What It Does | Who Uses It |
|---|---|---|
| **Exec Brief** | 3-sentence summary a CEO would read | Founders, managers |
| **Email Draft** | Ready-to-send stakeholder email | Everyone |
| **Action Items** | Who does what by when | Project leads |
| **Slide Content** | Headline + 3 bullets for a deck | Presenters |
| **Decision Needed** | The actual question buried in the AI dump | Decision-makers |
| **Slack Message** | Casual, scannable, team-appropriate | Teams |
| **Client One-Pager** | Polished external-facing summary | Agencies, consultants |
| **Social Post** | LinkedIn/Twitter-ready version | Content creators |

Each card generates in 2-3 seconds. Click any card to expand, edit, and copy. The whole experience takes 5 seconds instead of 20 minutes of re-prompting.

### Thought Depth Score

Before recasting, Crisp silently evaluates the input across 5 dimensions:

1. **Specificity** — Does it name real things, or hide behind vague language? ("leverage AI" vs "deploy GPT-4 for customer ticket routing")
2. **Evidence** — Are claims supported? Numbers, sources, examples?
3. **Original Thinking** — Is there a genuine insight, or is this generic AI advice anyone could get?
4. **Decision Clarity** — Does it tell you what to DO, or just describe the landscape?
5. **Alternatives Considered** — Were tradeoffs weighed, or is this a one-sided pitch?

Each dimension scores 1-5. Total score out of 25. Displayed as a simple color indicator:
- **Green (20-25):** Solid thinking. Recast outputs will be high quality.
- **Yellow (12-19):** Gaps flagged. Recast outputs will note what's missing.
- **Red (1-11):** This is slop. Crisp tells you what needs human thinking before it's worth recasting.

This is the moat. Other tools reshape content. Crisp tells you if the content is *worth* reshaping.

---

## Voice DNA — The Killer Feature

### What It Is

In Settings, users build a Voice Profile — a persistent model of how they write and speak. Every recast output comes out sounding like them, not like ChatGPT.

### Three Input Methods

**1. Paste Samples**
Drop 3-5 real writing samples: emails you've sent, Slack messages, LinkedIn posts, proposals. Crisp analyzes patterns: sentence length, formality, vocabulary, openers/closers, structure preferences.

**2. Voice Recording**
Hit record and talk for 60-90 seconds about anything. "Here's how I'd normally explain our Q2 strategy to the team..." Crisp transcribes and captures your *spoken* voice — which is usually more natural and more "you" than how people write. This is the secret weapon.

**3. Live Calibration**
Crisp shows you a recast output and asks: "Does this sound like you?" You tweak it. After 5-10 tweaks, it locks in your style with high accuracy. Every future edit teaches Crisp more.

### What Crisp Learns

Not just "casual" or "professional" — structural patterns:
- You start emails with context, not greetings
- You use short declarative sentences when making a point
- You never use "leverage," "synergy," or "circle back"
- You end Slack messages with a direct question
- You use dashes instead of semicolons
- Your paragraphs are 2-3 sentences max

### Multiple Voice Profiles

- **Personal voice** — default for most outputs
- **Board voice** — formal, metrics-heavy, used for exec briefs
- **Team voice** — casual, direct, used for Slack messages
- **Brand voice** — company tone for external content
- **Client voice** — polished, professional, used for client-facing docs

Users assign default voice profiles per output type. Exec Brief always uses "board voice." Slack always uses "team voice." Fully configurable.

---

## The Chain Feature

Paste once → recast → edit one output → recast *that* into further formats.

**Example flow:**
1. Paste a 2,000-word ChatGPT strategy doc
2. Crisp generates 6 output cards
3. Edit the "Exec Brief" to add a specific number
4. Click "Chain" on the edited Exec Brief
5. Crisp generates: Board email, Talking points, Calendar invite description — all from the refined brief, all in your voice

Each step preserves context from the original. No re-prompting. No lost context. That's something you cannot do in ChatGPT.

---

## Competitive Landscape

| Tool | What It Does | Why Crisp Is Different |
|---|---|---|
| **Hemingway App** | Readability scoring, highlights complex sentences | Scores readability but doesn't rewrite. Input-only, no multi-format output. |
| **Grammarly** | Grammar, tone, clarity suggestions | Fixes errors in existing text. Doesn't transform into new formats. |
| **Jasper / Copy.ai** | AI content generation | Creates from scratch. Doesn't take existing AI output and transform it. |
| **Wordtune** | Sentence-level rewording | Rewrites sentences, not documents. No multi-format output. |
| **QuillBot** | Paraphrasing tool | Rephrases same content. Doesn't create new format types. |
| **ChatGPT / Claude** | General AI chat | Can do everything but requires re-prompting for each format. No persistent voice. No parallel outputs. |

**Crisp's unique position:** Nobody does multi-purpose instant recasting of existing AI output with persistent voice matching. The input isn't "write me something" — it's "I already have something, make it useful in 6 different contexts simultaneously, in my voice."

---

## Target Market

### Primary: TrueScaler Clients (Beachhead)
- Agency owners, consultants, coaches scaling past $50K/month
- Constantly switching between client-facing, team, and personal communication
- Drowning in AI-generated strategy docs, marketing plans, content calendars from team members and clients
- Need the same idea expressed in 3+ different voices within the same hour

### Secondary: Knowledge Workers at Scale
- Product managers writing specs, emails, Slack updates, and presentations from the same research
- Founders communicating the same strategy to board, team, investors, and customers
- Marketing teams repurposing AI-generated content across channels

### Tertiary: Content Creators
- YouTube creators repurposing scripts into posts, newsletters, and community updates
- Newsletter writers reformatting for multiple platforms

---

## Pricing

### Free Tier
- 10 crisps per month
- 3 output card types (Email, Action Items, Slack Message)
- Basic Voice DNA (paste samples only)
- Thought Depth Score on every paste

### Pro — $19/month
- Unlimited crisps
- All output card types
- Full Voice DNA (paste + voice recording + live calibration)
- 3 voice profiles
- Chain feature
- Custom output card types

### Team — $39/user/month
- Everything in Pro
- Shared brand voice profiles
- Team voice library
- Admin dashboard
- Usage analytics
- Priority processing

### Enterprise — Custom
- SSO / SAML
- Custom integrations (Slack, email, Notion)
- Dedicated voice training
- API access
- SLA

### Revenue Model

**Target: $100K MRR in 6 months**

| Month | Free Users | Pro ($19) | Team ($39) | MRR |
|---|---|---|---|---|
| 1-2 | 500 | 50 | 0 | $950 |
| 3 | 2,000 | 200 | 20 | $4,580 |
| 4 | 5,000 | 500 | 50 | $11,450 |
| 5 | 10,000 | 1,000 | 150 | $24,850 |
| 6 | 20,000 | 2,500 | 400 | $63,100 |

Conservative conversion: 5% free→Pro, 1% free→Team

---

## Technical Architecture

### Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion
- **Backend:** Next.js API routes
- **AI:** Claude API (Anthropic) for recasting + voice matching
- **Voice Processing:** Whisper API (OpenAI) for voice clip transcription
- **Database:** PostgreSQL (Supabase) for user data, voice profiles
- **Auth:** Clerk or NextAuth
- **Payments:** Stripe
- **Hosting:** Vercel

### AI Architecture

**Voice DNA Processing:**
1. User provides writing samples → Claude analyzes patterns → stores as structured Voice Profile (JSON)
2. User records voice clip → Whisper transcribes → Claude analyzes spoken patterns → merges with written profile
3. On each recast, Voice Profile is injected into the system prompt as style constraints

**Recasting Engine:**
1. User pastes AI content
2. Thought Depth Score generated (single Claude call with structured output)
3. All output cards generated in parallel (one Claude call per card, concurrent)
4. Each call receives: original content + output type instructions + user's Voice Profile + Thought Depth context
5. Results streamed to UI as they complete

**Prompt Architecture (simplified):**
```
System: You are a content transformer. Your job is to take AI-generated content
and recast it into a specific format while matching the user's personal voice.

Voice Profile:
{voice_profile_json}

Output Type: {email_draft | exec_brief | action_items | etc.}
Output Type Instructions: {format-specific rules}

Thought Depth Context:
{depth_score and gaps identified}

User's Input:
{pasted AI content}

Rules:
- Match the voice profile exactly — sentence length, vocabulary, structure
- If Thought Depth Score flagged gaps, note them naturally in the output
- Never add information that wasn't in the original
- Be concise — the whole point is the user wants a shorter, more targeted version
```

### Data Model

```
User
├── id, email, name, plan
├── voice_profiles[] (JSON — patterns, vocabulary, structure rules)
├── custom_output_types[] (name, instructions, default_voice_profile)
└── usage (crisps_this_month, crisps_total)

CrispSession
├── id, user_id, created_at
├── input_text (original pasted content)
├── thought_depth_score (JSON — 5 dimensions)
├── outputs[]
│   ├── type (email_draft, exec_brief, etc.)
│   ├── content (generated output)
│   ├── voice_profile_used
│   └── user_edits (for calibration learning)
└── chain_parent_id (nullable — links to parent session for chains)
```

---

## 90-Day Build Plan

### Phase 1: MVP (Weeks 1-3)
**Goal:** Working paste → recast flow with 4 output types

- Landing page at crispit.ai
- Paste input area + 4 output cards (Email, Action Items, Exec Brief, Slack)
- Basic Claude API integration for recasting
- Thought Depth Score (visual indicator only)
- Simple auth (Clerk)
- Free tier only (10 crisps/month)
- Ship to 50 TrueScaler clients for feedback

### Phase 2: Voice DNA (Weeks 4-6)
**Goal:** Voice matching that actually works

- Paste samples UI in settings
- Voice recording + Whisper transcription
- Voice Profile generation and storage
- Voice-matched recast outputs
- Live calibration loop (edit → learn)
- Multiple voice profiles
- Pro tier launch ($19/month)
- Stripe integration

### Phase 3: Growth Features (Weeks 7-10)
**Goal:** Team features + viral loop

- All 8 output card types
- Custom output card creation
- Chain feature
- Team voice profiles (shared brand voice)
- Team tier launch ($39/user/month)
- Chrome extension (highlight AI text on any page → Crisp it)
- Referral system (give 5 free crisps, get 5)

### Phase 4: Scale (Weeks 11-13)
**Goal:** Distribution + retention

- Slack integration (paste in Slack → get Crisp'd outputs in thread)
- Email integration (forward AI content → get Crisp'd versions back)
- API for developers
- Usage analytics dashboard
- Enterprise features (SSO, admin)
- Content marketing: "The AI Slop Report" — weekly analysis of how AI content is being misused in business

---

## GTM Strategy

### Week 1-2: Soft Launch (TrueScaler Network)
- Ship MVP to 50 TrueScaler clients
- Personal onboarding calls with 10 power users
- Collect Voice DNA from real users to validate the feature
- Iterate based on feedback

### Week 3-4: Content-Led Launch
- "I built a tool that fixes AI slop" — LinkedIn post (Raj's personal brand)
- Demo video: paste ChatGPT output → watch 6 outputs appear in real-time
- Product Hunt launch
- TrueScaler newsletter feature

### Week 5-8: Community Growth
- Free tier drives word-of-mouth (10 crisps/month is enough to get hooked)
- "Crisp it" becomes a verb in the TrueScaler community
- Partner with AI educators / course creators for co-promotion
- Twitter/LinkedIn content showing before/after (raw AI dump → Crisp'd outputs)

### Week 9-13: Paid Acquisition
- Retarget free users who hit the 10-crisp limit
- LinkedIn ads targeting agency owners, consultants, PMs
- "Stop forwarding ChatGPT dumps to your clients" messaging
- Case studies from TrueScaler early adopters

---

## Why This Wins

1. **Timing.** AI adoption is at peak hype but AI output quality complaints are rising fast. "AI slop" is a mainstream term. The problem is fully felt but zero tools address it from the receiver's side.

2. **Wedge.** TrueScaler's existing network provides 50-100 day-one users who already feel this pain and trust Raj's recommendations. No cold start problem.

3. **Voice DNA is the moat.** Anyone can build a reformatter. Nobody else has your voice. The more you use Crisp, the better it sounds like you, the harder it is to leave. Same lock-in mechanism that made Grammarly a $13B company.

4. **"Crisp it" as a verb.** The best products become verbs — Google it, Slack them, Crisp it. The product name IS the action. That's viral by design.

5. **Blue ocean.** Hemingway does readability. Grammarly does grammar. Jasper does generation. Nobody does multi-format instant recasting with voice matching. This is a new category.

---

*Built for TrueScaler clients. Designed to kill AI slop.*
