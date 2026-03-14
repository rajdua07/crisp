"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { useAppStore } from "@/lib/store";
import { ArrowLeft, Search, Clock, FileText, ChevronRight } from "lucide-react";

export default function HistoryPage() {
  const { sessions } = useAppStore();
  const [search, setSearch] = useState("");

  const filtered = sessions.filter((s) =>
    s.inputText.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass"
      >
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/app"
              className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <Logo size="small" />
            <span className="text-dark-500 text-sm">/ History</span>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-dark-100">History</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search crisps..."
                className="bg-dark-900/50 border border-dark-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:border-crisp-500/30 w-64 transition-colors"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Clock className="w-12 h-12 text-dark-700 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-dark-400 mb-2">
                {sessions.length === 0 ? "No crisps yet" : "No matches"}
              </h2>
              <p className="text-sm text-dark-500">
                {sessions.length === 0
                  ? "Your crisp history will appear here."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((session, i) => (
                <motion.a
                  key={session.id}
                  href={`/app?session=${session.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="block rounded-2xl border border-dark-700/50 bg-dark-900/30 hover:bg-dark-800/30 hover:border-dark-600/50 p-5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-4 h-4 text-dark-500 flex-shrink-0" />
                        <p className="text-sm text-dark-200 line-clamp-2 leading-relaxed">
                          {session.inputText.slice(0, 200)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-dark-500">
                        <span>{formatDate(session.createdAt)}</span>
                        <span>{session.outputs.length} outputs</span>
                        {session.thoughtDepthScore && (
                          <span className="flex items-center gap-1">
                            Score:{" "}
                            {(session.thoughtDepthScore as Record<string, unknown>).total as number}/25
                          </span>
                        )}
                        {session.chainParentId && (
                          <span className="text-crisp-400">Chained</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-dark-400 flex-shrink-0 mt-1" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
