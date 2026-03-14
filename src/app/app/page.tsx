"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PasteZone } from "@/components/PasteZone";
import { OutputCard } from "@/components/OutputCard";
import {
  ThoughtDepthIndicator,
  ThoughtDepthScore,
} from "@/components/ThoughtDepthIndicator";
import { Sidebar } from "@/components/Sidebar";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  useAppStore,
  PLAN_LIMITS,
  FREE_OUTPUT_SLUGS,
  CrispSession,
} from "@/lib/store";
import { ALL_OUTPUT_TYPES } from "@/lib/output-types";
import { Sparkles, Menu, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface OutputResult {
  type: string;
  name: string;
  content: string;
}

export default function AppPage() {
  const {
    user,
    incrementCrisps,
    addSession,
    getSession,
    voiceProfiles,
    activeVoiceProfileId,
    enabledOutputTypes,
    customOutputTypes,
    audiences,
    activeAudienceId,
    toneFormality,
  } = useAppStore();

  const limits = PLAN_LIMITS[user.plan];

  const [isLoading, setIsLoading] = useState(false);
  const [outputs, setOutputs] = useState<OutputResult[]>([]);
  const [thoughtDepth, setThoughtDepth] = useState<ThoughtDepthScore | null>(null);
  const [loadingTypes, setLoadingTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chainSource, setChainSource] = useState<string | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [lastInputText, setLastInputText] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check for upgrade/session query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "true") {
      setShowUpgrade(true);
    }
    const sessionId = params.get("session");
    if (sessionId) {
      loadSession(sessionId);
    }
    if (params.get("upgraded")) {
      // Could show a success toast
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSession = (sessionId: string) => {
    const session = getSession(sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setOutputs(
        session.outputs.map((o) => ({
          type: o.outputTypeSlug,
          name: o.outputTypeName,
          content: o.userEdits || o.content,
        }))
      );
      setThoughtDepth(session.thoughtDepthScore as ThoughtDepthScore | null);
      setChainSource(null);
    }
  };

  const getActiveVoiceProfile = () => {
    if (activeVoiceProfileId) {
      return voiceProfiles.find((p) => p.id === activeVoiceProfileId);
    }
    return voiceProfiles.find((p) => p.isDefault);
  };

  const getActiveOutputSlugs = () => {
    if (user.plan === "free") {
      return enabledOutputTypes.filter((s) => FREE_OUTPUT_SLUGS.includes(s));
    }
    return enabledOutputTypes;
  };

  const handleSubmit = useCallback(
    async (inputText: string) => {
      // Check usage limits
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
      setOutputs([]);
      setThoughtDepth(null);
      setError(null);
      setChainSource(null);
      setLastInputText(inputText);

      const activeSlugs = getActiveOutputSlugs();
      setLoadingTypes(activeSlugs);

      const voiceProfile = getActiveVoiceProfile();
      const activeAudience = activeAudienceId
        ? audiences.find((a) => a.id === activeAudienceId)
        : null;

      try {
        const response = await fetch("/api/crisp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input_text: inputText,
            output_types: activeSlugs,
            voice_profile: voiceProfile?.profileData || null,
            custom_types: customOutputTypes.filter((t) =>
              activeSlugs.includes(t.slug)
            ),
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
        const collectedOutputs: OutputResult[] = [];
        let collectedDepth: ThoughtDepthScore | null = null;

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
                if (eventType === "thought_depth") {
                  collectedDepth = data;
                  setThoughtDepth(data);
                } else if (eventType === "output") {
                  collectedOutputs.push(data);
                  setOutputs((prev) => [...prev, data]);
                  setLoadingTypes((prev) => prev.filter((t) => t !== data.type));
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
        const sessionId = uuidv4();
        const session: CrispSession = {
          id: sessionId,
          inputText,
          thoughtDepthScore: collectedDepth as Record<string, unknown> | null,
          outputs: collectedOutputs.map((o) => ({
            id: uuidv4(),
            outputTypeSlug: o.type,
            outputTypeName: o.name,
            content: o.content,
            copied: false,
          })),
          chainParentId: chainSource || undefined,
          createdAt: new Date().toISOString(),
        };
        addSession(session);
        setActiveSessionId(sessionId);
        incrementCrisps();
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
        setLoadingTypes([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, limits, enabledOutputTypes, customOutputTypes, voiceProfiles, activeVoiceProfileId, chainSource, audiences, activeAudienceId, toneFormality]
  );

  const handleChain = useCallback(
    (content: string) => {
      if (!limits.hasChain) {
        setUpgradeReason("Chain feature is available on Pro and above.");
        setShowUpgrade(true);
        return;
      }
      setChainSource(activeSessionId);
      // The user can now paste the content into the paste zone or we auto-trigger
      // For now, we'll auto-submit the chain
      handleSubmit(content);
    },
    [limits, activeSessionId, handleSubmit]
  );

  const handleCalibrate = useCallback(
    async (original: string, edited: string) => {
      if (!limits.hasCalibration) return;

      try {
        const res = await fetch("/api/calibrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            original_content: original,
            edited_content: edited,
          }),
        });

        if (res.ok) {
          // Calibration adjustments received — in production, merge into voice profile
          // For now, just log success
        }
      } catch {
        // Silent fail for calibration
      }
    },
    [limits]
  );

  const handleEnrich = useCallback(async () => {
    if (!lastInputText || !thoughtDepth) return;

    setIsEnriching(true);
    setError(null);

    try {
      const res = await fetch("/api/crisp/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_text: lastInputText,
          thought_depth: thoughtDepth,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Enrichment failed");
      }

      const { enriched_text } = await res.json();
      // Re-submit with enriched content
      handleSubmit(enriched_text);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsEnriching(false);
    }
  }, [lastInputText, thoughtDepth, handleSubmit]);

  const handleNewCrisp = () => {
    setOutputs([]);
    setThoughtDepth(null);
    setError(null);
    setActiveSessionId(null);
    setChainSource(null);
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const hasResults = outputs.length > 0 || thoughtDepth || isLoading;

  const allTypes = [...ALL_OUTPUT_TYPES, ...customOutputTypes.map((ct) => ({
    slug: ct.slug,
    name: ct.name,
    icon: ct.icon,
    description: ct.instructions.slice(0, 50),
    instructions: ct.instructions,
  }))];

  return (
    <div className="flex h-screen bg-dark-950">
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
        <div className="flex items-center justify-between px-6 h-14 border-b border-dark-800/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            {chainSource && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-crisp-500/10 border border-crisp-500/20 text-xs text-crisp-400">
                <Sparkles className="w-3 h-3" />
                Chaining from previous output
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user.plan === "free" && (
              <span className="text-xs text-dark-500">
                {user.crispsUsedThisMonth}/{limits.crispsPerMonth} crisps
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crisp-500 to-crisp-600 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              {!hasResults ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"
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
                        What do you need to{" "}
                        <span className="gradient-text">Crisp</span>?
                      </h1>
                      <p className="text-sm text-dark-400">
                        Drop a ChatGPT dump, Claude response, or any AI-generated text.
                      </p>
                    </motion.div>
                    <PasteZone onSubmit={handleSubmit} isLoading={isLoading} text={inputText} onTextChange={setInputText} />

                    {/* Quick stats */}
                    <div className="flex items-center justify-center gap-6 mt-8 text-xs text-dark-500">
                      <span>
                        {getActiveOutputSlugs().length} output types active
                      </span>
                      {voiceProfiles.length > 0 && (
                        <span>
                          Voice: {getActiveVoiceProfile()?.name || "Default"}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid lg:grid-cols-[1fr_1.2fr] gap-8"
                >
                  {/* Left — Paste zone + Thought Depth */}
                  <div className="space-y-5">
                    <PasteZone onSubmit={handleSubmit} isLoading={isLoading} text={inputText} onTextChange={setInputText} />
                    {thoughtDepth && (
                      <ThoughtDepthIndicator
                        score={thoughtDepth}
                        onEnrich={handleEnrich}
                        isEnriching={isEnriching}
                      />
                    )}
                  </div>

                  {/* Right — Output cards */}
                  <div className="space-y-4">
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

                    {outputs.map((output, i) => {
                      const typeInfo = allTypes.find(
                        (t) => t.slug === output.type
                      );
                      return (
                        <OutputCard
                          key={output.type}
                          type={output.type}
                          name={output.name}
                          icon={typeInfo?.icon || "briefcase"}
                          content={output.content}
                          index={i}
                          onChain={handleChain}
                          onCalibrate={handleCalibrate}
                          showChain={limits.hasChain}
                        />
                      );
                    })}

                    {loadingTypes.map((slug, i) => {
                      const typeInfo = allTypes.find((t) => t.slug === slug);
                      return (
                        <OutputCard
                          key={`loading-${slug}`}
                          type={slug}
                          name={typeInfo?.name || slug}
                          icon={typeInfo?.icon || "briefcase"}
                          content=""
                          index={outputs.length + i}
                          isLoading
                        />
                      );
                    })}
                  </div>
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
