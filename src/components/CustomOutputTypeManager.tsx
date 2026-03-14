"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ALL_OUTPUT_TYPES } from "@/lib/output-types";
import { v4 as uuidv4 } from "uuid";

export function CustomOutputTypeManager() {
  const {
    customOutputTypes,
    addCustomOutputType,
    deleteCustomOutputType,
    enabledOutputTypes,
    setEnabledOutputTypes,
    user,
  } = useAppStore();

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInstructions, setNewInstructions] = useState("");

  const handleCreate = () => {
    if (!newName.trim() || !newInstructions.trim()) return;

    const slug = newName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

    addCustomOutputType({
      id: uuidv4(),
      name: newName,
      slug,
      instructions: newInstructions,
      icon: "sparkles",
      sortOrder: customOutputTypes.length,
    });

    setEnabledOutputTypes([...enabledOutputTypes, slug]);
    setNewName("");
    setNewInstructions("");
    setShowNew(false);
  };

  const toggleOutputType = (slug: string) => {
    if (enabledOutputTypes.includes(slug)) {
      setEnabledOutputTypes(enabledOutputTypes.filter((s) => s !== slug));
    } else {
      setEnabledOutputTypes([...enabledOutputTypes, slug]);
    }
  };

  return (
    <div className="space-y-4">
      {/* System output types */}
      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-wider text-dark-500 font-medium">
          Output Types
        </h4>
        {ALL_OUTPUT_TYPES.map((type) => (
          <div
            key={type.slug}
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-dark-700/50 bg-dark-900/30"
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-dark-600" />
              <div>
                <div className="text-sm font-medium text-dark-200">
                  {type.name}
                </div>
                <div className="text-xs text-dark-500">{type.description}</div>
              </div>
            </div>
            <button
              onClick={() => toggleOutputType(type.slug)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                enabledOutputTypes.includes(type.slug)
                  ? "bg-crisp-500"
                  : "bg-dark-700"
              }`}
            >
              <motion.div
                animate={{
                  x: enabledOutputTypes.includes(type.slug) ? 18 : 2,
                }}
                className="w-5 h-5 rounded-full bg-white absolute top-0.5"
              />
            </button>
          </div>
        ))}
      </div>

      {/* Custom types */}
      {customOutputTypes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-dark-500 font-medium">
            Custom Types
          </h4>
          {customOutputTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-dark-700/50 bg-dark-900/30"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-crisp-400" />
                <div>
                  <div className="text-sm font-medium text-dark-200">
                    {type.name}
                  </div>
                  <div className="text-xs text-dark-500 line-clamp-1">
                    {type.instructions}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleOutputType(type.slug)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    enabledOutputTypes.includes(type.slug)
                      ? "bg-crisp-500"
                      : "bg-dark-700"
                  }`}
                >
                  <motion.div
                    animate={{
                      x: enabledOutputTypes.includes(type.slug) ? 18 : 2,
                    }}
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5"
                  />
                </button>
                <button
                  onClick={() => {
                    deleteCustomOutputType(type.id);
                    setEnabledOutputTypes(enabledOutputTypes.filter((s) => s !== type.slug));
                  }}
                  className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add custom type */}
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
                placeholder="Output type name (e.g., Board Email)"
                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl px-4 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-crisp-500/30"
              />
              <textarea
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                placeholder="Instructions for this output type... (e.g., Formal email suitable for board members, emphasize metrics and outcomes)"
                className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl px-4 py-3 text-sm text-dark-200 focus:outline-none focus:border-crisp-500/30 min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || !newInstructions.trim()}
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
            onClick={() => {
              if (user.plan === "free") return;
              setShowNew(true);
            }}
            className={`flex items-center gap-2 text-sm transition-colors ${
              user.plan === "free"
                ? "text-dark-600 cursor-not-allowed"
                : "text-dark-400 hover:text-crisp-400"
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Custom Type
            {user.plan === "free" && (
              <span className="text-[10px] bg-dark-800 text-dark-500 px-2 py-0.5 rounded-full">
                Pro
              </span>
            )}
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
