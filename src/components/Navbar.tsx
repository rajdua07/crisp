"use client";

import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { useAuth, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-40 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <a href="/">
          <Logo size="small" />
        </a>
        <div className="flex items-center gap-6">
          <a
            href="#pricing"
            className="text-sm text-dark-300 hover:text-dark-100 transition-colors hidden sm:block"
          >
            Pricing
          </a>
          {isSignedIn ? (
            <>
              <a
                href="/app"
                className="text-sm font-medium bg-dark-800/80 hover:bg-dark-700 text-dark-100 px-4 py-2 rounded-xl border border-dark-700/50 hover:border-dark-600/50 transition-all"
              >
                Launch App
              </a>
              <UserButton />
            </>
          ) : (
            <>
              <a
                href="/sign-in"
                className="text-sm text-dark-300 hover:text-dark-100 transition-colors hidden sm:block"
              >
                Sign In
              </a>
              <a
                href="/sign-up"
                className="text-sm font-medium bg-dark-800/80 hover:bg-dark-700 text-dark-100 px-4 py-2 rounded-xl border border-dark-700/50 hover:border-dark-600/50 transition-all"
              >
                Get Started
              </a>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
