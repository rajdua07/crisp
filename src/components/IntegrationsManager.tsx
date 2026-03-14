"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  MessageSquare,
  FileText,
  CheckSquare,
  Presentation,
  Check,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";

const INTEGRATIONS = [
  {
    key: "slack" as const,
    name: "Slack",
    icon: MessageSquare,
    description: "Send Slack messages directly to a channel",
    outputTypes: ["slack_message"],
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    fields: [
      {
        key: "webhookUrl",
        label: "Incoming Webhook URL",
        placeholder: "https://hooks.slack.com/services/T.../B.../...",
        type: "url",
        help: "Create one at api.slack.com/messaging/webhooks",
      },
      {
        key: "channelName",
        label: "Channel (optional)",
        placeholder: "#general",
        type: "text",
      },
    ],
  },
  {
    key: "notion" as const,
    name: "Notion",
    icon: FileText,
    description: "Push action items and one-pagers to Notion",
    outputTypes: ["action_items", "client_one_pager"],
    color: "text-dark-200",
    bg: "bg-dark-200/10",
    border: "border-dark-200/20",
    fields: [
      {
        key: "apiKey",
        label: "Integration Token",
        placeholder: "secret_...",
        type: "password",
        help: "Create at notion.so/my-integrations",
      },
      {
        key: "pageId",
        label: "Parent Page ID (optional)",
        placeholder: "abc123...",
        type: "text",
        help: "Leave empty to create standalone pages",
      },
    ],
  },
  {
    key: "asana" as const,
    name: "Asana",
    icon: CheckSquare,
    description: "Create tasks from action items",
    outputTypes: ["action_items"],
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    fields: [
      {
        key: "accessToken",
        label: "Personal Access Token",
        placeholder: "1/1234567890...",
        type: "password",
        help: "Create at app.asana.com/0/developer-console",
      },
      {
        key: "projectId",
        label: "Project GID (optional)",
        placeholder: "1234567890",
        type: "text",
      },
    ],
  },
  {
    key: "monday" as const,
    name: "Monday.com",
    icon: CheckSquare,
    description: "Create items from action items",
    outputTypes: ["action_items"],
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    fields: [
      {
        key: "apiKey",
        label: "API Token",
        placeholder: "eyJhbGc...",
        type: "password",
        help: "Find at monday.com > Admin > API",
      },
      {
        key: "boardId",
        label: "Board ID",
        placeholder: "1234567890",
        type: "text",
        help: "Required - find in the board URL",
      },
    ],
  },
  {
    key: "google" as const,
    name: "Google Workspace",
    icon: Presentation,
    description: "Push slide decks to Google Slides, one-pagers to Google Docs",
    outputTypes: ["slide_content", "client_one_pager"],
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    fields: [],
    isOAuth: true,
  },
];

export function IntegrationsManager() {
  const { integrations, setIntegration, removeIntegration } = useAppStore();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    key: string;
    success: boolean;
    message: string;
  } | null>(null);

  const handleSave = (key: string) => {
    const config = { ...formState };
    setIntegration(key as keyof typeof integrations, config as never);
    setExpandedKey(null);
    setFormState({});
  };

  const handleDisconnect = (key: string) => {
    removeIntegration(key as keyof typeof integrations);
  };

  const handleExpand = (key: string) => {
    if (expandedKey === key) {
      setExpandedKey(null);
      setFormState({});
      return;
    }
    setExpandedKey(key);
    // Pre-fill form with existing config
    const existing = integrations[key as keyof typeof integrations];
    if (existing) {
      setFormState(existing as Record<string, string>);
    } else {
      setFormState({});
    }
  };

  const handleGoogleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setTestResult({
        key: "google",
        success: false,
        message: "Google OAuth not configured",
      });
      return;
    }
    const redirectUri = `${window.location.origin}/api/integrations/google/callback`;
    const scope = encodeURIComponent(
      "https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/documents"
    );
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  };

  const handleTest = async (key: string) => {
    setTestingKey(key);
    setTestResult(null);

    try {
      if (key === "slack") {
        const config = integrations.slack;
        if (!config?.webhookUrl) throw new Error("No webhook URL configured");
        const res = await fetch("/api/integrations/slack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl: config.webhookUrl,
            content: "Test message from Crisp - your integration is working!",
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        setTestResult({ key, success: true, message: "Message sent!" });
      } else {
        setTestResult({ key, success: true, message: "Connection saved" });
      }
    } catch (err) {
      setTestResult({
        key,
        success: false,
        message: err instanceof Error ? err.message : "Test failed",
      });
    } finally {
      setTestingKey(null);
    }
  };

  const isConnected = (key: string) => {
    const config = integrations[key as keyof typeof integrations];
    if (!config) return false;
    if (key === "google") return !!(config as { accessToken?: string }).accessToken;
    return true;
  };

  return (
    <div className="space-y-3">
      {INTEGRATIONS.map((integration) => {
        const connected = isConnected(integration.key);
        const expanded = expandedKey === integration.key;

        return (
          <motion.div
            key={integration.key}
            layout
            className="rounded-2xl border border-dark-700/50 bg-dark-900/30 overflow-hidden"
          >
            <button
              onClick={() =>
                integration.isOAuth ? undefined : handleExpand(integration.key)
              }
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${integration.bg} border ${integration.border} flex items-center justify-center`}
                >
                  <integration.icon
                    className={`w-4 h-4 ${integration.color}`}
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-dark-100">
                      {integration.name}
                    </h3>
                    {connected && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-400">
                    {integration.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTest(integration.key);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-dark-800 text-dark-400 hover:text-dark-200 border border-dark-700/50 transition-all"
                  >
                    {testingKey === integration.key ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Test"
                    )}
                  </button>
                )}
                {integration.isOAuth ? (
                  connected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisconnect(integration.key);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 transition-all"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoogleConnect();
                      }}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-crisp-500/10 text-crisp-400 border border-crisp-500/20 hover:bg-crisp-500/15 transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Connect
                    </button>
                  )
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpand(integration.key);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-dark-800 text-dark-300 border border-dark-700/50 hover:text-dark-100 transition-all"
                  >
                    {connected ? "Edit" : "Configure"}
                  </button>
                )}
              </div>
            </button>

            {/* Test result */}
            <AnimatePresence>
              {testResult && testResult.key === integration.key && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`mx-4 mb-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
                      testResult.success
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {testResult.message}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expandable config form */}
            <AnimatePresence>
              {expanded && !integration.isOAuth && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-dark-800/50 pt-3">
                    {integration.fields.map((field) => (
                      <div key={field.key}>
                        <label className="text-xs text-dark-300 font-medium mb-1 block">
                          {field.label}
                        </label>
                        <input
                          type={field.type || "text"}
                          value={formState[field.key] || ""}
                          onChange={(e) =>
                            setFormState((s) => ({
                              ...s,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          className="w-full bg-dark-800/50 border border-dark-700/50 rounded-xl px-3 py-2 text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:border-crisp-500/30 transition-colors"
                        />
                        {field.help && (
                          <p className="text-[10px] text-dark-500 mt-1">
                            {field.help}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleSave(integration.key)}
                        className="px-4 py-2 rounded-xl bg-crisp-500/10 text-crisp-400 border border-crisp-500/20 text-xs font-medium hover:bg-crisp-500/15 transition-all"
                      >
                        Save
                      </button>
                      {connected && (
                        <button
                          onClick={() => handleDisconnect(integration.key)}
                          className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/15 transition-all"
                        >
                          Disconnect
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setExpandedKey(null);
                          setFormState({});
                        }}
                        className="px-4 py-2 rounded-xl text-dark-400 text-xs font-medium hover:text-dark-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
