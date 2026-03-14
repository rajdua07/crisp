"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Wand2, Loader2 } from "lucide-react";

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
  if (total >= 80) return "text-emerald-400";
  if (total >= 50) return "text-amber-400";
  return "text-red-400";
}

function getScoreBg(total: number): string {
  if (total >= 80) return "bg-emerald-400/10 border-emerald-400/20";
  if (total >= 50) return "bg-amber-400/10 border-amber-400/20";
  return "bg-red-400/10 border-red-400/20";
}

function getBarColor(score: number): string {
  if (score >= 16) return "bg-emerald-400";
  if (score >= 10) return "bg-amber-400";
  return "bg-red-400";
}

function getGlowColor(total: number): string {
  if (total >= 80) return "shadow-emerald-400/20";
  if (total >= 50) return "shadow-amber-400/20";
  return "shadow-red-400/20";
}

function getScoreLabel(total: number): string {
  if (total >= 80) return "Solid thinking";
  if (total >= 50) return "Gaps flagged";
  return "Needs work";
}

interface ThoughtDepthProps {
  score: ThoughtDepthScore;
  onEnrich?: () => void;
  isEnriching?: boolean;
}

export function ThoughtDepthIndicator({ score, onEnrich, isEnriching }: ThoughtDepthProps) {
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
        <div className={`flex items-center justify-center w-12 h-12 rounded-full border ${getScoreBg(score.total)} relative`}>
          {/* Circular progress ring */}
          <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-dark-800"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={getScoreColor(score.total)}
              initial={{ strokeDasharray: "0 126" }}
              animate={{
                strokeDasharray: `${(score.total / 100) * 126} 126`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <span className={`text-sm font-bold ${getScoreColor(score.total)} relative z-10`}>
            {score.total}
          </span>
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-dark-300 font-medium">
              Thought Depth
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getScoreBg(score.total)} ${getScoreColor(score.total)} font-medium`}>
              {getScoreLabel(score.total)}
            </span>
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
                      <span className="text-xs text-dark-400">{data.score}/20</span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.score / 20) * 100}%` }}
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

              {score.total < 80 && onEnrich && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnrich();
                  }}
                  disabled={isEnriching}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/15 hover:border-amber-400/30 disabled:opacity-50"
                >
                  {isEnriching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Enriching content...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      Enrich - boost depth before recasting
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
