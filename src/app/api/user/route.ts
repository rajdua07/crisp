import { getOrCreateUser, getPlanLimits } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    const limits = getPlanLimits(user.plan);

    // Fetch all user data in parallel
    const [voiceProfiles, audiences, sessions] =
      await Promise.all([
        prisma.voiceProfile.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.audience.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
        }),
        prisma.session.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 100,
          include: { outputs: true },
        }),
      ]);

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan.toLowerCase(),
        crispsUsedThisMonth: user.crispsUsedThisMonth,
        crispsResetAt: user.crispsResetAt.toISOString(),
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      },
      limits,
      voiceProfiles: voiceProfiles.map((vp) => ({
        id: vp.id,
        name: vp.name,
        source: vp.source,
        profileData: vp.profileData,
        writingSamples: vp.writingSamples,
        voiceTranscript: vp.voiceTranscript,
        isDefault: vp.isDefault,
        createdAt: vp.createdAt.toISOString(),
        updatedAt: vp.updatedAt.toISOString(),
      })),
      audiences: audiences.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        tonePreset: {
          formality: a.formality,
          warmth: a.warmth,
          detail: a.detail,
        },
      })),
      sessions: sessions.map((s) => ({
        id: s.id,
        inputText: s.inputText,
        summary: s.summary,
        thoughtDepthScore: s.thoughtDepth,
        outputs: s.outputs.map((o) => ({
          id: o.id,
          outputConfig: (o.outputConfig as Record<string, unknown>) || {
            length: "medium",
            format: "default",
            humanify: false,
          },
          content: o.content,
          userEdits: o.userEdits,
          copied: false,
          voiceProfileId: o.voiceProfileId,
        })),
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to load user data" },
      { status: 500 }
    );
  }
}
