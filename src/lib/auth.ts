import { prisma } from "./prisma";
import { DEFAULT_AUDIENCES } from "./store";

const hasClerk = !!process.env.CLERK_SECRET_KEY;

/**
 * Get or create the DB user for the current Clerk session.
 * Falls back to a local dev user when Clerk is not configured.
 */
export async function getOrCreateUser() {
  let clerkId: string;

  if (hasClerk) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }
    clerkId = userId;
  } else {
    // Dev mode — use a stable local user id
    clerkId = "local_dev_user";
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    let email = "dev@localhost";

    if (hasClerk) {
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      email = clerkUser?.emailAddresses[0]?.emailAddress || "";
    }

    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        audiences: {
          create: DEFAULT_AUDIENCES.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            icon: a.icon,
            formality: a.tonePreset.formality,
            warmth: a.tonePreset.warmth,
            detail: a.tonePreset.detail,
            isDefault: a.id === "team",
          })),
        },
      },
    });
  }

  // Check if monthly usage needs reset
  const now = new Date();
  const resetAt = new Date(user.crispsResetAt);
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        crispsUsedThisMonth: 0,
        crispsResetAt: now,
      },
    });
  }

  return user;
}

/**
 * Get the current user's plan limits.
 */
export function getPlanLimits(plan: string) {
  const limits: Record<string, { crispsPerMonth: number; maxVoiceProfiles: number; maxOutputTypes: number; hasChain: boolean; hasCustomTypes: boolean; hasCalibration: boolean; maxAudiences: number }> = {
    FREE: { crispsPerMonth: 10, maxVoiceProfiles: 1, maxOutputTypes: 3, hasChain: false, hasCustomTypes: false, hasCalibration: false, maxAudiences: 3 },
    PRO: { crispsPerMonth: Infinity, maxVoiceProfiles: 3, maxOutputTypes: 8, hasChain: true, hasCustomTypes: true, hasCalibration: true, maxAudiences: Infinity },
    TEAM: { crispsPerMonth: Infinity, maxVoiceProfiles: 10, maxOutputTypes: 20, hasChain: true, hasCustomTypes: true, hasCalibration: true, maxAudiences: Infinity },
    ENTERPRISE: { crispsPerMonth: Infinity, maxVoiceProfiles: Infinity, maxOutputTypes: Infinity, hasChain: true, hasCustomTypes: true, hasCalibration: true, maxAudiences: Infinity },
  };
  return limits[plan] || limits.FREE;
}
