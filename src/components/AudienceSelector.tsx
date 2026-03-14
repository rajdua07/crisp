"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Crown,
  Users,
  Handshake,
  Heart,
  TrendingUp,
  Star,
  ChevronDown,
  X,
  Target,
} from "lucide-react";

const AUDIENCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  crown: Crown,
  users: Users,
  handshake: Handshake,
  heart: Heart,
  "trending-up": TrendingUp,
  star: Star,
};

export function AudienceSelector() {
  const { audiences, activeAudienceId, setActiveAudienceId, setToneFormality } =
    useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeAudience = audiences.find((a) => a.id === activeAudienceId);

  const selectAudience = (id: string | null) => {
    setActiveAudienceId(id);
    if (id) {
      const audience = audiences.find((a) => a.id === id);
      if (audience) {
        setToneFormality(audience.tonePreset.formality);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
          activeAudience
            ? "bg-crisp-500/10 text-crisp-400 border-crisp-500/20"
            : "bg-dark-900/50 text-dark-400 border-dark-700/50 hover:text-dark-200 hover:border-dark-600/50"
        }`}
      >
        <Target className="w-3.5 h-3.5" />
        {activeAudience ? activeAudience.name : "Audience"}
        <ChevronDown className="w-3 h-3" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-64 bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden"
            >
              <div className="p-2">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-dark-500 font-medium">
                  Who is this for?
                </div>

                {/* No audience option */}
                <button
                  onClick={() => selectAudience(null)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    !activeAudienceId
                      ? "bg-dark-800/80 text-dark-100"
                      : "text-dark-300 hover:bg-dark-800/40"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-dark-700/50 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-dark-400" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">General</div>
                    <div className="text-[10px] text-dark-500">No specific audience</div>
                  </div>
                </button>

                {audiences.map((audience) => {
                  const Icon = AUDIENCE_ICONS[audience.icon] || Star;
                  return (
                    <button
                      key={audience.id}
                      onClick={() => selectAudience(audience.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        activeAudienceId === audience.id
                          ? "bg-crisp-500/10 text-dark-100"
                          : "text-dark-300 hover:bg-dark-800/40"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        activeAudienceId === audience.id
                          ? "bg-crisp-500/20"
                          : "bg-dark-700/50"
                      }`}>
                        <Icon className={`w-3.5 h-3.5 ${
                          activeAudienceId === audience.id
                            ? "text-crisp-400"
                            : "text-dark-400"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{audience.name}</div>
                        <div className="text-[10px] text-dark-500 truncate">
                          {audience.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="px-5 py-2.5 border-t border-dark-800/50">
                <a
                  href="/app/settings"
                  className="text-[10px] text-dark-500 hover:text-crisp-400 transition-colors"
                >
                  Manage audiences in Settings
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
