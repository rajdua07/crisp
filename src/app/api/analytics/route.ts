import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    const prisma = getPrisma();

    // Fetch all sessions with outputs and feedback for this user
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      include: {
        outputs: {
          include: { feedback: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // ─── Compute analytics ───

    const totalCrisps = sessions.length;
    const totalOutputs = sessions.reduce((sum, s) => sum + s.outputs.length, 0);

    // Thought depth trend (weekly averages)
    const weeklyDepth: Record<string, { total: number; count: number }> = {};
    for (const session of sessions) {
      if (!session.thoughtDepth) continue;
      const td = session.thoughtDepth as Record<string, number>;
      const weekKey = getWeekKey(new Date(session.createdAt));
      if (!weeklyDepth[weekKey]) weeklyDepth[weekKey] = { total: 0, count: 0 };
      weeklyDepth[weekKey].total += td.total ?? 0;
      weeklyDepth[weekKey].count += 1;
    }
    const thoughtDepthTrend = Object.entries(weeklyDepth)
      .map(([week, data]) => ({
        week,
        avgScore: Math.round((data.total / data.count) * 10) / 10,
        count: data.count,
      }))
      .slice(-12); // Last 12 weeks

    // Output type usage
    const typeUsage: Record<string, number> = {};
    for (const session of sessions) {
      for (const output of session.outputs) {
        typeUsage[output.outputTypeName] = (typeUsage[output.outputTypeName] || 0) + 1;
      }
    }
    const topOutputTypes = Object.entries(typeUsage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Feedback stats
    let thumbsUp = 0;
    let thumbsDown = 0;
    for (const session of sessions) {
      for (const output of session.outputs) {
        for (const fb of output.feedback) {
          if (fb.rating === "up") thumbsUp++;
          else thumbsDown++;
        }
      }
    }

    // Crisps per week (activity chart)
    const weeklyActivity: Record<string, number> = {};
    for (const session of sessions) {
      const weekKey = getWeekKey(new Date(session.createdAt));
      weeklyActivity[weekKey] = (weeklyActivity[weekKey] || 0) + 1;
    }
    const activityTrend = Object.entries(weeklyActivity)
      .map(([week, count]) => ({ week, count }))
      .slice(-12);

    // Estimated time saved (assume 8 mins saved per crisp — industry average for manual rewriting)
    const minutesSaved = totalOutputs * 8;
    const hoursSaved = Math.round((minutesSaved / 60) * 10) / 10;

    // Voice consistency: ratio of thumbs-up to total feedback
    const totalFeedback = thumbsUp + thumbsDown;
    const voiceConsistency = totalFeedback > 0 ? Math.round((thumbsUp / totalFeedback) * 100) : null;

    // Streak: consecutive days with at least one crisp
    const streak = calculateStreak(sessions.map((s) => new Date(s.createdAt)));

    // Audience breakdown
    const audienceUsage: Record<string, number> = {};
    for (const session of sessions) {
      const key = session.audienceId || "general";
      audienceUsage[key] = (audienceUsage[key] || 0) + 1;
    }

    return NextResponse.json({
      totalCrisps,
      totalOutputs,
      hoursSaved,
      voiceConsistency,
      streak,
      thumbsUp,
      thumbsDown,
      thoughtDepthTrend,
      topOutputTypes,
      activityTrend,
      audienceUsage,
      memberSince: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
  return d.toISOString().split("T")[0];
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = new Set(dates.map((d) => d.toISOString().split("T")[0]));
  const sortedDays = Array.from(uniqueDays).sort().reverse();

  // Check if today or yesterday is in the set (allow 1-day grace)
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (!uniqueDays.has(today) && !uniqueDays.has(yesterday)) return 0;

  let streak = 0;
  const checkDate = new Date(sortedDays[0]);

  for (let i = 0; i < 365; i++) {
    const key = checkDate.toISOString().split("T")[0];
    if (uniqueDays.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
