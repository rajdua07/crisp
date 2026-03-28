# Crisp Simplification Plan

## Overview
Replace 12 output types with a simpler model: length + format hint + humanify toggle.
Voice profiles become audience-aware ("how I talk to investors" vs "how I talk to friends").

---

## Phase 1: Simplify Output Model

### New Output Config
```typescript
interface OutputConfig {
  length: "short" | "medium" | "long";
  format: "default" | "voice_note" | "sms";
  humanify: boolean;
}
```

Users can still generate **multiple outputs** per submission (e.g. short + medium + long).

### Files to change:

#### 1. `src/lib/output-types.ts` - Gutted and replaced
- Remove all 12 type definitions
- Export new `OutputConfig` interface
- Export length/format option definitions
- Export function to generate prompt instructions from an OutputConfig

#### 2. `src/lib/prompts.ts` - Update buildRecastPrompt
- Change signature: accept `OutputConfig` instead of `outputTypeName` + `outputTypeInstructions`
- Generate instructions dynamically:
  - Length: word count targets (short ~50-100, medium ~200-400, long ~600+)
  - Format: voice note (conversational, filler words OK) / SMS (ultra short, abbreviations) / default
  - Humanify: insert natural imperfections - casual typos, skipped commas, sentence fragments, "gonna/wanna", lowercase starts

#### 3. `src/app/api/crisp/route.ts` - Main API
- Accept `outputs: OutputConfig[]` instead of `output_types: string[]`
- Generate one output per config
- Store config as JSON in SessionOutput

#### 4. `src/app/api/crisp/demo/route.ts` - Demo route
- Generate 3 demo outputs: short/medium/long at default format

#### 5. `src/app/api/crisp/chain/route.ts` - Chain route
- Accept OutputConfig instead of slugs

#### 6. `src/app/api/crisp/tweak/route.ts` - Tweak route
- Accept OutputConfig for context

#### 7. `src/components/PasteZone.tsx` - New UI
- Replace output type toggle grid with:
  - Length selector: Short / Medium / Long radio buttons (can multi-select to generate all)
  - Format hint: Default / Voice Note / SMS radio (single select)
  - Humanify toggle: on/off switch
- Cleaner, simpler interface

#### 8. `src/components/OutputCard.tsx` - Update display
- Remove DOCUMENT_OUTPUT_SLUGS reference
- Show output label based on config (e.g. "Short" / "Medium - Voice Note" / "Long - Humanified")
- Add download buttons: Copy / Download DOCX / Download PDF / Open in Google Docs

#### 9. `src/app/app/page.tsx` - Main page
- Update output mapping from slug-based to config-based
- Remove FREE_OUTPUT_SLUGS gating (plan limits move to usage count, not type restrictions)

#### 10. `src/lib/store.ts` - State
- Replace `enabledOutputTypes: string[]` with `outputConfigs: OutputConfig[]`
- Update SessionOutput interface: replace `outputTypeSlug`/`outputTypeName` with `outputConfig: OutputConfig`
- Remove FREE_OUTPUT_SLUGS
- Remove CustomOutputType interface

#### 11. `prisma/schema.prisma` - Database
- SessionOutput: add `outputConfig Json` field, keep old slug fields nullable for migration
- Remove CustomOutputType model (or deprecate)
- Template: change `outputTypes Json` from string[] to OutputConfig[]

#### 12. Remove `src/components/CustomOutputTypeManager.tsx`
- No longer needed - voice profiles per audience replace this

---

## Phase 2: Audience-Aware Voice Profiles (Follow-up)

### Concept
Voice profiles become "how I communicate with [audience]":
- "Investor pitch voice" (writing samples from investor emails)
- "Friend group voice" (casual texts, group chats)
- "Boss/leadership voice" (formal memos, updates)
- "Client voice" (professional but warm)

### Changes needed:
- Link VoiceProfile to Audience in schema (1:1 or many:1)
- Onboarding flow: "Share how you talk to..." with audience presets
- VoiceProfileEditor: create voice per audience context
- Auto-select voice when user picks an audience

### This is a separate PR - not included in Phase 1.

---

## Phase 3: Onboarding Flow (Follow-up)

- New user lands on setup wizard
- Steps: "How do you write to your team?" → "How about clients?" → "Investors?"
- Each step: paste samples or record voice
- Creates audience-linked voice profiles
- Skip any audience they don't need

### This is a separate PR - not included in Phase 1.

---

## Migration Strategy
- Add new `outputConfig` JSON column to SessionOutput
- Keep old `outputTypeSlug`/`outputTypeName` columns nullable
- Existing sessions still render with old slug data
- New sessions use outputConfig
- No destructive migration needed

## What Gets Simpler
- PasteZone: 3 controls instead of 12+ toggles
- API: one instruction generator instead of 12 instruction blocks
- Store: no more slug arrays, custom types, type management
- Pricing: gate on usage count, not feature types
