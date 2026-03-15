"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, PLAN_LIMITS } from "@/lib/store";
import { Logo } from "./Logo";
import {
  Plus,
  Settings,
  Sparkles,
  ChevronLeft,
  Zap,
  FileText,
  BarChart3,
  Star,
  Clock,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewCrisp: () => void;
  onSelectSession: (sessionId: string) => void;
  onOpenSettings: () => void;
  activeSessionId: string | null;
  onShowUpgrade: () => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  onNewCrisp,
  onSelectSession,
  onOpenSettings,
  activeSessionId,
  onShowUpgrade,
}: SidebarProps) {
  const { sessions, user } = useAppStore();
  const limits = PLAN_LIMITS[user.plan];

  // Group sessions by date
  const today = new Date();
  const todaySessions = sessions.filter((s) => {
    const d = new Date(s.createdAt);
    return d.toDateString() === today.toDateString();
  });
  const yesterdaySessions = sessions.filter((s) => {
    const d = new Date(s.createdAt);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
  });
  const olderSessions = sessions.filter((s) => {
    const d = new Date(s.createdAt);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return d < yesterday;
  });

  const truncate = (text: string, maxLen: number) =>
    text.length > maxLen ? text.slice(0, maxLen) + "..." : text;

  const SessionGroup = ({
    label,
    items,
  }: {
    label: string;
    items: typeof sessions;
  }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest text-dark-500 font-medium px-3 mb-1.5">
          {label}
        </div>
        {items.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all group ${
              activeSessionId === session.id
                ? "bg-dark-800/80 text-dark-100"
                : "text-dark-400 hover:text-dark-200 hover:bg-dark-800/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
              <span className="truncate text-xs">
                {session.summary || truncate(session.inputText, 50)}
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        style={{ maxWidth: "85vw" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:relative top-0 left-0 h-[100dvh] z-40 bg-dark-950 border-r border-dark-800/50 flex flex-col overflow-hidden ${
          isOpen ? "" : "lg:w-0"
        }`}
      >
        <div className="flex-1 flex flex-col w-[85vw] max-w-[280px] min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-800/50">
            <Logo size="small" />
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-800/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* New Crisp button */}
          <div className="p-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewCrisp}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800/80 hover:bg-dark-700/80 border border-dark-700/50 text-sm text-dark-200 font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              New Crisp
            </motion.button>
          </div>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {/* Starred sessions */}
            {sessions.some((s) => s.starred) && (
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-widest text-dark-500 font-medium px-3 mb-1.5 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-amber-400" />
                  Starred
                </div>
                {sessions
                  .filter((s) => s.starred)
                  .map((session) => (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all group ${
                        activeSessionId === session.id
                          ? "bg-dark-800/80 text-dark-100"
                          : "text-dark-400 hover:text-dark-200 hover:bg-dark-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 flex-shrink-0 text-amber-400/60" />
                        <span className="truncate text-xs">
                          {session.summary || session.inputText.slice(0, 50)}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            )}

            {sessions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Sparkles className="w-8 h-8 text-dark-700 mx-auto mb-3" />
                <p className="text-xs text-dark-500">
                  Your crisps will appear here
                </p>
              </div>
            ) : (
              <>
                <SessionGroup label="Today" items={todaySessions} />
                <SessionGroup label="Yesterday" items={yesterdaySessions} />
                <SessionGroup label="Previous" items={olderSessions} />
              </>
            )}
          </div>

          {/* Bottom section */}
          <div className="p-3 border-t border-dark-800/50 space-y-2">
            {/* Usage */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between text-xs text-dark-500 mb-1.5">
                <span>
                  {user.crispsUsedThisMonth}/{limits.crispsPerMonth === Infinity ? "∞" : limits.crispsPerMonth} crisps
                </span>
                <span className="capitalize text-dark-400">{user.plan} plan</span>
              </div>
              {user.plan === "free" && (
                <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-crisp-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min((user.crispsUsedThisMonth / limits.crispsPerMonth) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {user.plan === "free" && (
              <button
                onClick={onShowUpgrade}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-crisp-600/10 to-crisp-500/10 border border-crisp-500/20 text-crisp-400 text-xs font-medium hover:from-crisp-600/15 hover:to-crisp-500/15 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade to Pro
              </button>
            )}

            <a
              href="/app/analytics"
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/40 text-xs transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </a>

            <a
              href="/app/history"
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/40 text-xs transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              History
            </a>

            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/40 text-xs transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
