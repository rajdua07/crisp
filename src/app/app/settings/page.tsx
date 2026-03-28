"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { VoiceProfileEditor } from "@/components/VoiceProfileEditor";
import { AudienceManager } from "@/components/AudienceManager";
import { IntegrationsManager } from "@/components/IntegrationsManager";
import { BrandingEditor } from "@/components/BrandingEditor";
import { useAppStore, PLAN_LIMITS } from "@/lib/store";
import {
  ArrowLeft,
  Volume2,
  User,
  CreditCard,
  Zap,
  Target,
  Plug,
  Paintbrush,
} from "lucide-react";

type Tab = "voice" | "audiences" | "branding" | "integrations" | "account";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("voice");
  const { user, setUser, resetMonthlyUsage, hydrateFromServer } = useAppStore();
  const limits = PLAN_LIMITS[user.plan];

  useEffect(() => {
    hydrateFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = [
    { id: "voice" as const, label: "Your Voice", icon: Volume2 },
    { id: "audiences" as const, label: "Audiences", icon: Target },
    { id: "branding" as const, label: "Branding", icon: Paintbrush },
    { id: "integrations" as const, label: "Integrations", icon: Plug },
    { id: "account" as const, label: "Account", icon: User },
  ];

  const handleManageBilling = async () => {
    if (user.stripeCustomerId) {
      try {
        const res = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: user.stripeCustomerId }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch {
        // Stripe not configured
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass"
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/app"
              className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <Logo size="small" />
            <span className="text-dark-500 text-sm">/ Settings</span>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-dark-100 mb-8">Settings</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 sm:mb-8 border-b border-dark-800/50 pb-4 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-crisp-500/10 text-crisp-400 border border-crisp-500/20"
                    : "text-dark-400 hover:text-dark-200 border border-transparent"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "voice" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl"
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-dark-100 mb-2">
                  Voice DNA
                </h2>
                <p className="text-sm text-dark-400">
                  Teach Crisp how you write and speak. Every output will match
                  your personal style.
                </p>
              </div>
              <VoiceProfileEditor />
            </motion.div>
          )}

          {activeTab === "audiences" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl"
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-dark-100 mb-2">
                  Audiences
                </h2>
                <p className="text-sm text-dark-400">
                  Define who you communicate with. Crisp adjusts tone, formality,
                  and detail level per audience - your operating system for every
                  conversation.
                </p>
              </div>
              <AudienceManager />
            </motion.div>
          )}

          {activeTab === "branding" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl"
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-dark-100 mb-2">
                  Document Branding
                </h2>
                <p className="text-sm text-dark-400">
                  Customize how your DOCX and PDF exports look — logo, colors,
                  fonts, and footer. Makes every document unmistakably yours.
                </p>
              </div>
              <BrandingEditor />
            </motion.div>
          )}

          {activeTab === "integrations" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl"
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-dark-100 mb-2">
                  Integrations
                </h2>
                <p className="text-sm text-dark-400">
                  Connect your tools to push Crisp outputs directly where you
                  need them - Slack, Notion, Asana, Google Workspace, and more.
                </p>
              </div>
              <IntegrationsManager />
            </motion.div>
          )}

          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl space-y-6"
            >
              {/* Plan info */}
              <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-dark-200">
                      Current Plan
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold text-dark-50 capitalize">
                        {user.plan}
                      </span>
                      {user.plan !== "free" && (
                        <span className="text-xs bg-crisp-500/10 text-crisp-400 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  {user.plan === "free" && (
                    <a
                      href="/app?upgrade=true"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-crisp-500/20 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      Upgrade
                    </a>
                  )}
                </div>

                {/* Usage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Crisps this month</span>
                    <span className="text-dark-200">
                      {user.crispsUsedThisMonth} /{" "}
                      {limits.crispsPerMonth === Infinity ? "∞" : limits.crispsPerMonth}
                    </span>
                  </div>
                  {user.plan === "free" && (
                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-crisp-600 to-crisp-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min((user.crispsUsedThisMonth / limits.crispsPerMonth) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Voice profiles</span>
                    <span className="text-dark-200">
                      {limits.maxVoiceProfiles === Infinity ? "Unlimited" : `Up to ${limits.maxVoiceProfiles}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Chain feature</span>
                    <span className={limits.hasChain ? "text-emerald-400" : "text-dark-500"}>
                      {limits.hasChain ? "Enabled" : "Pro only"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billing */}
              {user.plan !== "free" && (
                <div className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-6">
                  <h3 className="text-sm font-medium text-dark-200 mb-4">
                    Billing
                  </h3>
                  <button
                    onClick={handleManageBilling}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 text-dark-200 text-sm hover:bg-dark-700 border border-dark-700/50 transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    Manage Billing
                  </button>
                </div>
              )}

              {/* Demo controls */}
              <div className="rounded-2xl border border-dark-700/30 bg-dark-900/20 p-6">
                <h3 className="text-xs uppercase tracking-wider text-dark-500 font-medium mb-3">
                  Demo Controls
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(["free", "pro", "team"] as const).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setUser({ plan })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        user.plan === plan
                          ? "bg-crisp-500/10 text-crisp-400 border border-crisp-500/20"
                          : "bg-dark-800 text-dark-400 border border-dark-700/50 hover:text-dark-200"
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                  <button
                    onClick={resetMonthlyUsage}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-800 text-dark-400 border border-dark-700/50 hover:text-dark-200 transition-all"
                  >
                    Reset Usage
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
