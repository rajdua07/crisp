import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Audience ───
export interface Audience {
  id: string;
  name: string;
  description: string;
  icon: string;
  tonePreset: {
    formality: number; // 0 = casual, 1 = formal
    warmth: number;
    detail: number; // 0 = concise, 1 = detailed
  };
}

export const DEFAULT_AUDIENCES: Audience[] = [
  { id: "ceo", name: "CEO / Board", description: "Formal, metrics-driven, concise", icon: "crown", tonePreset: { formality: 0.9, warmth: 0.3, detail: 0.3 } },
  { id: "team", name: "Team", description: "Direct, casual, actionable", icon: "users", tonePreset: { formality: 0.3, warmth: 0.7, detail: 0.5 } },
  { id: "client", name: "Client", description: "Professional, polished, clear", icon: "handshake", tonePreset: { formality: 0.7, warmth: 0.6, detail: 0.7 } },
  { id: "family", name: "Family", description: "Warm, simple, personal", icon: "heart", tonePreset: { formality: 0.1, warmth: 0.9, detail: 0.3 } },
  { id: "investor", name: "Investor", description: "Data-heavy, confident, strategic", icon: "trending-up", tonePreset: { formality: 0.8, warmth: 0.4, detail: 0.6 } },
];

// ─── Voice Profile ───
export interface VoiceProfile {
  id: string;
  name: string;
  source: "samples" | "voice" | "calibration" | "mixed";
  profileData: VoiceProfileData;
  writingSamples: string[];
  voiceTranscript?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceProfileData {
  sentence_patterns: {
    avg_length: number;
    max_length: number;
    prefers_fragments: boolean;
    opener_style: string;
    closer_style: string;
  };
  vocabulary: {
    preferred_words: string[];
    avoided_words: string[];
    formality_level: number;
    contractions: boolean;
  };
  structure: {
    paragraph_length: string;
    uses_bullets: boolean;
    uses_headers: string;
    uses_bold: string;
    punctuation_style: string;
  };
  tone: {
    warmth: number;
    directness: number;
    humor: number;
    formality_range: [number, number];
  };
  email_patterns: {
    greeting: string;
    signoff: string;
    ps_usage: boolean;
  };
  raw_analysis: string;
}

// ─── Session / Output ───
export interface CrispSession {
  id: string;
  inputText: string;
  summary?: string;
  thoughtDepthScore: Record<string, unknown> | null;
  outputs: SessionOutput[];
  chainParentId?: string;
  audienceId?: string;
  toneFormality?: number;
  createdAt: string;
}

export interface SessionOutput {
  id: string;
  outputTypeSlug: string;
  outputTypeName: string;
  content: string;
  userEdits?: string;
  copied: boolean;
  voiceProfileId?: string;
}

// ─── Custom Output Types ───
export interface CustomOutputType {
  id: string;
  name: string;
  slug: string;
  instructions: string;
  icon: string;
  defaultVoiceProfileId?: string;
  sortOrder: number;
}

// ─── User / Billing ───
export type Plan = "free" | "pro" | "team" | "enterprise";

export interface UserState {
  id?: string;
  email?: string;
  plan: Plan;
  crispsUsedThisMonth: number;
  crispsResetAt: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// ─── Store ───
interface AppState {
  // Hydration
  hydrated: boolean;
  hydrateFromServer: () => Promise<void>;

  // User
  user: UserState;
  setUser: (user: Partial<UserState>) => void;
  incrementCrisps: () => void;
  resetMonthlyUsage: () => void;

  // Voice Profiles
  voiceProfiles: VoiceProfile[];
  addVoiceProfile: (profile: VoiceProfile) => void;
  updateVoiceProfile: (id: string, updates: Partial<VoiceProfile>) => void;
  deleteVoiceProfile: (id: string) => void;
  setDefaultVoiceProfile: (id: string) => void;
  getDefaultVoiceProfile: () => VoiceProfile | undefined;

  // Audiences
  audiences: Audience[];
  addAudience: (audience: Audience) => void;
  updateAudience: (id: string, updates: Partial<Audience>) => void;
  deleteAudience: (id: string) => void;

  // Sessions (history)
  sessions: CrispSession[];
  addSession: (session: CrispSession) => void;
  getSession: (id: string) => CrispSession | undefined;

  // Custom output types
  customOutputTypes: CustomOutputType[];
  addCustomOutputType: (type: CustomOutputType) => void;
  updateCustomOutputType: (id: string, updates: Partial<CustomOutputType>) => void;
  deleteCustomOutputType: (id: string) => void;
  reorderCustomOutputTypes: (types: CustomOutputType[]) => void;

  // Active state
  activeVoiceProfileId: string | null;
  setActiveVoiceProfileId: (id: string | null) => void;
  activeAudienceId: string | null;
  setActiveAudienceId: (id: string | null) => void;
  toneFormality: number;
  setToneFormality: (value: number) => void;

  // Output type visibility/order preferences
  enabledOutputTypes: string[];
  setEnabledOutputTypes: (slugs: string[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ─── Hydration ───
      hydrated: false,
      hydrateFromServer: async () => {
        try {
          const res = await fetch("/api/user");
          if (!res.ok) return;
          const data = await res.json();

          set({
            hydrated: true,
            user: {
              id: data.user.id,
              email: data.user.email,
              plan: data.user.plan as Plan,
              crispsUsedThisMonth: data.user.crispsUsedThisMonth,
              crispsResetAt: data.user.crispsResetAt,
              stripeCustomerId: data.user.stripeCustomerId,
              stripeSubscriptionId: data.user.stripeSubscriptionId,
            },
            voiceProfiles: data.voiceProfiles,
            audiences: data.audiences,
            sessions: data.sessions,
            customOutputTypes: data.customOutputTypes,
          });
        } catch {
          // If server hydration fails, keep using local data
          set({ hydrated: true });
        }
      },

      // ─── User ───
      user: {
        plan: "free" as Plan,
        crispsUsedThisMonth: 0,
        crispsResetAt: new Date().toISOString(),
      },
      setUser: (updates) =>
        set((s) => ({ user: { ...s.user, ...updates } })),
      incrementCrisps: () =>
        set((s) => ({
          user: { ...s.user, crispsUsedThisMonth: s.user.crispsUsedThisMonth + 1 },
        })),
      resetMonthlyUsage: () =>
        set((s) => ({
          user: { ...s.user, crispsUsedThisMonth: 0, crispsResetAt: new Date().toISOString() },
        })),

      // ─── Voice Profiles ───
      voiceProfiles: [],
      addVoiceProfile: (profile) =>
        set((s) => ({ voiceProfiles: [...s.voiceProfiles, profile] })),
      updateVoiceProfile: (id, updates) =>
        set((s) => ({
          voiceProfiles: s.voiceProfiles.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deleteVoiceProfile: (id) =>
        set((s) => ({
          voiceProfiles: s.voiceProfiles.filter((p) => p.id !== id),
        })),
      setDefaultVoiceProfile: (id) =>
        set((s) => ({
          voiceProfiles: s.voiceProfiles.map((p) => ({
            ...p,
            isDefault: p.id === id,
          })),
        })),
      getDefaultVoiceProfile: () =>
        get().voiceProfiles.find((p) => p.isDefault),

      // ─── Audiences ───
      audiences: DEFAULT_AUDIENCES,
      addAudience: (audience) =>
        set((s) => ({ audiences: [...s.audiences, audience] })),
      updateAudience: (id, updates) =>
        set((s) => ({
          audiences: s.audiences.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),
      deleteAudience: (id) =>
        set((s) => ({
          audiences: s.audiences.filter((a) => a.id !== id),
        })),

      // ─── Sessions ───
      sessions: [],
      addSession: (session) =>
        set((s) => ({ sessions: [session, ...s.sessions].slice(0, 100) })),
      getSession: (id) => get().sessions.find((s) => s.id === id),

      // ─── Custom Output Types ───
      customOutputTypes: [],
      addCustomOutputType: (type) =>
        set((s) => ({ customOutputTypes: [...s.customOutputTypes, type] })),
      updateCustomOutputType: (id, updates) =>
        set((s) => ({
          customOutputTypes: s.customOutputTypes.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteCustomOutputType: (id) =>
        set((s) => ({
          customOutputTypes: s.customOutputTypes.filter((t) => t.id !== id),
        })),
      reorderCustomOutputTypes: (types) =>
        set({ customOutputTypes: types }),

      // ─── Active state ───
      activeVoiceProfileId: null,
      setActiveVoiceProfileId: (id) => set({ activeVoiceProfileId: id }),
      activeAudienceId: null,
      setActiveAudienceId: (id) => set({ activeAudienceId: id }),
      toneFormality: 0.5,
      setToneFormality: (value) => set({ toneFormality: value }),

      enabledOutputTypes: [
        "exec_brief",
        "email_draft",
        "action_items",
        "slack_message",
      ],
      setEnabledOutputTypes: (slugs) => set({ enabledOutputTypes: slugs }),
    }),
    {
      name: "crisp-storage",
    }
  )
);

// ─── Helpers ───
export const PLAN_LIMITS: Record<Plan, { crispsPerMonth: number; maxVoiceProfiles: number; maxOutputTypes: number; hasChain: boolean; hasCustomTypes: boolean; hasCalibration: boolean; maxAudiences: number }> = {
  free: { crispsPerMonth: 10, maxVoiceProfiles: 1, maxOutputTypes: 3, hasChain: false, hasCustomTypes: false, hasCalibration: false, maxAudiences: 3 },
  pro: { crispsPerMonth: Infinity, maxVoiceProfiles: 3, maxOutputTypes: 8, hasChain: true, hasCustomTypes: true, hasCalibration: true, maxAudiences: Infinity },
  team: { crispsPerMonth: Infinity, maxVoiceProfiles: 10, maxOutputTypes: 20, hasChain: true, hasCustomTypes: true, hasCalibration: true, maxAudiences: Infinity },
  enterprise: { crispsPerMonth: Infinity, maxVoiceProfiles: Infinity, maxOutputTypes: Infinity, hasChain: true, hasCustomTypes: true, hasCalibration: true, maxAudiences: Infinity },
};

export const FREE_OUTPUT_SLUGS = ["email_draft", "action_items", "slack_message"];
