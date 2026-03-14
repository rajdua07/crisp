"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { PasteZone } from "@/components/PasteZone";
import { OutputCard } from "@/components/OutputCard";
import {
  ThoughtDepthIndicator,
  ThoughtDepthScore,
} from "@/components/ThoughtDepthIndicator";
import { DEFAULT_OUTPUT_TYPES } from "@/lib/output-types";
import { Sparkles } from "lucide-react";

interface OutputResult {
  type: string;
  name: string;
  content: string;
}

export default function AppPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [outputs, setOutputs] = useState<OutputResult[]>([]);
  const [thoughtDepth, setThoughtDepth] = useState<ThoughtDepthScore | null>(
    null
  );
  const [loadingTypes, setLoadingTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (inputText: string) => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setOutputs([]);
    setThoughtDepth(null);
    setError(null);
    setLoadingTypes(DEFAULT_OUTPUT_TYPES.map((t) => t.slug));

    try {
      const response = await fetch("/api/crisp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_text: inputText,
          output_types: DEFAULT_OUTPUT_TYPES.map((t) => t.slug),
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
                setThoughtDepth(data);
              } else if (eventType === "output") {
                setOutputs((prev) => [...prev, data]);
                setLoadingTypes((prev) =>
                  prev.filter((t) => t !== data.type)
                );
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
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
      setLoadingTypes([]);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const hasResults = outputs.length > 0 || thoughtDepth;

  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      {/* App Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/">
            <Logo size="small" />
          </a>
          <div className="flex items-center gap-3">
            <span className="text-xs text-dark-500 hidden sm:block">
              Free plan
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crisp-500 to-crisp-600 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!hasResults ? (
            /* Empty state — centered paste zone */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]"
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
                    What do you need to <span className="gradient-text">Crisp</span>?
                  </h1>
                  <p className="text-sm text-dark-400">
                    Drop a ChatGPT dump, Claude response, or any AI-generated
                    text.
                  </p>
                </motion.div>
                <PasteZone onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
            </motion.div>
          ) : (
            /* Results view — two columns */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid lg:grid-cols-[1fr_1.2fr] gap-8"
            >
              {/* Left — Paste zone + Thought Depth */}
              <div className="space-y-5">
                <PasteZone onSubmit={handleSubmit} isLoading={isLoading} />
                {thoughtDepth && (
                  <ThoughtDepthIndicator score={thoughtDepth} />
                )}
              </div>

              {/* Right — Output cards */}
              <div className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400"
                  >
                    {error}
                  </motion.div>
                )}

                {outputs.map((output, i) => {
                  const typeInfo = DEFAULT_OUTPUT_TYPES.find(
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
                    />
                  );
                })}

                {loadingTypes.map((slug, i) => {
                  const typeInfo = DEFAULT_OUTPUT_TYPES.find(
                    (t) => t.slug === slug
                  );
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
  );
}
