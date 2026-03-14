"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const { setUser } = useAppStore();

  const handleUpgrade = async (plan: "pro" | "team") => {
    // In production, redirect to Stripe checkout
    // For now, simulate upgrade
    try {
      const priceId =
        plan === "pro"
          ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID;

      if (priceId) {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, plan }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      // Demo mode: upgrade locally
      setUser({ plan, crispsUsedThisMonth: 0 });
      onClose();
    } catch {
      // Demo mode fallback
      setUser({ plan, crispsUsedThisMonth: 0 });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-dark-900 border border-dark-700/50 rounded-2xl p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-crisp-500/10 border border-crisp-500/20 mb-4">
                  <Sparkles className="w-6 h-6 text-crisp-400" />
                </div>
                <h2 className="text-xl font-bold text-dark-50 mb-2">
                  Upgrade to unlock more
                </h2>
                {reason && (
                  <p className="text-sm text-dark-400">{reason}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Pro */}
                <div className="border-2 border-crisp-500/40 rounded-2xl p-5 bg-dark-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-crisp-400" />
                    <span className="font-semibold text-dark-100">Pro</span>
                  </div>
                  <div className="text-2xl font-bold text-dark-50 mb-3">
                    $19<span className="text-sm text-dark-400 font-normal">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {["Unlimited crisps", "All 8 output types", "3 voice profiles", "Chain feature", "Custom types"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-dark-300">
                        <Check className="w-3 h-3 text-crisp-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade("pro")}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-crisp-500/20 transition-all"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* Team */}
                <div className="border border-dark-700/50 rounded-2xl p-5 bg-dark-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="font-semibold text-dark-100">Team</span>
                  </div>
                  <div className="text-2xl font-bold text-dark-50 mb-3">
                    $39<span className="text-sm text-dark-400 font-normal">/user/mo</span>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {["Everything in Pro", "Shared brand voices", "Team voice library", "Admin dashboard", "Usage analytics"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-dark-300">
                        <Check className="w-3 h-3 text-violet-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade("team")}
                    className="w-full py-2.5 rounded-xl bg-dark-700 text-dark-200 text-sm font-medium hover:bg-dark-600 border border-dark-600/50 transition-all"
                  >
                    Upgrade to Team
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
