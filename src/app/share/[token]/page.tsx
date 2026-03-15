"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Sparkles, Eye } from "lucide-react";

interface SharedData {
  outputName: string;
  content: string;
  createdAt: string;
  viewCount: number;
}

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
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
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-dark-200 hover:text-dark-100 transition-colors">
            <Sparkles className="w-5 h-5 text-crisp-400" />
            <span className="font-bold text-sm">Crisp</span>
          </a>
          <a
            href="/"
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-xs font-medium hover:shadow-lg hover:shadow-crisp-500/25 transition-all"
          >
            Try Crisp Free
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
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
            <h1 className="text-xl font-bold text-dark-300 mb-2">Link expired or not found</h1>
            <p className="text-sm text-dark-500 mb-6">This shared output may have been removed.</p>
            <a
              href="/"
              className="px-6 py-2.5 rounded-xl bg-crisp-500/10 border border-crisp-500/20 text-crisp-400 text-sm font-medium hover:bg-crisp-500/15 transition-all"
            >
              Go to Crisp
            </a>
          </motion.div>
        ) : data ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-dark-100">{data.outputName}</h1>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-dark-500">
                  <span>
                    Shared {new Date(data.createdAt).toLocaleDateString("en-US", {
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
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-6 sm:p-8">
              <div className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
                {data.content}
              </div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-dark-500 mb-3">
                Made with Crisp — transform AI drafts into your voice
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-sm font-medium shadow-lg shadow-crisp-500/25 hover:shadow-crisp-500/40 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Crisp It Free
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
