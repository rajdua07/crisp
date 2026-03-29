"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
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
} from "lucide-react";

interface QualityScore {
  original: number;
  crisped: number;
  dimensions: {
    name: string;
    original: number;
    crisped: number;
  }[];
}

interface CrispComparisonProps {
  original: string;
  refined: string;
  qualityScore: QualityScore | null;
  sessionId?: string;
  onCalibrate?: (original: string, edited: string) => void;
}

function ScoreBar({ label, original, crisped }: { label: string; original: number; crisped: number }) {
  const improvement = crisped - original;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-dark-400 font-medium">{label}</span>
        <span className={`text-[10px] font-bold ${improvement > 0 ? "text-emerald-400" : improvement < 0 ? "text-red-400" : "text-dark-500"}`}>
          {improvement > 0 ? "+" : ""}{improvement}
        </span>
      </div>
      <div className="flex gap-1.5 items-center">
        <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${original * 10}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-dark-500 rounded-full"
          />
        </div>
        <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${crisped * 10}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-crisp-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

export function CrispComparison({ original, refined, qualityScore, sessionId, onCalibrate }: CrispComparisonProps) {
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
      className="space-y-4"
    >
      {/* Quality score card */}
      {qualityScore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-dark-200 uppercase tracking-widest">Quality Score</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-dark-500" />
                <span className="text-[10px] text-dark-500">Original: {qualityScore.original}/10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-crisp-500" />
                <span className="text-[10px] text-crisp-400">Crisped: {qualityScore.crisped}/10</span>
              </div>
            </div>
          </div>

          {/* Overall score comparison */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 text-center p-3 rounded-xl bg-dark-800/50">
              <div className="text-2xl font-bold text-dark-400">{qualityScore.original}</div>
              <div className="text-[10px] text-dark-500 mt-0.5">BEFORE</div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">
                +{qualityScore.crisped - qualityScore.original}
              </span>
            </motion.div>
            <div className="flex-1 text-center p-3 rounded-xl bg-crisp-500/5 border border-crisp-500/10">
              <div className="text-2xl font-bold text-crisp-400">{qualityScore.crisped}</div>
              <div className="text-[10px] text-crisp-400/60 mt-0.5">AFTER</div>
            </div>
          </div>

          {/* Dimension breakdowns */}
          <div className="space-y-2">
            {qualityScore.dimensions.map((dim) => (
              <ScoreBar key={dim.name} label={dim.name} original={dim.original} crisped={dim.crisped} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Side by side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-dark-700/50 bg-dark-900/50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-dark-800/50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-dark-500" />
            <span className="text-[10px] uppercase tracking-widest text-dark-500 font-semibold">Original</span>
          </div>
          <div className="p-4 text-sm text-dark-400 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {original}
          </div>
        </motion.div>

        {/* Crisped */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="relative rounded-2xl border border-crisp-500/20 bg-dark-900/50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-dark-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-crisp-500" />
              <span className="text-[10px] uppercase tracking-widest text-crisp-400/70 font-semibold">Crisped</span>
            </div>
            <div className="flex items-center gap-1">
              {editing ? (
                <>
                  <button onClick={handleSaveEdit} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                    <Save className="w-3 h-3" />
                  </button>
                  <button onClick={handleCancelEdit} className="p-1.5 rounded-lg bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleEdit} className="p-1.5 rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-700 transition-all">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setTweaking(!tweaking)}
                    className={`p-1.5 rounded-lg transition-all ${
                      tweaking ? "bg-crisp-500/10 text-crisp-400" : "text-dark-500 hover:text-crisp-400 hover:bg-crisp-500/10"
                    }`}
                    title="Tweak with AI"
                  >
                    <Sparkles className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`p-1.5 rounded-lg transition-all ${
                      copied ? "bg-emerald-500/10 text-emerald-400" : "text-dark-500 hover:text-dark-200 hover:bg-dark-700"
                    }`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => handleDownload("docx", e)}
                    disabled={downloading === "docx"}
                    className="p-1.5 rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-700 transition-all"
                    title="Download as DOCX"
                  >
                    {downloading === "docx" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  </button>
                  {sessionId && (
                    <button
                      onClick={handleShare}
                      disabled={sharing}
                      className={`p-1.5 rounded-lg transition-all ${
                        shared ? "bg-emerald-500/10 text-emerald-400" : "text-dark-500 hover:text-dark-200 hover:bg-dark-700"
                      }`}
                      title={shared ? "Link copied!" : "Share"}
                    >
                      {sharing ? <Loader2 className="w-3 h-3 animate-spin" /> : shared ? <Link className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                    </button>
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
                  <Sparkles className="w-3 h-3 text-crisp-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={tweakPrompt}
                    onChange={(e) => setTweakPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleTweak(); }
                      if (e.key === "Escape") { setTweaking(false); setTweakPrompt(""); }
                    }}
                    placeholder="e.g. Make shorter, more casual..."
                    className="flex-1 bg-transparent text-sm text-dark-200 placeholder-dark-500 focus:outline-none"
                    autoFocus
                    disabled={tweakLoading}
                  />
                  <button
                    onClick={handleTweak}
                    disabled={!tweakPrompt.trim() || tweakLoading}
                    className="p-1.5 rounded-lg bg-crisp-500/10 text-crisp-400 hover:bg-crisp-500/20 transition-colors disabled:opacity-40"
                  >
                    {tweakLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
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

          {/* Content */}
          <div className="p-4 max-h-[500px] overflow-y-auto">
            {editing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-dark-800/50 border border-dark-600/50 rounded-xl p-3 text-sm text-dark-200 leading-relaxed resize-none min-h-[150px] focus:outline-none focus:border-crisp-500/30 transition-colors"
                  rows={Math.max(6, editContent.split("\n").length)}
                />
                <p className="text-[10px] text-dark-500 mt-2">
                  Edit to match your voice. Saving teaches Crisp your style.
                </p>
              </div>
            ) : (
              <div className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
                {displayContent}
              </div>
            )}
          </div>

          {/* Feedback bar */}
          {!editing && (
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between pt-3 border-t border-dark-800/50">
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
              <AnimatePresence>
                {showDownNudge && rating === "down" && (
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
          )}

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
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-2 left-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full z-10"
              >
                Copied!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
