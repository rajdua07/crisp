"use client";

import dynamic from "next/dynamic";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Re-export Clerk components that gracefully degrade when Clerk is not configured
export const SafeUserButton = hasClerk
  ? dynamic(() => import("@clerk/nextjs").then((m) => m.UserButton), {
      ssr: false,
      loading: () => <div className="w-7 h-7 rounded-full bg-dark-800" />,
    })
  : () => null;

export function useAuthSafe() {
  if (!hasClerk) {
    return { isSignedIn: true, isLoaded: true };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks, @typescript-eslint/no-require-imports
  return require("@clerk/nextjs").useAuth();
}
