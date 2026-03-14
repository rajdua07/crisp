"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Check,
  X,
  Crown,
  Users,
  Handshake,
  Heart,
  TrendingUp,
  Star,
} from "lucide-react";
import { useAppStore, Audience } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

const AUDIENCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  crown: Crown,
  users: Users,
  handshake: Handshake,
  heart: Heart,
  "trending-up": TrendingUp,
  star: Star,
};

export function AudienceManager() {
  const { audiences, addAudience, deleteAudience } = useAppStore();

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFormality, setNewFormality] = useState(0.5);
  const [newWarmth, setNewWarmth] = useState(0.5);

  const handleCreate = () => {
    if (!newName.trim()) return;

    const audience: Audience = {
      id: uuidv4(),
      name: newName,
      description: newDesc || `Custom audience: ${newName}`,
      icon: "star",
      tonePreset: {
        formality: newFormality,
        warmth: newWarmth,
        detail: 0.5,
      },
    };

    addAudience(audience);
    setNewName("");
    setNewDesc("");
    setNewFormality(0.5);
    setNewWarmth(0.5);
    setShowNew(false);
  };

  const isDefault = (id: string) =>
    ["ceo", "team", "client", "family", "investor"].includes(id);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {audiences.map((audience) => {
          const Icon = AUDIENCE_ICONS[audience.icon] || Star;
          return (
            <div
              key={audience.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-dark-700/50 bg-dark-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-crisp-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-dark-200">
                    {audience.name}
                  </div>
                  <div className="text-xs text-dark-500">
                    {audience.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2 text-[10px] text-dark-500">
                  <span>F:{Math.round(audience.tonePreset.formality * 100)}%</span>
                  <span>W:{Math.round(audience.tonePreset.warmth * 100)}%</span>
                </div>
                {!isDefault(audience.id) && (
                  <button
                    onClick={() => deleteAudience(audience.id)}
                    className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showNew ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-4 rounded-xl border border-crisp-500/20 bg-dark-900/50">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Audience name (e.g., Wife, Parents, Board)"
                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl px-4 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-crisp-500/30"
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (e.g., Warm, simple, no jargon)"
                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl px-4 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-crisp-500/30"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-dark-500 font-medium">
                    Formality: {Math.round(newFormality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={newFormality}
                    onChange={(e) => setNewFormality(parseFloat(e.target.value))}
                    className="w-full mt-1 accent-crisp-500"
                  />
                  <div className="flex justify-between text-[10px] text-dark-600">
                    <span>Casual</span>
                    <span>Formal</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-dark-500 font-medium">
                    Warmth: {Math.round(newWarmth * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={newWarmth}
                    onChange={(e) => setNewWarmth(parseFloat(e.target.value))}
                    className="w-full mt-1 accent-crisp-500"
                  />
                  <div className="flex justify-between text-[10px] text-dark-600">
                    <span>Direct</span>
                    <span>Warm</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-crisp-500 text-white text-sm font-medium disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5" />
                  Create
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 text-dark-300 text-sm"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 text-sm text-dark-400 hover:text-crisp-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Audience
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
