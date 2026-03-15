"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  Flame,
  ThumbsUp,
  BarChart3,
  Zap,
  Target,
} from "lucide-react";

interface AnalyticsData {
  totalCrisps: number;
  totalOutputs: number;
  hoursSaved: number;
  voiceConsistency: number | null;
  streak: number;
  thumbsUp: number;
  thumbsDown: number;
  thoughtDepthTrend: { week: string; avgScore: number; count: number }[];
  topOutputTypes: { name: string; count: number }[];
  activityTrend: { week: string; count: number }[];
  memberSince: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "crisp",
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  delay?: number;
}) {
  const colorMap: Record<string, string> = {
    crisp: "bg-crisp-500/10 border-crisp-500/20 text-crisp-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[color]}`}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
        <span className="text-xs text-dark-500 uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-dark-100">{value}</div>
      {sub && <div className="text-xs text-dark-500 mt-1">{sub}</div>}
    </motion.div>
  );
}

function MiniBarChart({
  data,
  maxValue,
}: {
  data: { label: string; value: number }[];
  maxValue: number;
}) {
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-dark-400 w-28 truncate">{item.label}</span>
          <div className="flex-1 h-5 bg-dark-800/50 rounded-lg overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="h-full bg-gradient-to-r from-crisp-600 to-crisp-500 rounded-lg"
            />
          </div>
          <span className="text-xs text-dark-300 font-mono w-8 text-right">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ActivityChart({
  data,
}: {
  data: { week: string; count: number }[];
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((item, i) => (
        <motion.div
          key={item.week}
          initial={{ height: 0 }}
          animate={{ height: `${(item.count / max) * 100}%` }}
          transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
          className="flex-1 bg-gradient-to-t from-crisp-600 to-crisp-500 rounded-t-md min-h-[4px] relative group cursor-default"
          title={`${formatWeek(item.week)}: ${item.count} crisps`}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-800 border border-dark-700/50 rounded-lg px-2 py-1 text-[10px] text-dark-200 whitespace-nowrap pointer-events-none z-10">
            {item.count} crisps
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ThoughtDepthChart({
  data,
}: {
  data: { week: string; avgScore: number }[];
}) {
  const max = Math.max(...data.map((d) => d.avgScore), 1);
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (d.avgScore / max) * 80;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-24">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="tdGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--crisp-500))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(var(--crisp-500))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {data.length > 1 && (
          <>
            <polyline
              fill="none"
              stroke="rgb(var(--crisp-500))"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              points={points}
            />
            <polygon
              fill="url(#tdGrad)"
              points={`0,100 ${points} 100,100`}
            />
          </>
        )}
        {data.map((d, i) => {
          const x = (i / Math.max(data.length - 1, 1)) * 100;
          const y = 100 - (d.avgScore / max) * 80;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="rgb(var(--crisp-500))"
              className="hover:r-3 transition-all"
            />
          );
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {data.length > 0 && (
          <>
            <span className="text-[10px] text-dark-600">
              {formatWeek(data[0].week)}
            </span>
            <span className="text-[10px] text-dark-600">
              {formatWeek(data[data.length - 1].week)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function formatWeek(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass"
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/app"
              className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <Logo size="small" />
            <span className="text-dark-500 text-sm">/ Analytics</span>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-5 h-28 shimmer"
              />
            ))}
          </div>
        ) : !data ? (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-dark-700 mx-auto mb-4" />
            <p className="text-dark-400">Unable to load analytics.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-dark-100">Analytics</h1>
              <span className="text-xs text-dark-500">
                Member since{" "}
                {new Date(data.memberSince).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Hero stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Zap}
                label="Total Crisps"
                value={data.totalCrisps}
                sub={`${data.totalOutputs} outputs generated`}
                color="crisp"
                delay={0}
              />
              <StatCard
                icon={Clock}
                label="Time Saved"
                value={`${data.hoursSaved}h`}
                sub="Est. @ 8 min per output"
                color="emerald"
                delay={0.1}
              />
              <StatCard
                icon={Flame}
                label="Streak"
                value={`${data.streak} day${data.streak !== 1 ? "s" : ""}`}
                sub="Consecutive days crisping"
                color="amber"
                delay={0.2}
              />
              <StatCard
                icon={Target}
                label="Voice Match"
                value={
                  data.voiceConsistency !== null
                    ? `${data.voiceConsistency}%`
                    : "—"
                }
                sub={
                  data.voiceConsistency !== null
                    ? `${data.thumbsUp} thumbs up`
                    : "Rate outputs to track"
                }
                color="violet"
                delay={0.3}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Activity chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-dark-500" />
                  <span className="text-sm font-medium text-dark-200">
                    Weekly Activity
                  </span>
                </div>
                {data.activityTrend.length > 0 ? (
                  <ActivityChart data={data.activityTrend} />
                ) : (
                  <div className="h-24 flex items-center justify-center text-xs text-dark-600">
                    No activity data yet
                  </div>
                )}
              </motion.div>

              {/* Thought depth trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-dark-500" />
                  <span className="text-sm font-medium text-dark-200">
                    Thought Depth Trend
                  </span>
                </div>
                {data.thoughtDepthTrend.length > 0 ? (
                  <ThoughtDepthChart data={data.thoughtDepthTrend} />
                ) : (
                  <div className="h-24 flex items-center justify-center text-xs text-dark-600">
                    Score more crisps to see trends
                  </div>
                )}
              </motion.div>
            </div>

            {/* Top output types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-dark-700/50 bg-dark-900/50 p-5 mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp className="w-4 h-4 text-dark-500" />
                <span className="text-sm font-medium text-dark-200">
                  Most Used Output Types
                </span>
              </div>
              {data.topOutputTypes.length > 0 ? (
                <MiniBarChart
                  data={data.topOutputTypes.map((t) => ({
                    label: t.name,
                    value: t.count,
                  }))}
                  maxValue={data.topOutputTypes[0]?.count || 1}
                />
              ) : (
                <div className="text-center py-8 text-xs text-dark-600">
                  Generate some crisps to see your preferences
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
