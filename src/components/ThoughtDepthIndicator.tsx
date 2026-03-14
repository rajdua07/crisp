"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface ThoughtDepthScore {
  specificity: { score: number; flag?: string };
  evidence: { score: number; flag?: string };
  original_thinking: { score: number; flag?: string };
  decision_clarity: { score: number; flag?: string };
  alternatives: { score: number; flag?: string };
  total: number;
  summary: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  specificity: "Specificity",
  evidence: "Evidence",
  original_thinking: "Original Thinking",
  decision_clarity: "Decision Clarity",
  alternatives: "Alternatives",
};

function getScoreColor(total: number): string {
  if (total >= 20) return "text-emerald-400";
  if (total >= 12) return "text-amber-400";
  return "text-red-400";
}

function getScoreBg(total: number): string {
  if (total >= 20) return "bg-emerald-400/10 border-emerald-400/20";
  if (total >= 12) return "bg-amber-400/10 border-amber-400/20";
  return "bg-red-400/10 border-red-400/20";
}

function getBarColor(score: number): string {
  if (score >= 4) return "bg-emerald-400";
  if (score >= 3) return "bg-amber-400";
  return "bg-red-400";
}

function getGlowColor(total: number): string {
  if (total >= 20) return "shadow-emerald-400/20";
  if (total >= 12) return "shadow-amber-400/20";
  return "shadow-red-400/20";
}

export function ThoughtDepthIndicator({ score }: { score: ThoughtDepthScore }) {
  const [expanded, setExpanded] = useState(false);

  const dimensions = ["specificity", "evidence", "original_thinking", "decision_clarity", "alternatives"] as const;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${getScoreBg(score.total)} hover:shadow-lg ${getGlowColor(score.total)}`}
      >
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${getScoreBg(score.total)}`}>
          <span className={`text-lg font-bold ${getScoreColor(score.total)}`}>
            {score.total}
          </span>
        </div>
        <div className="flex-1 text-left">
          <div className="text-xs uppercase tracking-wider text-dark-300 font-medium">
            Thought Depth
          </div>
          <div className="text-sm text-dark-200 mt-0.5 line-clamp-1">
            {score.summary}
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-dark-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-3 px-1 space-y-2.5">
              {dimensions.map((dim) => {
                const data = score[dim];
                return (
                  <div key={dim} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-300 font-medium">
                        {DIMENSION_LABELS[dim]}
                      </span>
                      <span className="text-xs text-dark-400">{data.score}/5</span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.score / 5) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={`h-full rounded-full ${getBarColor(data.score)}`}
                      />
                    </div>
                    {data.flag && (
                      <p className="text-xs text-dark-400 italic">{data.flag}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
