"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Eye,
  ArrowRight,
  Fingerprint,
  FileText,
  Briefcase,
  Mail,
  CheckSquare,
  MessageSquare,
  Presentation,
  Lock,
} from "lucide-react";

interface SiblingOutput {
  name: string;
  slug: string;
  preview: string;
}

interface SharedData {
  outputName: string;
  outputSlug: string;
  content: string;
  createdAt: string;
  viewCount: number;
  sessionSummary: string | null;
  thoughtDepth: Record<string, unknown> | null;
  inputPreview: string | null;
  siblingOutputs: SiblingOutput[];
  totalOutputs: number;
}

const SLUG_ICONS: Record<string, typeof FileText> = {
  exec_brief: Briefcase,
  email_draft: Mail,
  action_items: CheckSquare,
  slack_message: MessageSquare,
  document_docx: FileText,
  report_pdf: Presentation,
};

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      {/* Header */}
      <nav className="sticky top-0 z-40 glass">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-dark-200 hover:text-dark-100 transition-colors"
          >
            <Fingerprint className="w-5 h-5 text-crisp-400" />
            <span className="font-bold text-sm">Crisp</span>
          </a>
          <a
            href="/app"
            className="group px-5 py-1.5 rounded-full bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-xs font-medium hover:shadow-lg hover:shadow-crisp-500/25 transition-all flex items-center gap-1.5"
          >
            Transform your own docs
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-48 rounded shimmer" />
            <div className="h-64 rounded-2xl shimmer" />
          </div>
        ) : notFound ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h1 className="text-xl font-bold text-dark-300 mb-2">
              Link expired or not found
            </h1>
            <p className="text-sm text-dark-500 mb-6">
              This shared output may have been removed.
            </p>
            <a
              href="/"
              className="px-6 py-2.5 rounded-xl bg-crisp-500/10 border border-crisp-500/20 text-crisp-400 text-sm font-medium hover:bg-crisp-500/15 transition-all"
            >
              Go to Crisp
            </a>
          </motion.div>
        ) : data ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Session context banner */}
            {data.sessionSummary && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-800/50">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-dark-500">Topic:</span>
                  <span className="text-sm text-dark-200 font-medium">
                    {data.sessionSummary}
                  </span>
                  {data.thoughtDepth &&
                    typeof data.thoughtDepth === "object" &&
                    "total" in data.thoughtDepth && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-crisp-500/10 border border-crisp-500/20 text-crisp-400 font-medium">
                        Thought Depth: {String(data.thoughtDepth.total)}/100
                      </span>
                    )}
                  <span className="text-[10px] text-dark-600 ml-auto">
                    {data.totalOutputs} formats generated
                  </span>
                </div>
              </div>
            )}

            {/* Main output */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-dark-100">
                  {data.outputName}
                </h1>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-dark-500">
                  <span>
                    Shared{" "}
                    {new Date(data.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {data.viewCount} view{data.viewCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  copied
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-dark-800 border border-dark-700/50 text-dark-300 hover:text-dark-100 hover:border-dark-600/50"
                }`}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-6 sm:p-8">
              <div className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
                {data.content}
              </div>
            </div>

            {/* Sibling outputs — show the multi-format power */}
            {data.siblingOutputs.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-semibold text-dark-300">
                    Also generated from the same input
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 text-dark-500 font-medium">
                    {data.siblingOutputs.length} more format
                    {data.siblingOutputs.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {data.siblingOutputs.map((sibling) => {
                    const Icon = SLUG_ICONS[sibling.slug] || FileText;
                    return (
                      <div
                        key={sibling.slug}
                        className="rounded-xl border border-dark-700/50 bg-dark-900/30 p-4 relative overflow-hidden group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-3.5 h-3.5 text-dark-400" />
                          <span className="text-xs font-medium text-dark-300">
                            {sibling.name}
                          </span>
                        </div>
                        <p className="text-xs text-dark-500 leading-relaxed line-clamp-2">
                          {sibling.preview}
                        </p>
                        {/* Blur overlay with CTA */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                          <a
                            href="/app"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-crisp-500/20 border border-crisp-500/30 text-crisp-400 text-[11px] font-medium"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            Sign up to see full output
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* What the input looked like */}
            {data.inputPreview && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-dark-300 mb-3">
                  The original input
                </h2>
                <div className="rounded-xl border border-dark-800/50 bg-dark-900/20 p-4">
                  <p className="text-xs text-dark-600 leading-relaxed">
                    {data.inputPreview}
                  </p>
                </div>
              </div>
            )}

            {/* Conversion CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 rounded-2xl border border-crisp-500/20 bg-crisp-500/[0.03] p-6 sm:p-8 text-center"
            >
              <h2 className="text-lg sm:text-xl font-bold text-dark-100 mb-2">
                One document in. Every format out.
              </h2>
              <p className="text-sm text-dark-400 mb-5 max-w-md mx-auto">
                This output was one of {data.totalOutputs} formats generated from
                a single input. Upload your own docs and get exec briefs,
                emails, Slack messages, and more — all in your voice.
              </p>
              <a
                href="/app"
                className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-sm font-semibold shadow-lg shadow-crisp-500/25 hover:shadow-crisp-500/40 transition-all"
              >
                Crisp It Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <p className="text-[11px] text-dark-600 mt-3">
                No credit card required. 10 free crisps per month.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </div>

      {/* Sticky bottom bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-3 glass border-t border-dark-800/50 sm:hidden">
        <a
          href="/app"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-sm font-semibold"
        >
          Transform your own docs
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
