"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface PasteZoneProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export function PasteZone({ onSubmit, isLoading }: PasteZoneProps) {
  const [text, setText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(200, textareaRef.current.scrollHeight)}px`;
    }
  }, [text]);

  const handleSubmit = useCallback(() => {
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
    }
  }, [text, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedText = e.dataTransfer.getData("text/plain");
    if (droppedText) {
      setText(droppedText);
    }
  }, []);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative rounded-2xl border transition-all duration-300 ${
          isDragOver
            ? "border-crisp-500/50 bg-crisp-500/5 shadow-lg shadow-crisp-500/10"
            : "border-dark-700/50 bg-dark-900/30 hover:border-dark-600/50"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          placeholder="Paste any AI output here..."
          className="w-full min-h-[200px] bg-transparent text-dark-100 placeholder-dark-500 p-6 pb-12 resize-none text-sm leading-relaxed focus:outline-none rounded-2xl"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between">
          <span className="text-xs text-dark-500 font-mono">
            {charCount > 0 && `${charCount.toLocaleString()} chars`}
          </span>
          <span className="text-xs text-dark-600 hidden sm:block">
            {charCount > 0 && "⌘+Enter to Crisp"}
          </span>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!text.trim() || isLoading}
        className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
          text.trim() && !isLoading
            ? "bg-gradient-to-r from-crisp-600 to-crisp-500 text-white shadow-lg shadow-crisp-500/25 hover:shadow-crisp-500/40 glow"
            : "bg-dark-800/50 text-dark-500 cursor-not-allowed border border-dark-700/30"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Crisping...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Crisp It</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
