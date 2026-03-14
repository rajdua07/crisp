"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  Crown,
  Users,
  Handshake,
  Heart,
  TrendingUp,
  Star,
  X,
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
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ALL_OUTPUT_TYPES } from "@/lib/output-types";

const OUTPUT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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
  sparkles: Sparkles,
};

const AUDIENCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  crown: Crown,
  users: Users,
  handshake: Handshake,
  heart: Heart,
  "trending-up": TrendingUp,
  star: Star,
};

interface PasteZoneProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  text: string;
  onTextChange: (text: string) => void;
  compact?: boolean;
}

function getToneLabel(value: number): string {
  if (value <= 0.15) return "Casual";
  if (value <= 0.35) return "Relaxed";
  if (value <= 0.65) return "Balanced";
  if (value <= 0.85) return "Professional";
  return "Formal";
}

export function PasteZone({ onSubmit, isLoading, text, onTextChange, compact = false }: PasteZoneProps) {
  const {
    audiences,
    activeAudienceId,
    setActiveAudienceId,
    toneFormality,
    setToneFormality,
    enabledOutputTypes,
    setEnabledOutputTypes,
    customOutputTypes,
    user,
  } = useAppStore();

  const charCount = text.length;
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isFree = user.plan === "free";
  const FREE_SLUGS = ["email_draft", "action_items", "slack_message"];

  const activeAudience = audiences.find((a) => a.id === activeAudienceId);

  useEffect(() => {
    if (textareaRef.current) {
      if (compact) {
        // In compact mode, don't auto-grow — keep fixed max height
        textareaRef.current.style.height = "";
      } else {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.max(200, textareaRef.current.scrollHeight)}px`;
      }
    }
  }, [text, compact]);

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
      onTextChange(droppedText);
    }
  }, []);

  const selectAudience = (id: string | null) => {
    setActiveAudienceId(id);
    if (id) {
      const audience = audiences.find((a) => a.id === id);
      if (audience) {
        setToneFormality(audience.tonePreset.formality);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Textarea */}
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
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          placeholder="Paste any AI output here..."
          className={`w-full bg-transparent text-dark-100 placeholder-dark-500 p-4 sm:p-6 pb-10 sm:pb-12 resize-none text-sm leading-relaxed focus:outline-none rounded-2xl ${
            compact ? "min-h-[80px] sm:min-h-[100px] max-h-[120px] sm:max-h-[150px] overflow-y-auto" : "min-h-[150px] sm:min-h-[200px]"
          }`}
          disabled={isLoading}
        />
        <div className="absolute bottom-2 sm:bottom-3 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between">
          <span className="text-xs text-dark-500 font-mono">
            {charCount > 0 && `${charCount.toLocaleString()} chars`}
          </span>
          <span className="text-xs text-dark-600 hidden sm:block">
            {charCount > 0 && "\u2318+Enter to Crisp"}
          </span>
        </div>
      </motion.div>

      {/* Audience pills */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-dark-500 font-medium mb-2">
          Who is this for?
        </div>
        <div className="flex flex-wrap gap-2">
          {/* General / no audience */}
          <button
            onClick={() => selectAudience(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              !activeAudienceId
                ? "bg-crisp-500/10 text-crisp-400 border-crisp-500/20"
                : "bg-dark-900/50 text-dark-400 border-dark-700/50 hover:text-dark-200 hover:border-dark-600/50"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            General
          </button>

          {audiences.map((audience) => {
            const Icon = AUDIENCE_ICONS[audience.icon] || Star;
            const isActive = activeAudienceId === audience.id;
            return (
              <button
                key={audience.id}
                onClick={() => selectAudience(audience.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  isActive
                    ? "bg-crisp-500/10 text-crisp-400 border-crisp-500/20"
                    : "bg-dark-900/50 text-dark-400 border-dark-700/50 hover:text-dark-200 hover:border-dark-600/50"
                }`}
              >
                <Icon className="w-3 h-3" />
                {audience.name}
              </button>
            );
          })}
        </div>

        {/* Active audience indicator */}
        <AnimatePresence>
          {activeAudience && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-xl bg-crisp-500/5 border border-crisp-500/10">
                <span className="text-[11px] text-dark-400">
                  {activeAudience.description} - tone auto-set to{" "}
                  <span className="text-dark-200">{getToneLabel(activeAudience.tonePreset.formality)}</span>
                </span>
                <button
                  onClick={() => selectAudience(null)}
                  className="p-1 rounded-lg text-dark-500 hover:text-dark-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom tone slider - only when no audience is selected */}
        <AnimatePresence>
          {!activeAudienceId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-dark-500 font-medium">
                    Tone
                  </span>
                  <span className="text-xs text-dark-300 font-medium">
                    {getToneLabel(toneFormality)}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={toneFormality}
                    onChange={(e) => setToneFormality(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-dark-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-crisp-500
                      [&::-webkit-slider-thumb]:shadow-lg
                      [&::-webkit-slider-thumb]:shadow-crisp-500/30
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-dark-950
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:hover:scale-110
                    "
                  />
                  <div
                    className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-crisp-600 to-crisp-500 rounded-full pointer-events-none -translate-y-1/2"
                    style={{ width: `${toneFormality * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-dark-600">Casual</span>
                  <span className="text-[10px] text-dark-600">Formal</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Output type toggles */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-dark-500 font-medium mb-2">
          Output types
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-[120px] sm:max-h-none overflow-y-auto sm:overflow-visible">
          {ALL_OUTPUT_TYPES.map((type) => {
            const Icon = OUTPUT_ICONS[type.icon] || Sparkles;
            const isEnabled = enabledOutputTypes.includes(type.slug);
            const isLocked = isFree && !FREE_SLUGS.includes(type.slug);
            return (
              <button
                key={type.slug}
                onClick={() => {
                  if (isLocked) return;
                  if (isEnabled) {
                    setEnabledOutputTypes(enabledOutputTypes.filter((s) => s !== type.slug));
                  } else {
                    setEnabledOutputTypes([...enabledOutputTypes, type.slug]);
                  }
                }}
                title={isLocked ? "Upgrade to Pro to unlock" : type.description}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                  isLocked
                    ? "bg-dark-900/20 text-dark-700 border-dark-800/30 cursor-not-allowed"
                    : isEnabled
                    ? "bg-crisp-500/10 text-crisp-400 border-crisp-500/20"
                    : "bg-dark-900/30 text-dark-600 border-dark-800/50 hover:text-dark-400 hover:border-dark-700/50"
                }`}
              >
                <Icon className="w-3 h-3" />
                {type.name}
                {isLocked && <span className="text-[9px] text-dark-600">Pro</span>}
              </button>
            );
          })}
          {customOutputTypes.map((type) => {
            const isEnabled = enabledOutputTypes.includes(type.slug);
            return (
              <button
                key={type.slug}
                onClick={() => {
                  if (isEnabled) {
                    setEnabledOutputTypes(enabledOutputTypes.filter((s) => s !== type.slug));
                  } else {
                    setEnabledOutputTypes([...enabledOutputTypes, type.slug]);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                  isEnabled
                    ? "bg-crisp-500/10 text-crisp-400 border-crisp-500/20"
                    : "bg-dark-900/30 text-dark-600 border-dark-800/50 hover:text-dark-400 hover:border-dark-700/50"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {type.name}
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 text-[10px] text-dark-600">
          {enabledOutputTypes.length} selected
          {isFree && enabledOutputTypes.length > 0 && enabledOutputTypes.every((s) => !FREE_SLUGS.includes(s)) && (
            <span className="text-amber-400 ml-2">- none available on Free plan</span>
          )}
        </div>
      </div>

      {/* Crisp It button */}
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
            <span>Crisping{activeAudience ? ` for ${activeAudience.name}` : ""}...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Crisp It{activeAudience ? ` for ${activeAudience.name}` : ""}</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
