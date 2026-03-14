import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
  "/api/crisp(.*)",
  "/api/calibrate(.*)",
  "/api/voice-profile(.*)",
]);

// Public routes: /, /api/stripe/webhook, sign-in, sign-up
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/stripe/webhook",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request) && !isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
