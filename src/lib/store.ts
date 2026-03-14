import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  thoughtDepthScore: Record<string, unknown> | null;
  outputs: SessionOutput[];
  chainParentId?: string;
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
  plan: Plan;
  crispsUsedThisMonth: number;
  crispsResetAt: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// ─── Store ───
interface AppState {
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

  // Active voice profile for current session
  activeVoiceProfileId: string | null;
  setActiveVoiceProfileId: (id: string | null) => void;

  // Output type visibility/order preferences
  enabledOutputTypes: string[];
  setEnabledOutputTypes: (slugs: string[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
export const PLAN_LIMITS: Record<Plan, { crispsPerMonth: number; maxVoiceProfiles: number; maxOutputTypes: number; hasChain: boolean; hasCustomTypes: boolean; hasCalibration: boolean }> = {
  free: { crispsPerMonth: 10, maxVoiceProfiles: 1, maxOutputTypes: 3, hasChain: false, hasCustomTypes: false, hasCalibration: false },
  pro: { crispsPerMonth: Infinity, maxVoiceProfiles: 3, maxOutputTypes: 8, hasChain: true, hasCustomTypes: true, hasCalibration: true },
  team: { crispsPerMonth: Infinity, maxVoiceProfiles: 10, maxOutputTypes: 20, hasChain: true, hasCustomTypes: true, hasCalibration: true },
  enterprise: { crispsPerMonth: Infinity, maxVoiceProfiles: Infinity, maxOutputTypes: Infinity, hasChain: true, hasCustomTypes: true, hasCalibration: true },
};

export const FREE_OUTPUT_SLUGS = ["email_draft", "action_items", "slack_message"];
