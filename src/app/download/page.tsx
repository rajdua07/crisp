"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import {
  Download,
  Monitor,
  Cpu,
  Shield,
  Clipboard,
  Fingerprint,
  ArrowRight,
  Check,
  Globe,
} from "lucide-react";

interface ReleaseInfo {
  version: string | null;
  date?: string;
  dmgUrl?: string | null;
  dmgUrlIntel?: string | null;
  notes?: string;
  message?: string;
}

type Platform = "mac-arm" | "mac-intel" | "windows" | "linux" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes("mac")) {
    // Check for Apple Silicon — WebGL renderer heuristic
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer && renderer.toLowerCase().includes("apple")) {
            return "mac-arm";
          }
        }
      }
    } catch {
      // Fall through
    }
    return "mac-arm"; // Default to ARM for modern Macs
  }

  if (ua.includes("win")) return "windows";
  if (ua.includes("linux")) return "linux";
  return "unknown";
}

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPlatform(detectPlatform());

    fetch("/api/desktop/latest")
      .then((r) => r.json())
      .then(setRelease)
      .catch(() => setRelease({ version: null, message: "Coming soon" }))
      .finally(() => setLoading(false));
  }, []);

  const isMac = platform === "mac-arm" || platform === "mac-intel";
  const primaryUrl =
    platform === "mac-intel" ? release?.dmgUrlIntel : release?.dmgUrl;

  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      <Navbar />

      <section className="relative pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[300px] sm:h-[600px] bg-crisp-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dark-700/50 bg-dark-900/50 text-xs text-dark-300 mb-8"
          >
            <Monitor className="w-3 h-3 text-crisp-400" />
            Desktop App for macOS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Your voice,{" "}
            <span className="gradient-text">right in your menu bar</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-dark-300 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Copy from ChatGPT, paste anywhere. Crisp detects AI content on your
            clipboard and offers to rewrite it in your voice — one click, no tab
            switching.
          </motion.p>

          {/* Download button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            {loading ? (
              <div className="px-8 py-4 rounded-2xl bg-dark-800 text-dark-400 text-sm">
                Checking for latest version...
              </div>
            ) : release?.version && primaryUrl ? (
              <>
                <a
                  href={primaryUrl}
                  className="group bg-gradient-to-r from-crisp-600 to-crisp-500 text-white px-10 py-4 rounded-2xl font-semibold text-sm shadow-lg shadow-crisp-500/25 hover:shadow-crisp-500/40 transition-all duration-300 flex items-center gap-3 glow"
                >
                  <Download className="w-5 h-5" />
                  Download for Mac
                  {platform === "mac-intel" ? " (Intel)" : " (Apple Silicon)"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <div className="flex items-center gap-4 text-xs text-dark-500">
                  <span>v{release.version}</span>
                  {release.date && (
                    <>
                      <span className="text-dark-700">|</span>
                      <span>{release.date}</span>
                    </>
                  )}
                  <span className="text-dark-700">|</span>
                  <span>macOS 12+</span>
                </div>

                {/* Alternate architecture link */}
                {isMac && release.dmgUrl && release.dmgUrlIntel && (
                  <a
                    href={
                      platform === "mac-intel"
                        ? release.dmgUrl
                        : release.dmgUrlIntel
                    }
                    className="text-xs text-dark-500 hover:text-dark-300 underline underline-offset-2 transition-colors"
                  >
                    Download for{" "}
                    {platform === "mac-intel" ? "Apple Silicon" : "Intel"}{" "}
                    instead
                  </a>
                )}
              </>
            ) : (
              <div className="space-y-3 text-center">
                <div className="px-8 py-4 rounded-2xl border border-dark-700/50 bg-dark-900/30 text-dark-300 text-sm">
                  The Mac app is coming soon. Use the web app in the meantime.
                </div>
                <a
                  href="/app"
                  className="inline-flex items-center gap-2 text-sm text-crisp-400 hover:text-crisp-300 transition-colors"
                >
                  Open Web App
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {!isMac && platform !== "unknown" && (
              <div className="mt-4 px-6 py-3 rounded-xl border border-dark-700/50 bg-dark-900/30 text-sm text-dark-400">
                <p>
                  The desktop app is currently macOS only.{" "}
                  <a
                    href="/app"
                    className="text-crisp-400 hover:text-crisp-300 transition-colors"
                  >
                    Use the web app
                  </a>{" "}
                  or the{" "}
                  <a
                    href="#extension"
                    className="text-crisp-400 hover:text-crisp-300 transition-colors"
                  >
                    browser extension
                  </a>{" "}
                  on any platform.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-center mb-12"
          >
            How it <span className="gradient-text">works</span>
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                icon: Clipboard,
                title: "Copy AI text",
                desc: "Copy from ChatGPT, Claude, or any AI tool. Crisp watches your clipboard automatically.",
              },
              {
                step: "2",
                icon: Fingerprint,
                title: "Crisp pops up",
                desc: "A small popover appears showing AI confidence and a preview. Click to rewrite in your voice.",
              },
              {
                step: "3",
                icon: Check,
                title: "Paste as you",
                desc: "The rewritten text replaces your clipboard. Just paste — it sounds like you wrote it.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-6 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-4 h-4 text-crisp-400" />
                </div>
                <h3 className="text-sm font-semibold text-dark-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {[
              {
                icon: Shield,
                title: "Signed & Notarized",
                desc: "The app is code-signed and notarized by Apple. No scary \"unidentified developer\" warnings — just download, drag to Applications, and go.",
              },
              {
                icon: Cpu,
                title: "Native Performance",
                desc: "Built with Tauri (Rust). Under 15MB download, minimal memory usage, no Electron bloat. Runs natively on Apple Silicon and Intel.",
              },
              {
                icon: Fingerprint,
                title: "Uses Your Voice DNA",
                desc: "Pulls your voice profile from your Crisp account. Same voice that powers the web app, now available system-wide.",
              },
              {
                icon: Monitor,
                title: "Menu Bar App",
                desc: "Lives in your menu bar, not your dock. Out of the way until you need it. Adjust sensitivity, toggle auto-rewrite, and manage your account from the tray.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-4 rounded-2xl border border-dark-700/50 bg-dark-900/30 hover:border-dark-600/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-crisp-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-dark-100 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-dark-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Browser Extension callout */}
      <section id="extension" className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-6 sm:p-8 text-center"
          >
            <Globe className="w-8 h-8 text-crisp-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark-100 mb-2">
              Prefer a browser extension?
            </h2>
            <p className="text-sm text-dark-400 mb-6 max-w-md mx-auto">
              The Crisp extension detects AI text when you paste into Gmail,
              Slack, Notion, LinkedIn, and more. Same voice rewriting, right
              inside your browser.
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="px-4 py-2 rounded-xl border border-dark-700/50 bg-dark-900/40 text-sm text-dark-400">
                Chrome — Coming Soon
              </span>
              <span className="px-4 py-2 rounded-xl border border-dark-700/50 bg-dark-900/40 text-sm text-dark-400">
                Safari — Coming Soon
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-dark-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="small" />
          <p className="text-xs text-dark-500">
            Your voice. Not the machine&apos;s.
          </p>
        </div>
      </footer>
    </div>
  );
}
