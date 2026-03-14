# CRISP — Technical Build Spec (Claude Code Handoff)

## What You're Building

Crisp (crispit.ai) is a web app where users paste AI-generated content and instantly get it recast into multiple formats (email, exec brief, action items, Slack message, etc.) — all in the user's personal voice/writing style.

Think: Hemingway App meets a universal AI output reformatter with persistent voice matching.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Framer Motion for animations
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Voice Transcription:** OpenAI Whisper API
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Payments:** Stripe
- **Hosting:** Vercel

---

## Pages & Routes

### `/` — Landing Page
- Hero: "AI gave you the draft. Crisp makes it yours."
- Demo animation showing paste → 6 output cards appearing
- Pricing section (Free / Pro $19 / Team $39)
- CTA: "Crisp It Free" → sign up

### `/app` — Main App (authenticated)
- **Left panel:** Large paste textarea with "Crisp It" button
- **Right panel:** Grid of output cards (2 columns on desktop, 1 on mobile)
- Each card shows: output type icon, title, generated content preview
- Click card → expands to full view with edit + copy buttons
- Top bar: Thought Depth Score indicator (color dot + score out of 25)
- Bottom of expanded card: "Chain →" button to recast this output further

### `/app/settings` — Settings
- **Your Voice tab:**
  - "Paste Samples" section — textarea to drop 3-5 writing samples + "Analyze" button
  - "Record Voice" section — record button, 90-second limit, shows transcription after
  - "Voice Profiles" list — create/edit/delete profiles, set defaults per output type
  - Each profile shows: name, source (samples/voice/calibration), last updated
- **Output Types tab:**
  - List of all output card types (default + custom)
  - Create custom output type: name + instructions + default voice profile
  - Reorder output cards (drag and drop)
- **Account tab:**
  - Plan info, usage (X crisps used this month)
  - Billing (Stripe customer portal link)

### `/app/history` — History
- List of past CrispSessions
- Click to re-open (shows original input + all outputs)
- Search/filter by date

---

## Database Schema (Supabase)

```sql
-- Users (extended from Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  crisps_used_this_month INTEGER DEFAULT 0,
  crisps_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice Profiles
CREATE TABLE voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Personal", "Board", "Team"
  source TEXT CHECK (source IN ('samples', 'voice', 'calibration', 'mixed')),
  profile_data JSONB NOT NULL, -- structured voice patterns
  writing_samples TEXT[], -- raw samples stored for re-analysis
  voice_transcript TEXT, -- transcription of voice recording
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Output Type Configs
CREATE TABLE output_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Email Draft", "Exec Brief"
  slug TEXT NOT NULL, -- e.g., "email_draft"
  instructions TEXT NOT NULL, -- prompt instructions for this type
  default_voice_profile_id UUID REFERENCES voice_profiles(id),
  is_system BOOLEAN DEFAULT false, -- true for built-in types
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crisp Sessions
CREATE TABLE crisp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  thought_depth_score JSONB, -- { specificity: 4, evidence: 2, ... total: 18 }
  chain_parent_id UUID REFERENCES crisp_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Outputs (one per output card)
CREATE TABLE session_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES crisp_sessions(id) ON DELETE CASCADE,
  output_type_slug TEXT NOT NULL,
  voice_profile_id UUID REFERENCES voice_profiles(id),
  content TEXT NOT NULL,
  user_edits TEXT, -- if user edited before copying, store for calibration
  copied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Routes

### `POST /api/crisp` — Main recast endpoint
**Input:**
```json
{
  "input_text": "paste content here...",
  "output_types": ["email_draft", "exec_brief", "action_items", "slack_message"],
  "voice_profile_id": "uuid-or-null"
}
```

**Process:**
1. Check user auth + usage limits
2. Generate Thought Depth Score (single Claude call)
3. For each output type, fire a concurrent Claude call with:
   - The input text
   - Output type instructions
   - User's Voice Profile (if set)
   - Thought Depth context
4. Stream results back as they complete (use SSE or streaming response)
5. Save CrispSession + SessionOutputs to DB
6. Increment user's crisps_used_this_month

**Response:** Server-Sent Events stream
```
event: thought_depth
data: {"specificity":4,"evidence":2,"original_thinking":3,"decision_clarity":4,"alternatives":2,"total":15}

event: output
data: {"type":"email_draft","content":"Hey team, ..."}

event: output
data: {"type":"exec_brief","content":"Q2 strategy focuses on..."}

event: done
data: {"session_id":"uuid"}
```

### `POST /api/voice-profile/analyze` — Analyze writing samples
**Input:**
```json
{
  "samples": ["email text 1...", "slack message 2...", "linkedin post 3..."],
  "name": "Personal Voice"
}
```

**Process:**
1. Send samples to Claude with voice analysis prompt
2. Extract structured patterns (see Voice Profile Schema below)
3. Save to voice_profiles table

### `POST /api/voice-profile/transcribe` — Process voice recording
**Input:** Audio file (webm/mp3)
**Process:**
1. Send to Whisper API for transcription
2. Send transcription to Claude for voice pattern analysis
3. Merge with existing profile or create new one

### `POST /api/crisp/chain` — Chain a recast output
**Input:**
```json
{
  "parent_session_id": "uuid",
  "source_output_id": "uuid",
  "edited_content": "user's edited version of the output",
  "output_types": ["board_email", "talking_points"]
}
```

### `POST /api/calibrate` — Learn from user edits
**Input:**
```json
{
  "output_id": "uuid",
  "original_content": "what Crisp generated",
  "edited_content": "what the user changed it to"
}
```

**Process:**
1. Claude analyzes diff between original and edited
2. Extracts new voice patterns from the edits
3. Updates the Voice Profile incrementally

---

## Voice Profile Schema (JSONB)

```json
{
  "sentence_patterns": {
    "avg_length": 12,
    "max_length": 25,
    "prefers_fragments": false,
    "opener_style": "context_first",
    "closer_style": "direct_question"
  },
  "vocabulary": {
    "preferred_words": ["ship", "move", "nail"],
    "avoided_words": ["leverage", "synergy", "circle back", "deep dive"],
    "formality_level": 0.4,
    "contractions": true
  },
  "structure": {
    "paragraph_length": "2-3 sentences",
    "uses_bullets": false,
    "uses_headers": "rarely",
    "uses_bold": "for emphasis only",
    "punctuation_style": "dashes over semicolons"
  },
  "tone": {
    "warmth": 0.7,
    "directness": 0.9,
    "humor": 0.3,
    "formality_range": [0.2, 0.6]
  },
  "email_patterns": {
    "greeting": "none or first name only",
    "signoff": "— Raj",
    "ps_usage": false
  },
  "raw_analysis": "Claude's full natural language analysis of the voice"
}
```

---

## AI Prompts

### Thought Depth Scoring Prompt

```
You are evaluating AI-generated content for thought depth. Score each dimension 1-5.

Dimensions:
1. SPECIFICITY (1-5): Does it name real things, or hide behind vague language?
   - 1: "We should leverage AI" / 2: "We should use AI for operations"
   - 3: "We should use AI for customer support" / 4: "We should deploy a chatbot for tier-1 tickets"
   - 5: "We should deploy GPT-4 via Intercom for tier-1 billing tickets, targeting 40% deflection by Q3"

2. EVIDENCE (1-5): Are claims supported with numbers, sources, examples?
   - 1: No data / 3: Some numbers but unsourced / 5: Specific data with sources or real examples

3. ORIGINAL THINKING (1-5): Is there a genuine insight, or generic advice anyone could get?
   - 1: "Focus on your customers" / 3: Industry-specific but common advice
   - 5: A non-obvious connection or counterintuitive recommendation

4. DECISION CLARITY (1-5): Does it tell you what to DO, or just describe the landscape?
   - 1: Pure description / 3: Recommendations without prioritization
   - 5: Clear "do this first, then this" with rationale

5. ALTERNATIVES CONSIDERED (1-5): Were tradeoffs weighed?
   - 1: One-sided / 3: Mentions alternatives briefly / 5: Genuine pros/cons with recommended path

Return JSON only:
{
  "specificity": { "score": N, "flag": "brief note if score <= 2" },
  "evidence": { "score": N, "flag": "..." },
  "original_thinking": { "score": N, "flag": "..." },
  "decision_clarity": { "score": N, "flag": "..." },
  "alternatives": { "score": N, "flag": "..." },
  "total": N,
  "summary": "One sentence overall assessment"
}
```

### Recasting Prompt (per output type)

```
You are Crisp, a content transformer. Take AI-generated content and recast it into
a {output_type} while precisely matching the user's voice profile.

=== VOICE PROFILE ===
{voice_profile_json}

=== OUTPUT TYPE: {type_name} ===
{type_specific_instructions}

=== THOUGHT DEPTH CONTEXT ===
Score: {total}/25
Gaps: {flagged dimensions}

=== RULES ===
- Match the voice profile EXACTLY — mimic sentence length, vocabulary, structure
- Never add information not present in the original
- If thought depth gaps were flagged, note them naturally (e.g., "Note: the original
  didn't specify which customers — you may want to clarify before sending")
- Be concise — the user wants a shorter, more targeted version
- Use the user's preferred vocabulary, not generic AI language
- Match their punctuation style, greeting style, and structural preferences

=== INPUT CONTENT ===
{pasted_ai_content}

Generate the {output_type} now. Return only the output, no meta-commentary.
```

### Output Type Instructions

**Email Draft:**
```
Format as a ready-to-send email. Include subject line. Match the user's email
patterns (greeting style, signoff, paragraph structure). Keep under 200 words
unless the content requires more. Lead with the key point.
```

**Exec Brief:**
```
3 sentences maximum. First sentence: what this is about. Second sentence:
the key finding or recommendation. Third sentence: what needs to happen next.
No fluff, no context-setting. A CEO should be able to read this in 10 seconds.
```

**Action Items:**
```
Bulleted list format. Each item starts with a verb. Include who/what/when
where possible. If the original doesn't specify owners or deadlines, flag
with [OWNER?] or [BY WHEN?]. Max 7 items — prioritize ruthlessly.
```

**Slack Message:**
```
Casual, scannable. Max 4 lines. Use line breaks between thoughts. No formal
greeting or signoff. End with a clear ask or next step. Can use emoji sparingly
if the user's voice profile suggests it.
```

**Decision Needed:**
```
State the actual decision buried in the content as a clear question.
Then list 2-3 options with one-line tradeoffs for each.
Format: "The decision: [question]" then "Option A: ... / Option B: ..."
```

**Slide Content:**
```
Headline (max 8 words) + 3 supporting bullets (max 12 words each).
The headline should be a claim, not a topic. "Revenue grew 23% in Q2"
not "Q2 Revenue Update." Bullets should support the headline claim.
```

**Client One-Pager:**
```
Professional, polished, external-facing. 150-250 words. Start with the
key insight or recommendation. Use the brand voice profile if available,
otherwise the user's default voice at +1 formality level. No internal
jargon. End with a clear next step or call to action.
```

**Social Post:**
```
LinkedIn-optimized. Hook in the first line (pattern interrupt or bold claim).
Short paragraphs (1-2 sentences). Personal angle where possible. End with
engagement prompt (question or CTA). 150-300 words for LinkedIn, <280 chars
for Twitter variant. Include both versions.
```

---

## UI Components

### PasteZone
- Large textarea, auto-expanding
- Placeholder: "Paste any AI output here..."
- Character count
- "Crisp It" button (primary CTA, large)
- Loading state: button pulses, cards start appearing one by one

### OutputCard
- Collapsed: icon + type name + first 2 lines of content + copy button
- Expanded: full content + edit mode + copy + "Chain →" button
- Edit mode: contentEditable with save button (triggers calibration)
- Skeleton loading state while generating

### ThoughtDepthIndicator
- Circular badge with color (green/yellow/red) + score number
- Click to expand: shows 5 dimension bars with flags
- Tooltip on each dimension explaining what it means

### VoiceProfileEditor
- Tab group: Paste Samples | Record Voice | Calibrate
- Samples: multi-textarea with "Add another sample" button
- Record: microphone button with waveform visualization + timer
- Profile preview: shows extracted patterns in human-readable format
- Test button: generates a sample recast so user can verify voice match

### OutputTypeManager
- Sortable list of output types
- Each row: drag handle + icon + name + default voice + edit/delete
- "Add Custom Type" button → modal with name + instructions fields

---

## Build Order (for Claude Code)

### Sprint 1: Core Flow
1. Next.js project setup with Tailwind + Clerk + Supabase
2. Landing page
3. Main app layout (paste zone + output card grid)
4. `/api/crisp` endpoint with Claude integration
5. 4 default output types (Email, Action Items, Exec Brief, Slack)
6. Basic streaming of results to UI
7. Copy to clipboard on each card

### Sprint 2: Voice DNA
8. Settings page layout
9. Voice profile — paste samples flow
10. `/api/voice-profile/analyze` endpoint
11. Voice profile storage in Supabase
12. Inject voice profile into recast prompts
13. Voice recording UI + Whisper integration
14. Multiple voice profiles + assignment to output types

### Sprint 3: Depth + Polish
15. Thought Depth Score integration
16. Score display UI (indicator + expanded view)
17. Chain feature (recast from a recast)
18. Session history page
19. Calibration loop (edit tracking → voice profile updates)
20. All 8 output types
21. Custom output type creation

### Sprint 4: Monetization
22. Stripe integration (checkout + customer portal)
23. Usage tracking + limits (10 free crisps/month)
24. Pro tier unlock (unlimited + all features)
25. Team tier (shared voice profiles, admin)
26. Upgrade prompts when hitting limits

---

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=  # for Whisper
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID=
```

---

## Key UX Details

- Output cards should appear one at a time as they stream in (not all at once)
- Each card has a subtle entrance animation (fade up + scale)
- The paste zone should accept drag-and-drop text
- Keyboard shortcut: Cmd+Enter to Crisp It
- After copying, show a brief "Copied!" toast
- Mobile: paste zone is full-width, output cards stack vertically
- Dark mode from day one (target audience works late)
- The "Crisp It" button should feel satisfying to click (haptic-style animation)
