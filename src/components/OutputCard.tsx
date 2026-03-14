"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import {
  Briefcase,
  Mail,
  CheckSquare,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  mail: Mail,
  "check-square": CheckSquare,
  "message-square": MessageSquare,
};

interface OutputCardProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type: string;
  name: string;
  icon: string;
  content: string;
  index: number;
  isLoading?: boolean;
}

export function OutputCard({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type,
  name,
  icon,
  content,
  index,
  isLoading,
}: OutputCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = ICONS[icon] || Briefcase;

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [content]
  );

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
      className="group rounded-2xl border border-dark-700/50 bg-dark-900/50 hover:bg-dark-800/50 hover:border-dark-600/50 transition-all duration-300 overflow-hidden cursor-pointer glow-hover"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-crisp-400" />
            </div>
            <h3 className="font-semibold text-dark-100 text-sm">{name}</h3>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        <AnimatePresence mode="wait">
          {expanded ? (
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
            className="absolute top-2 right-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
