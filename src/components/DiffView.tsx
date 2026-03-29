"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import {
  Copy,
  Check,
  Pencil,
  Save,
  X,
  Sparkles,
  Loader2,
  Send,
  ThumbsUp,
  ThumbsDown,
  Download,
  Share2,
  Link,
  ArrowLeftRight,
} from "lucide-react";

interface DiffViewProps {
  original: string;
  refined: string;
  sessionId?: string;
  onCalibrate?: (original: string, edited: string) => void;
}

// Simple word-level diff
interface DiffSegment {
  type: "same" | "added" | "removed";
  text: string;
}

function computeWordDiff(original: string, refined: string): DiffSegment[] {
  const origWords = original.split(/(\s+)/);
  const refWords = refined.split(/(\s+)/);

  // LCS-based diff for reasonable-length texts
  const m = origWords.length;
  const n = refWords.length;

  // For very long texts, fall back to simple side-by-side
  if (m * n > 500000) {
    return [
      { type: "removed", text: original },
      { type: "added", text: refined },
    ];
  }

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origWords[i - 1] === refWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const segments: DiffSegment[] = [];
  let i = m, j = n;

  const rawSegments: DiffSegment[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1] === refWords[j - 1]) {
      rawSegments.unshift({ type: "same", text: origWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawSegments.unshift({ type: "added", text: refWords[j - 1] });
      j--;
    } else {
      rawSegments.unshift({ type: "removed", text: origWords[i - 1] });
      i--;
    }
  }

  // Merge consecutive segments of the same type
  for (const seg of rawSegments) {
    if (segments.length > 0 && segments[segments.length - 1].type === seg.type) {
      segments[segments.length - 1].text += seg.text;
    } else {
      segments.push({ ...seg });
    }
  }

  return segments;
}

export function DiffView({ original, refined, sessionId, onCalibrate }: DiffViewProps) {
  const [viewMode, setViewMode] = useState<"diff" | "sideBySide" | "refined">("diff");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(refined);
  const [tweaking, setTweaking] = useState(false);
  const [tweakPrompt, setTweakPrompt] = useState("");
  const [tweakLoading, setTweakLoading] = useState(false);
  const [tweakedContent, setTweakedContent] = useState<string | null>(null);
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [showDownNudge, setShowDownNudge] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const displayContent = tweakedContent || refined;

  const diffSegments = useMemo(
    () => computeWordDiff(original, displayContent),
    [original, displayContent]
  );

  // Count changes
  const changeCount = useMemo(() => {
    let additions = 0;
    let removals = 0;
    for (const seg of diffSegments) {
      if (seg.type === "added") additions++;
      if (seg.type === "removed") removals++;
    }
    return { additions, removals, total: additions + removals };
  }, [diffSegments]);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = editing ? editContent : displayContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [displayContent, editContent, editing]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditContent(displayContent);
    setViewMode("refined");
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    setTweakedContent(editContent);
    if (editContent !== displayContent && onCalibrate) {
      onCalibrate(displayContent, editContent);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    setEditContent(refined);
  };

  const handleTweak = async () => {
    if (!tweakPrompt.trim() || tweakLoading) return;
    setTweakLoading(true);
    try {
      const res = await fetch("/api/crisp/tweak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: displayContent,
          instruction: tweakPrompt.trim(),
          output_config: { type: "refine" },
        }),
      });
      if (!res.ok) throw new Error();
      const { tweaked_content } = await res.json();
      setTweakedContent(tweaked_content);
      setEditContent(tweaked_content);
      setTweakPrompt("");
      setTweaking(false);
    } catch {
      // silent
    } finally {
      setTweakLoading(false);
    }
  };

  const handleDownload = useCallback(async (format: "docx" | "pdf", e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(format);
    try {
      const { exportToDocx, exportToPdf } = await import("@/lib/document-export");
      const branding = useAppStore.getState().documentBranding;
      const filename = `crisp-refined-${Date.now()}`;
      if (format === "docx") {
        await exportToDocx(displayContent, filename, branding);
      } else {
        await exportToPdf(displayContent, filename, branding);
      }
    } catch {
      // silent
    } finally {
      setDownloading(null);
    }
  }, [displayContent, downloading]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!sessionId || sharing) return;
    setSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          outputLabel: "Crisped",
          outputConfig: { type: "refine" },
          content: displayContent,
        }),
      });
      if (!res.ok) throw new Error();
      const { shareToken } = await res.json();
      const shareUrl = `${window.location.origin}/share/${shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {
      // silent
    } finally {
      setSharing(false);
    }
  }, [sessionId, displayContent, sharing]);

  const handleRating = (value: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    if (rating === value) {
      setRating(null);
      setShowDownNudge(false);
      return;
    }
    setRating(value);
    if (value === "up") {
      setShowDownNudge(false);
      if (displayContent !== refined && onCalibrate) {
        onCalibrate(refined, displayContent);
      }
    } else {
      setShowDownNudge(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border border-dark-700/50 bg-dark-900/50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-dark-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-crisp-400" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-100 text-sm">Crisped</h3>
            <span className="text-[10px] text-dark-500">
              {changeCount.total} changes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View mode toggle */}
          <div className="flex items-center bg-dark-800/50 rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setViewMode("diff")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                viewMode === "diff"
                  ? "bg-crisp-500/15 text-crisp-400"
                  : "text-dark-500 hover:text-dark-300"
              }`}
            >
              Diff
            </button>
            <button
              onClick={() => setViewMode("sideBySide")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                viewMode === "sideBySide"
                  ? "bg-crisp-500/15 text-crisp-400"
                  : "text-dark-500 hover:text-dark-300"
              }`}
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode("refined")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                viewMode === "refined"
                  ? "bg-crisp-500/15 text-crisp-400"
                  : "text-dark-500 hover:text-dark-300"
              }`}
            >
              Clean
            </button>
          </div>

          {editing ? (
            <>
              <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                <Save className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleCancelEdit} className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleEdit} className="p-2 rounded-lg bg-dark-800 text-dark-500 hover:text-dark-200 hover:bg-dark-700 transition-all">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setTweaking(!tweaking); }}
                className={`p-2 rounded-lg transition-all ${
                  tweaking ? "bg-crisp-500/10 text-crisp-400" : "bg-dark-800 text-dark-500 hover:text-crisp-400 hover:bg-crisp-500/10"
                }`}
                title="Tweak with AI"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  copied ? "bg-emerald-500/10 text-emerald-400" : "bg-dark-800 text-dark-400 hover:text-dark-200 hover:bg-dark-700"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleDownload("docx", e)}
                disabled={downloading === "docx"}
                className="p-2 rounded-lg bg-dark-800 text-dark-500 hover:text-dark-200 hover:bg-dark-700 transition-all"
                title="Download as DOCX"
              >
                {downloading === "docx" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              </motion.button>
              {sessionId && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  disabled={sharing}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    shared ? "bg-emerald-500/10 text-emerald-400" : "bg-dark-800 text-dark-500 hover:text-dark-200 hover:bg-dark-700"
                  }`}
                  title={shared ? "Link copied!" : "Share"}
                >
                  {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : shared ? <Link className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tweak input */}
      <AnimatePresence>
        {tweaking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-dark-800/50"
          >
            <div className="flex items-center gap-2 p-3 bg-dark-800/30">
              <Sparkles className="w-3.5 h-3.5 text-crisp-400 flex-shrink-0" />
              <input
                type="text"
                value={tweakPrompt}
                onChange={(e) => setTweakPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleTweak(); }
                  if (e.key === "Escape") { setTweaking(false); setTweakPrompt(""); }
                }}
                placeholder="e.g. Make shorter, change tone, more casual..."
                className="flex-1 bg-transparent text-sm text-dark-200 placeholder-dark-500 focus:outline-none"
                autoFocus
                disabled={tweakLoading}
              />
              <button
                onClick={handleTweak}
                disabled={!tweakPrompt.trim() || tweakLoading}
                className="p-1.5 rounded-lg bg-crisp-500/10 text-crisp-400 hover:bg-crisp-500/20 transition-colors disabled:opacity-40"
              >
                {tweakLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { setTweaking(false); setTweakPrompt(""); }}
                className="p-1.5 rounded-lg text-dark-500 hover:text-dark-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="p-3 sm:p-5">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-dark-800/50 border border-dark-600/50 rounded-xl p-4 text-sm text-dark-200 leading-relaxed resize-none min-h-[200px] focus:outline-none focus:border-crisp-500/30 transition-colors"
                rows={Math.max(8, editContent.split("\n").length)}
              />
              <p className="text-[10px] text-dark-500 mt-2">
                Edit to match your voice. Saving teaches Crisp your style.
              </p>
            </motion.div>
          ) : viewMode === "diff" ? (
            <motion.div key="diff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-sm leading-relaxed whitespace-pre-wrap"
            >
              {diffSegments.map((seg, i) => {
                if (seg.type === "same") {
                  return <span key={i} className="text-dark-200">{seg.text}</span>;
                }
                if (seg.type === "removed") {
                  return (
                    <span key={i} className="bg-red-500/15 text-red-400/80 line-through decoration-red-500/40">
                      {seg.text}
                    </span>
                  );
                }
                return (
                  <span key={i} className="bg-emerald-500/15 text-emerald-300">
                    {seg.text}
                  </span>
                );
              })}
            </motion.div>
          ) : viewMode === "sideBySide" ? (
            <motion.div key="side" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <div className="text-[10px] uppercase tracking-widest text-dark-500 font-medium mb-2">Original</div>
                <div className="text-sm text-dark-400 leading-relaxed whitespace-pre-wrap p-3 rounded-xl bg-dark-800/30 border border-dark-800/50">
                  {original}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-crisp-400/70 font-medium mb-2">Crisped</div>
                <div className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap p-3 rounded-xl bg-crisp-500/5 border border-crisp-500/10">
                  {displayContent}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="clean" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap"
            >
              {displayContent}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback bar */}
        {!editing && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-800/50">
            <span className="text-[10px] text-dark-500">
              {rating === "up"
                ? "Thanks! This helps Crisp learn your voice."
                : rating === "down" && showDownNudge
                ? "Try tweaking it, then thumbs up when it's right."
                : "Does this sound like you?"}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleRating("up", e)}
                className={`p-1.5 rounded-lg transition-all ${
                  rating === "up" ? "bg-emerald-500/10 text-emerald-400" : "text-dark-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => handleRating("down", e)}
                className={`p-1.5 rounded-lg transition-all ${
                  rating === "down" ? "bg-red-500/10 text-red-400" : "text-dark-500 hover:text-red-400 hover:bg-red-500/10"
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Nudge to tweak after thumbs down */}
        <AnimatePresence>
          {showDownNudge && rating === "down" && !editing && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 mt-2"
            >
              <button
                onClick={() => { setShowDownNudge(false); setTweaking(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-crisp-500/10 border border-crisp-500/20 text-crisp-400 text-[11px] font-medium hover:bg-crisp-500/15 transition-all"
              >
                <Sparkles className="w-3 h-3" />
                Tweak with AI
              </button>
              <button
                onClick={(e) => { setShowDownNudge(false); handleEdit(e); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700/50 text-dark-300 text-[11px] font-medium hover:text-dark-200 transition-all"
              >
                <Pencil className="w-3 h-3" />
                Edit manually
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toasts */}
      <AnimatePresence>
        {shared && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2 bg-crisp-500/20 border border-crisp-500/30 text-crisp-400 text-xs font-medium px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5"
          >
            <Link className="w-3 h-3" />
            Share link copied!
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full z-10"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
