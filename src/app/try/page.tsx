"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ArrowRight,
  Fingerprint,
  Briefcase,
  Mail,
  CheckSquare,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/Logo";

/**
 * /try — Zero-auth demo page.
 *
 * Visitors paste AI text and instantly see sample outputs.
 * No login required. Uses a public demo endpoint.
 * Goal: get to the "aha" moment in under 30 seconds.
 */

const SAMPLE_INPUT = `Based on our comprehensive analysis of the Q2 market dynamics and leveraging our cross-functional synergies, I would recommend a multi-pronged approach to customer acquisition that focuses on optimizing our value proposition across key verticals. The data suggests that our current churn rate of 4.2% is above the industry benchmark of 3.1%, and our revenue of $2.1M represents an 18% increase quarter-over-quarter. Moving forward, we should prioritize three strategic initiatives: first, implementing a targeted retention program for at-risk accounts; second, expanding our enterprise sales motion into the healthcare vertical; and third, investing in product-led growth features that reduce time-to-value for new users.`;

const OUTPUT_FORMATS = [
  {
    slug: "exec_brief",
    name: "CEO Brief",
    icon: Briefcase,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  {
    slug: "email_draft",
    name: "Email",
    icon: Mail,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    slug: "action_items",
    name: "Actions",
    icon: CheckSquare,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    slug: "slack_message",
    name: "Slack",
    icon: MessageSquare,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
];

export default function TryPage() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("exec_brief");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCrisp = async () => {
    const text = input.trim() || SAMPLE_INPUT;
    if (text.length < 30) return;

    setStatus("loading");
    setOutputs({});
    setActiveTab("exec_brief");

    try {
      const response = await fetch("/api/crisp/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_text: text }),
      });

      if (!response.ok) throw new Error("Failed");

      // Stream SSE events
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type && data.content) {
                setOutputs((prev) => ({ ...prev, [data.type]: data.content }));
                // Auto-switch to the first output that arrives
                if (Object.keys(outputs).length === 0) {
                  setActiveTab(data.type);
                }
              }
            } catch {
              // skip malformed events
            }
          }
        }
      }

      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  const handleUseSample = () => {
    setInput(SAMPLE_INPUT);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopy = async (slug: string) => {
    const text = outputs[slug];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      // fallback
    }
  };

  const activeOutput = outputs[activeTab] || null;

  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      {/* Header */}
      <nav className="sticky top-0 z-40 glass">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Logo size="small" />
          </a>
          <a
            href="/app"
            className="px-4 py-1.5 rounded-full bg-dark-800 border border-dark-700/50 text-dark-300 text-xs font-medium hover:text-dark-100 hover:border-dark-600/50 transition-all"
          >
            Sign in
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 sm:py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Paste AI text. Get{" "}
            <span className="gradient-text">every format.</span>
          </h1>
          <p className="text-dark-400 text-sm">
            No signup needed. See what Crisp does in 30 seconds.
          </p>
        </motion.div>

        {/* Input area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-dark-500" />
              <span className="text-xs text-dark-500 font-medium">
                Paste AI output from ChatGPT, Claude, or any LLM
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your AI-generated text here..."
              className="w-full h-32 sm:h-40 bg-transparent text-sm text-dark-200 placeholder-dark-700 resize-none outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-800/50">
              <button
                onClick={handleUseSample}
                className="text-xs text-dark-600 hover:text-dark-400 transition-colors"
              >
                or use a sample
              </button>
              <button
                onClick={handleCrisp}
                disabled={status === "loading"}
                className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-sm font-semibold shadow-lg shadow-crisp-500/25 hover:shadow-crisp-500/40 transition-all disabled:opacity-50"
              >
                {status === "loading" ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Crisping...
                  </>
                ) : (
                  <>
                    Crisp It
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Output area */}
        <AnimatePresence>
          {(status === "loading" || status === "done") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Format tabs */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                {OUTPUT_FORMATS.map((fmt) => {
                  const hasOutput = !!outputs[fmt.slug];
                  return (
                    <button
                      key={fmt.slug}
                      onClick={() => hasOutput && setActiveTab(fmt.slug)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        activeTab === fmt.slug
                          ? `${fmt.bg} border ${fmt.border} ${fmt.color}`
                          : hasOutput
                          ? "bg-dark-900/30 border border-dark-700/50 text-dark-400 hover:text-dark-200"
                          : "bg-dark-900/20 border border-dark-800/30 text-dark-700"
                      }`}
                    >
                      <fmt.icon className="w-3.5 h-3.5" />
                      {fmt.name}
                      {!hasOutput && status === "loading" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active output */}
              <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5 sm:p-6 min-h-[200px]">
                {activeOutput ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-3.5 h-3.5 text-crisp-400" />
                        <span className="text-[10px] text-crisp-400/60 uppercase tracking-wider font-medium">
                          Rewritten in a natural voice
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(activeTab)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          copiedSlug === activeTab
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-dark-800 border border-dark-700/50 text-dark-400 hover:text-dark-200"
                        }`}
                      >
                        {copiedSlug === activeTab ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedSlug === activeTab ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
                      {activeOutput}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <Sparkles className="w-5 h-5 text-crisp-400/40 mx-auto mb-2 animate-spin" />
                      <p className="text-xs text-dark-600">
                        Generating outputs...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Signup CTA after seeing results */}
              {status === "done" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 rounded-2xl border border-crisp-500/20 bg-crisp-500/[0.03] p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-base font-bold text-dark-100 mb-1">
                        That was without your voice.
                      </h3>
                      <p className="text-xs text-dark-400 leading-relaxed">
                        Sign up free to set up Voice DNA — Crisp will match
                        your sentence patterns, tone, vocabulary, and style.
                        Plus get DOCX/PDF exports, templates, and 12+ output
                        formats.
                      </p>
                    </div>
                    <a
                      href="/app"
                      className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-sm font-semibold shadow-lg shadow-crisp-500/25 hover:shadow-crisp-500/40 transition-all whitespace-nowrap"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Add Your Voice
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
