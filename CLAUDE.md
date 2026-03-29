# Crisp - Project Context

## What This Is

Crisp (crispit.ai) is an AI content reformatter. Users paste raw AI output (from ChatGPT, Claude, etc.) and get it instantly recast into multiple useful formats - exec briefs, emails, Slack messages, action items, slide decks, etc. - all in their personal writing voice.

The core insight: AI gives you the substance but in the wrong shape. Crisp reshapes it.

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, Tailwind CSS
- **AI**: Anthropic Claude API (claude-haiku-4-5-20251001) via @anthropic-ai/sdk
- **Database**: PostgreSQL (Supabase) via Prisma ORM
- **Auth**: Clerk
- **Payments**: Stripe
- **State**: Zustand
- **Exports**: jsPDF (PDF), docx (DOCX)
- **Hosting**: Vercel

## Architecture - How Input Becomes Output

```
User pastes AI content → POST /api/crisp/route.ts (SSE stream)
  ├── Score thought depth (Claude call, 5 dimensions, /100)
  ├── Generate 3-6 word summary (Claude call)
  └── For each selected output type (parallel Claude calls):
        buildRecastPrompt() assembles:
          system identity + voice profile + audience + tone
          + output type instructions + AI crutch rules + input
        → Claude generates formatted output
        → SSE event streamed to client
        → Persisted to DB (Session + SessionOutput records)
```

## Key Files

| File | What It Does |
|------|-------------|
| `src/lib/prompts.ts` | All Claude prompts. System prompt builder, thought depth scorer, voice analyzer, AI crutch rules. THE BRAIN. |
| `src/lib/output-types.ts` | Definitions + instructions for all 12 output types. Each type's instructions are injected into the prompt. |
| `src/app/api/crisp/route.ts` | Main API endpoint. Orchestrates thought depth → summary → parallel output generation. SSE streaming. |
| `src/app/api/crisp/demo/route.ts` | Demo endpoint (unauthenticated, 3000 char limit on input). |
| `src/app/app/page.tsx` | Main app UI. PasteZone left, OutputCards right. |
| `src/lib/store.ts` | Zustand state. User, voice profiles, sessions, plan limits. |
| `src/lib/auth.ts` | getOrCreateUser(), getPlanLimits(). Clerk-based. |
| `src/components/PasteZone.tsx` | Input textarea + output type selector + submit. |
| `src/components/OutputCard.tsx` | Individual output display. Expand, edit, copy, share, chain. |
| `prisma/schema.prisma` | Database schema. |

## Output Types (12 total)

**Default 4** (free tier): exec_brief, email_draft, action_items, slack_message

**Extended** (pro): decision_needed, slide_content, client_one_pager, social_post, text_message, voice_note_script, formatted_document (DOCX), pdf_report (PDF)

Users can also create custom output types with their own instructions.

## Critical Design Decisions

### 1. Extract, Don't Invent
Every output type's job is to EXTRACT and REFORMAT what's in the input. Never fabricate deadlines, names, meetings, next steps, or context. If it's not in the input, it doesn't exist. Flag gaps with `[OWNER?]`, `[DATE?]`, etc.

### 2. Name Things, Don't Count Them
Say "story-driven, biblical, question-format voiceover options" NOT "three voiceover options." The specific names ARE the value. This applies to every output type.

### 3. Include Substance, Not Meta-Descriptions
BAD: "Got a detailed reel script with three voiceover options."
GOOD: "reel script: LOST JOB OFFER to $10M arc - voiceover: story-driven, Moses/biblical, or question hook"

### 4. Slack = Full Content for Review
Slack output should include the actual substance (scripts, options, specs) so the team can review in-channel. A 20-line Slack with details beats a 5-line Slack that makes everyone ask for the original.

### 5. AI Crutch Elimination
Banned patterns in all output: false contrasts ("Not X, it's Y"), throat-clearing ("Here's the thing"), empty intensifiers ("literally", "very"), corporate speak ("leverage", "synergize"), dramatic setups ("What if I told you"). Full list in `AI_CRUTCH_RULES` in prompts.ts.

### 6. No Markdown in Output
Output is displayed as plain text. Use UPPERCASE and spacing for emphasis, never **bold**, *italic*, or ## headers. Exception: DOCX and PDF types use markdown headers for document structure.

### 7. No Em Dashes
Always use regular hyphens (-), never em dashes (—).

## Voice DNA System

Users train voice profiles from writing samples or voice recordings. The profile captures:
- Sentence patterns (length, fragments, openers, closers)
- Vocabulary (preferred words, avoided words, contractions)
- Structure (paragraph length, bullets, headers, bold usage)
- Tone (warmth, directness, humor, formality range)
- Email patterns (greeting style, signoff, PS usage)

Voice profile JSON is injected into every prompt. Claude must match the voice exactly.

## Database Schema (Key Tables)

- **User**: Clerk auth, plan tier, monthly usage counter
- **VoiceProfile**: Voice DNA data (JSON), writing samples, linked to user
- **Audience**: Target audience presets with formality/warmth/detail sliders
- **Session**: One per "Crisp it" action. Stores input, thought depth score, summary
- **SessionOutput**: One per output type per session. Stores generated content + user edits
- **Calibration**: Original vs user-edited content, for refining voice profiles
- **CustomOutputType**: User-created output formats with custom instructions
- **Template**: Saved output type + audience + tone combos
- **SharedOutput**: Public share links with view counts

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| POST `/api/crisp` | Main recast (SSE stream) |
| POST `/api/crisp/demo` | Demo recast (no auth, 3000 char limit) |
| POST `/api/crisp/chain` | Recast from a previous output |
| POST `/api/crisp/tweak` | Minor edits to output |
| POST `/api/crisp/enrich` | Add detail to output |
| POST `/api/crisp/quick-rewrite` | Fast voice-matched rewrite |
| POST `/api/calibrate` | Process user edits for voice learning |
| POST `/api/voice-profile/analyze` | Analyze writing samples |
| POST `/api/voice-profile/transcribe` | Transcribe voice recording |
| POST `/api/feedback` | Thumbs up/down on outputs |
| POST `/api/share` | Create public share link |

## Environment Variables Required

- `ANTHROPIC_API_KEY` - Claude API (core functionality)
- `DATABASE_URL` / `DIRECT_URL` - PostgreSQL (Supabase)
- `NEXT_PUBLIC_CLERK_*` / `CLERK_SECRET_KEY` - Authentication
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Payments
- `NEXT_PUBLIC_APP_URL` - Base URL

## Running Locally

```bash
npm install
npx prisma generate
npx prisma db push  # or migrate
npm run dev
```

## Current max_tokens Settings

| Endpoint | max_tokens | Notes |
|----------|-----------|-------|
| Main outputs | 2048 | Per output type |
| Demo outputs | 2048 | Per output type |
| Thought depth | 500 | JSON scoring |
| Summary | 30 | 3-6 word theme |
| Enrich | 4000 | Content expansion |
| Quick rewrite | 2000 | Voice-matched |
| Tweak | 2048 | Minor edits |
| Chain | 1024 | Recast from output |
| Calibration | 1000 | Voice delta analysis |
| Voice analysis | 1500 | Pattern extraction |
