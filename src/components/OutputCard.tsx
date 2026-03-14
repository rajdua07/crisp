"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import {
  Briefcase,
  Mail,
  CheckSquare,
  MessageSquare,
  GitBranch,
  Presentation,
  FileText,
  Share2,
  Smartphone,
  Mic,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Link,
  Save,
  X,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  mail: Mail,
  "check-square": CheckSquare,
  "message-square": MessageSquare,
  "git-branch": GitBranch,
  presentation: Presentation,
  "file-text": FileText,
  "share-2": Share2,
  smartphone: Smartphone,
  mic: Mic,
};

interface OutputCardProps {
  type: string;
  name: string;
  icon: string;
  content: string;
  index: number;
  isLoading?: boolean;
  onChain?: (content: string) => void;
  onCalibrate?: (original: string, edited: string) => void;
  showChain?: boolean;
}

export function OutputCard({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type,
  name,
  icon,
  content,
  index,
  isLoading,
  onChain,
  onCalibrate,
  showChain = false,
}: OutputCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const Icon = ICONS[icon] || Briefcase;

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const textToCopy = editing ? editContent : content;
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
    [content, editContent, editing]
  );

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    setEditContent(content);
    setExpanded(true);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    if (editContent !== content && onCalibrate) {
      onCalibrate(content, editContent);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    setEditContent(content);
  };

  const handleChain = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToChain = editing ? editContent : content;
    onChain?.(textToChain);
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

  const previewLines = content.split("\n").slice(0, 2).join("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group relative rounded-2xl border border-dark-700/50 bg-dark-900/50 hover:bg-dark-800/50 hover:border-dark-600/50 transition-all duration-300 overflow-hidden cursor-pointer glow-hover"
      onClick={() => !editing && setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-crisp-400" />
            </div>
            <h3 className="font-semibold text-dark-100 text-sm">{name}</h3>
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
                  className="p-2 rounded-lg bg-dark-800 text-dark-500 hover:text-dark-200 hover:bg-dark-700 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {showChain && onChain && (
                  <button
                    onClick={handleChain}
                    className="p-2 rounded-lg bg-dark-800 text-dark-500 hover:text-crisp-400 hover:bg-crisp-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Chain — recast this output"
                  >
                    <Link className="w-3.5 h-3.5" />
                  </button>
                )}
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
              {content}
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
      </div>

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
