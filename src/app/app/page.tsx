"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PasteZone } from "@/components/PasteZone";
import { DiffView } from "@/components/DiffView";
import { Sidebar } from "@/components/Sidebar";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  useAppStore,
  PLAN_LIMITS,
  CrispSession,
} from "@/lib/store";
import { Sparkles, Menu, AlertCircle, Star, Loader2 } from "lucide-react";
import { SafeUserButton } from "@/lib/clerk-helpers";
import { v4 as uuidv4 } from "uuid";

export default function AppPage() {
  const {
    user,
    incrementCrisps,
    addSession,
    getSession,
    toggleStarSession,
    voiceProfiles,
    activeVoiceProfileId,
    audiences,
    activeAudienceId,
    toneFormality,
    hydrateFromServer,
  } = useAppStore();

  const limits = PLAN_LIMITS[user.plan];

  const [isLoading, setIsLoading] = useState(false);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [refinedText, setRefinedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    hydrateFromServer();

    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "true") {
      setShowUpgrade(true);
    }
    const sessionId = params.get("session");
    if (sessionId) {
      loadSession(sessionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSession = (sessionId: string) => {
    const session = getSession(sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setOriginalText(session.inputText);
      setRefinedText(session.outputs[0]?.userEdits || session.outputs[0]?.content || null);
    }
  };

  const getActiveVoiceProfile = () => {
    if (activeVoiceProfileId) {
      return voiceProfiles.find((p) => p.id === activeVoiceProfileId);
    }
    return voiceProfiles.find((p) => p.isDefault);
  };

  const handleSubmit = useCallback(
    async (text: string) => {
      if (user.plan === "free" && user.crispsUsedThisMonth >= limits.crispsPerMonth) {
        setUpgradeReason(
          `You've used all ${limits.crispsPerMonth} free crisps this month.`
        );
        setShowUpgrade(true);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setOriginalText(text);
      setRefinedText(null);
      setError(null);

      const voiceProfile = getActiveVoiceProfile();
      const activeAudience = activeAudienceId
        ? audiences.find((a) => a.id === activeAudienceId)
        : null;

      try {
        const response = await fetch("/api/crisp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input_text: text,
            voice_profile: voiceProfile?.profileData || null,
            audience: activeAudience || null,
            tone_formality: toneFormality,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to process");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let collectedRefined = "";
        let collectedSummary = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let eventType = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7);
            } else if (line.startsWith("data: ") && eventType) {
              try {
                const data = JSON.parse(line.slice(6));
                if (eventType === "refined") {
                  collectedRefined = data.refined;
                  setRefinedText(data.refined);
                } else if (eventType === "summary") {
                  collectedSummary = data.summary;
                } else if (eventType === "error") {
                  setError(data.error);
                }
              } catch {
                // Skip malformed JSON
              }
              eventType = "";
            }
          }
        }

        // Save session
        if (collectedRefined) {
          const sessionId = uuidv4();
          const session: CrispSession = {
            id: sessionId,
            inputText: text,
            summary: collectedSummary || undefined,
            thoughtDepthScore: null,
            outputs: [{
              id: uuidv4(),
              outputConfig: { length: "medium", format: "default", humanify: false },
              content: collectedRefined,
              copied: false,
            }],
            createdAt: new Date().toISOString(),
          };
          addSession(session);
          setActiveSessionId(sessionId);
          incrementCrisps();
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, limits, voiceProfiles, activeVoiceProfileId, audiences, activeAudienceId, toneFormality]
  );

  const handleCalibrate = useCallback(
    async (original: string, edited: string) => {
      if (!limits.hasCalibration) return;
      try {
        await fetch("/api/calibrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            original_content: original,
            edited_content: edited,
          }),
        });
      } catch {
        // Silent fail
      }
    },
    [limits]
  );

  const handleNewCrisp = () => {
    setOriginalText(null);
    setRefinedText(null);
    setError(null);
    setActiveSessionId(null);
    setInputText("");
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const hasResults = originalText !== null && (refinedText !== null || isLoading);

  return (
    <div className="flex h-[100dvh] bg-dark-950">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewCrisp={handleNewCrisp}
        onSelectSession={loadSession}
        onOpenSettings={() => (window.location.href = "/app/settings")}
        activeSessionId={activeSessionId}
        onShowUpgrade={() => {
          setUpgradeReason("Unlock unlimited crisps and all features.");
          setShowUpgrade(true);
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 h-14 border-b border-dark-800/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors hidden lg:block"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeSessionId && (
              <button
                onClick={() => {
                  toggleStarSession(activeSessionId);
                  fetch("/api/sessions/star", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      sessionId: activeSessionId,
                      starred: !getSession(activeSessionId)?.starred,
                    }),
                  }).catch(() => {});
                }}
                className={`p-2 rounded-lg transition-all ${
                  getSession(activeSessionId)?.starred
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-dark-500 hover:text-amber-400 hover:bg-amber-500/10"
                }`}
                title={getSession(activeSessionId)?.starred ? "Unstar" : "Star this crisp"}
              >
                <Star className={`w-4 h-4 ${getSession(activeSessionId)?.starred ? "fill-current" : ""}`} />
              </button>
            )}
            {user.plan === "free" && (
              <span className="text-xs text-dark-500">
                {user.crispsUsedThisMonth}/{limits.crispsPerMonth} crisps
              </span>
            )}
            <SafeUserButton />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <AnimatePresence mode="wait">
              {!hasResults ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center min-h-[calc(100dvh-200px)]"
                >
                  <div className="w-full max-w-2xl">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center mb-8"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-dark-700/50 bg-dark-900/50 text-xs text-dark-400 mb-4">
                        <Sparkles className="w-3 h-3 text-crisp-400" />
                        Paste any AI output below
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-dark-100 mb-2">
                        Make it sound like{" "}
                        <span className="gradient-text">you</span>
                      </h1>
                      <p className="text-sm text-dark-400">
                        Paste AI-generated text. Crisp strips the AI voice and rewrites it in yours.
                      </p>
                    </motion.div>
                    <PasteZone onSubmit={handleSubmit} isLoading={isLoading} text={inputText} onTextChange={setInputText} />

                    {/* Voice indicator */}
                    {voiceProfiles.length > 0 && (
                      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-dark-500">
                        <Sparkles className="w-3 h-3 text-crisp-400/50" />
                        <span>Voice: {getActiveVoiceProfile()?.name || "Default"}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Compact paste zone for re-crisping */}
                  <PasteZone onSubmit={handleSubmit} isLoading={isLoading} text={inputText} onTextChange={setInputText} compact />

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400 flex items-center gap-3"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {/* Loading state */}
                  {isLoading && !refinedText && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-8 flex flex-col items-center gap-4"
                    >
                      <Loader2 className="w-6 h-6 text-crisp-400 animate-spin" />
                      <div className="text-center">
                        <p className="text-sm text-dark-200 font-medium">Crisping your text...</p>
                        <p className="text-xs text-dark-500 mt-1">Removing AI patterns and matching your voice</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Diff view */}
                  {originalText && refinedText && (
                    <DiffView
                      original={originalText}
                      refined={refinedText}
                      sessionId={activeSessionId || undefined}
                      onCalibrate={handleCalibrate}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={upgradeReason}
      />
    </div>
  );
}
