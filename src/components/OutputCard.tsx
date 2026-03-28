"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import type { OutputConfig } from "@/lib/output-types";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  X,
  Sparkles,
  Loader2,
  Send,
  ThumbsUp,
  ThumbsDown,
  Download,
  Link,
  Share2,
  FileText,
} from "lucide-react";

interface OutputCardProps {
  configKey: string;
  label: string;
  config: OutputConfig;
  content: string;
  index: number;
  isLoading?: boolean;
  sessionId?: string;
  onCalibrate?: (original: string, edited: string) => void;
}

export function OutputCard({
  label,
  config,
  content,
  index,
  isLoading,
  sessionId,
  onCalibrate,
}: OutputCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [tweaking, setTweaking] = useState(false);
  const [tweakPrompt, setTweakPrompt] = useState("");
  const [tweakLoading, setTweakLoading] = useState(false);
  const [tweakedContent, setTweakedContent] = useState<string | null>(null);
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [showDownNudge, setShowDownNudge] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const displayContent = tweakedContent || content;

  const handleDownload = useCallback(async (format: "docx" | "pdf", e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(format);
    try {
      const { exportToDocx, exportToPdf } = await import("@/lib/document-export");
      const branding = useAppStore.getState().documentBranding;
      const filename = `crisp-${config.length}-${Date.now()}`;
      if (format === "docx") {
        await exportToDocx(displayContent, filename, branding);
      } else {
        await exportToPdf(displayContent, filename, branding);
      }
    } catch {
      // Silent fail
    } finally {
      setDownloading(null);
    }
  }, [displayContent, config.length, downloading]);

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
          outputLabel: label,
          outputConfig: config,
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
  }, [sessionId, label, config, displayContent, sharing]);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
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
    },
    [displayContent, editContent, editing]
  );

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditContent(displayContent);
    setExpanded(true);
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
    setEditContent(content);
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
          output_config: config,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Tweak failed");
      }
      const { tweaked_content } = await res.json();
      setTweakedContent(tweaked_content);
      setEditContent(tweaked_content);
      setTweakPrompt("");
      setTweaking(false);
      setExpanded(true);
    } catch {
      // Could show error, but keep it simple
    } finally {
      setTweakLoading(false);
    }
  };

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
      if (displayContent !== content && onCalibrate) {
        onCalibrate(content, displayContent);
      }
    } else {
      setShowDownNudge(true);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-5 space-y-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg shimmer" />
          <div className="h-4 w-24 rounded shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded shimmer" />
          <div className="h-3 w-4/5 rounded shimmer" />
          <div className="h-3 w-3/5 rounded shimmer" />
        </div>
      </motion.div>
    );
  }

  const previewLines = displayContent.split("\n").slice(0, 2).join("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group relative rounded-2xl border border-dark-700/50 bg-dark-900/50 hover:bg-dark-800/50 hover:border-dark-600/50 transition-all duration-300 overflow-hidden cursor-pointer glow-hover"
      onClick={() => !editing && setExpanded(!expanded)}
    >
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-crisp-400" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100 text-sm">{label}</h3>
              {config.humanify && (
                <span className="text-[10px] text-amber-400/70">humanified</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {editing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="p-2 rounded-lg bg-dark-800 text-dark-500 hover:text-dark-200 hover:bg-dark-700 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTweaking(!tweaking);
                    if (!tweaking) setExpanded(true);
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    tweaking
                      ? "bg-crisp-500/10 text-crisp-400"
                      : "bg-dark-800 text-dark-500 hover:text-crisp-400 hover:bg-crisp-500/10 sm:opacity-0 sm:group-hover:opacity-100"
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
                    copied
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-dark-800 text-dark-400 hover:text-dark-200 hover:bg-dark-700"
                  }`}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </motion.button>
                {/* Download DOCX */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleDownload("docx", e)}
                  disabled={downloading === "docx"}
                  className="p-2 rounded-lg transition-all duration-200 bg-dark-800 text-dark-500 hover:text-dark-200 hover:bg-dark-700 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Download as DOCX"
                >
                  {downloading === "docx" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                </motion.button>
                {/* Share link */}
                {sessionId && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    disabled={sharing}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      shared
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-dark-800 text-dark-500 hover:text-dark-200 hover:bg-dark-700 sm:opacity-0 sm:group-hover:opacity-100"
                    }`}
                    title={shared ? "Link copied!" : "Share public link"}
                  >
                    {sharing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : shared ? (
                      <Link className="w-3.5 h-3.5" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </motion.button>
                )}
              </>
            )}
            {!editing && (
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-dark-500"
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </motion.div>
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
              className="overflow-hidden"
            >
              <div
                className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-dark-800/50 border border-crisp-500/20"
                onClick={(e) => e.stopPropagation()}
              >
                <Sparkles className="w-3.5 h-3.5 text-crisp-400 flex-shrink-0" />
                <input
                  type="text"
                  value={tweakPrompt}
                  onChange={(e) => setTweakPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleTweak();
                    }
                    if (e.key === "Escape") {
                      setTweaking(false);
                      setTweakPrompt("");
                    }
                  }}
                  placeholder="e.g. Make shorter, change tone, translate..."
                  className="flex-1 bg-transparent text-sm text-dark-200 placeholder-dark-500 focus:outline-none"
                  autoFocus
                  disabled={tweakLoading}
                />
                <button
                  onClick={handleTweak}
                  disabled={!tweakPrompt.trim() || tweakLoading}
                  className="p-1.5 rounded-lg bg-crisp-500/10 text-crisp-400 hover:bg-crisp-500/20 transition-colors disabled:opacity-40"
                >
                  {tweakLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTweaking(false);
                    setTweakPrompt("");
                  }}
                  className="p-1.5 rounded-lg text-dark-500 hover:text-dark-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-dark-800/50 border border-dark-600/50 rounded-xl p-4 text-sm text-dark-200 leading-relaxed resize-none min-h-[120px] focus:outline-none focus:border-crisp-500/30 transition-colors"
                rows={Math.max(4, editContent.split("\n").length)}
              />
              <p className="text-[10px] text-dark-500 mt-2">
                Edit to match your voice. Saving teaches Crisp your style.
              </p>
            </motion.div>
          ) : expanded ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap"
            >
              {displayContent}
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-dark-300 leading-relaxed line-clamp-2"
            >
              {previewLines}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback bar */}
        <AnimatePresence>
          {expanded && !editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center justify-between mt-4 pt-3 border-t border-dark-800/50"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[10px] text-dark-500">
                  {rating === "up"
                    ? "Thanks! This helps Crisp learn your voice."
                    : rating === "down" && showDownNudge
                    ? "Try tweaking it first, then thumbs up when it's right."
                    : "Does this sound like you?"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleRating("up", e)}
                    className={`p-1.5 rounded-lg transition-all ${
                      rating === "up"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-dark-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleRating("down", e)}
                    className={`p-1.5 rounded-lg transition-all ${
                      rating === "down"
                        ? "bg-red-500/10 text-red-400"
                        : "text-dark-500 hover:text-red-400 hover:bg-red-500/10"
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {/* Nudge to tweak after thumbs down */}
              <AnimatePresence>
                {showDownNudge && rating === "down" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDownNudge(false);
                        setTweaking(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-crisp-500/10 border border-crisp-500/20 text-crisp-400 text-[11px] font-medium hover:bg-crisp-500/15 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      Tweak with AI
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDownNudge(false);
                        handleEdit(e);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700/50 text-dark-300 text-[11px] font-medium hover:text-dark-200 transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit manually
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared toast */}
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

      {/* Copied toast */}
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
