"use client";

import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import {
  Briefcase,
  Mail,
  CheckSquare,
  MessageSquare,
  Shield,
  ArrowRight,
  Check,
  Upload,
  Download,
  FileText,
  BarChart3,
  Share2,
  Bookmark,
  Star,
  TrendingUp,
  Flame,
  Presentation,
  Mic,
  Fingerprint,
  PenLine,
  UserCheck,
  Monitor,
  Globe,
  Clipboard,
  Zap,
} from "lucide-react";

const OUTPUT_CARDS = [
  { icon: Briefcase, name: "Exec Brief", preview: "We need to move on the Acosta deal this week. Here's why—", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  { icon: Mail, name: "Email Draft", preview: "Hey Sarah — quick one on the Q2 numbers. Three things jumped out...", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { icon: CheckSquare, name: "Action Items", preview: "- Lock pricing by Thursday (Jake owns)\n- Pull churn data for board deck", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { icon: MessageSquare, name: "Slack Message", preview: "heads up — just reviewed the strat doc, few things to flag before friday", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { icon: FileText, name: "Document (DOCX)", preview: "Professional formatted doc, ready to download", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", downloadable: ".docx" },
  { icon: Presentation, name: "Report (PDF)", preview: "Formal report with sections, ready to share", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20", downloadable: ".pdf" },
];

const PRICING_TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Find your voice",
    features: [
      "10 crisps per month",
      "3 output types",
      "Basic Voice DNA",
      "Thought Depth Score",
      "PDF & DOCX upload",
      "Analytics dashboard",
    ],
    cta: "Get Started Free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Own your voice everywhere",
    features: [
      "Unlimited crisps",
      "All 12+ output types",
      "DOCX & PDF export",
      "3 voice profiles",
      "Voice calibration (learns from edits)",
      "Templates & favorites",
      "Public share links",
      "Chain & custom output types",
    ],
    cta: "Start Pro Trial",
    featured: true,
  },
  {
    name: "Team",
    price: "$39",
    period: "/user/month",
    description: "One brand voice, every person",
    features: [
      "Everything in Pro",
      "10 voice profiles",
      "Shared brand voice library",
      "Team analytics",
      "Admin dashboard",
      "Priority processing",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 grid-bg">
      <Navbar />

      {/* Hero — Voice is the headline */}
      <section className="relative pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[300px] sm:h-[600px] bg-crisp-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dark-700/50 bg-dark-900/50 text-xs text-dark-300 mb-8"
          >
            <Fingerprint className="w-3 h-3 text-crisp-400" />
            One doc in. Every format out. All in your voice.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Drop one doc.{" "}
            <span className="gradient-text">Get every format, in your voice.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed"
          >
            Humanizers smooth a few words. Crisp transforms one document into
            exec briefs, emails, Slack messages, slide decks, and downloadable
            docs — all rewritten in
            <em className="text-dark-100 not-italic font-medium"> your </em>
            voice, for the right audience, in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="/app"
              className="group bg-gradient-to-r from-crisp-600 to-crisp-500 text-white px-8 py-4 rounded-2xl font-semibold text-sm shadow-lg shadow-crisp-500/25 hover:shadow-crisp-500/40 transition-all duration-300 flex items-center gap-2 glow"
            >
              Crisp It Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="/try"
              className="text-dark-300 hover:text-dark-100 px-8 py-4 rounded-2xl font-medium text-sm border border-dark-700/50 hover:border-dark-600/50 bg-dark-900/30 hover:bg-dark-800/50 transition-all"
            >
              See the difference
            </a>
          </motion.div>
        </div>
      </section>

      {/* The Problem — humanizers vs. Crisp */}
      <section id="the-problem" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Humanizers polish one text.{" "}
              <span className="gradient-text">Crisp transforms it into six.</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              AI humanizers give you back the same document with smoother words.
              Crisp gives you an exec brief, an email, a Slack message, action
              items, and a downloadable PDF — all shaped for different audiences, in
              your voice.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Humanizer approach */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-dark-700/50 border border-dark-600/30 flex items-center justify-center">
                  <span className="text-dark-400 text-xs font-bold">H</span>
                </div>
                <span className="text-xs text-dark-500 font-medium uppercase tracking-wider">
                  A typical humanizer
                </span>
              </div>
              <div className="text-sm text-dark-500 leading-relaxed space-y-3">
                <p>
                  Based on our analysis of Q2 market dynamics and leveraging
                  cross-functional synergies, I recommend a multi-pronged
                  approach to customer acquisition...
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <ArrowRight className="w-3 h-3 text-dark-600" />
                  <span className="text-xs text-dark-600">Same text, slightly smoother</span>
                </div>
                <p>
                  Based on our Q2 analysis and working across teams, I recommend
                  a focused approach to customer acquisition...
                </p>
                <p className="text-dark-700 italic text-xs">
                  One input, one output. Same format. Same audience.
                </p>
              </div>
            </motion.div>

            {/* Crisp approach */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-crisp-500/20 bg-crisp-500/[0.03] p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center">
                  <Fingerprint className="w-3 h-3 text-crisp-400" />
                </div>
                <span className="text-xs text-crisp-400/80 font-medium uppercase tracking-wider">
                  Crisp
                </span>
              </div>
              <div className="text-sm leading-relaxed space-y-2.5">
                <p className="text-dark-200">
                  <span className="text-crisp-400/80 text-xs font-medium mr-1.5">CEO Brief:</span>
                  Q2 revenue hit $2.1M, churn crept to 4.2%. Three things to fix this week.
                </p>
                <p className="text-dark-200">
                  <span className="text-blue-400/80 text-xs font-medium mr-1.5">Email:</span>
                  Hey Sarah — quick one on Q2. Three things jumped out...
                </p>
                <p className="text-dark-200">
                  <span className="text-amber-400/80 text-xs font-medium mr-1.5">Slack:</span>
                  heads up — reviewed the Q2 doc, few things to flag before friday
                </p>
                <p className="text-dark-200">
                  <span className="text-emerald-400/80 text-xs font-medium mr-1.5">Actions:</span>
                  - Lock pricing by Thursday (Jake) - Pull churn data for board deck
                </p>
                <p className="text-crisp-400/60 italic text-xs mt-3">
                  One input, six outputs. Different formats, audiences, and tones. All you.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Voice DNA — the moat section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-crisp-500/20 bg-crisp-500/5 text-xs text-crisp-400 mb-4">
                <Fingerprint className="w-3 h-3" />
                Voice DNA
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Deeper than a 200-word sample.{" "}
                <span className="gradient-text">Voice DNA.</span>
              </h2>
              <p className="text-dark-400 text-base mb-6 leading-relaxed">
                Other tools ask for one writing sample and call it a day.
                Crisp builds a full voice fingerprint from multiple samples,
                voice recordings, and your actual edits. It tracks your
                sentence rhythm, vocabulary, punctuation habits, greeting
                style, and sign-offs — then gets
                <em className="text-dark-200 not-italic font-medium"> sharper every time you correct an output.</em>
              </p>
              <div className="space-y-3">
                {[
                  { icon: PenLine, label: "Learns from your writing samples", desc: "Paste emails, Slack messages, docs — anything you've actually written" },
                  { icon: Mic, label: "Learns from your voice", desc: "Record yourself talking and Crisp captures how you naturally communicate" },
                  { icon: UserCheck, label: "Gets better every time you edit", desc: "Tweak an output and Crisp calibrates to match your corrections" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-900/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5 text-crisp-400" />
                    </div>
                    <div>
                      <div className="text-sm text-dark-200 font-medium">{item.label}</div>
                      <div className="text-xs text-dark-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Voice DNA visualization mock */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <Fingerprint className="w-4 h-4 text-crisp-400" />
                <span className="text-sm font-medium text-dark-200">Your Voice DNA</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Sentence length", value: "Short, punchy", bar: 30 },
                  { label: "Formality", value: "Direct, not stiff", bar: 45 },
                  { label: "Contractions", value: "Always", bar: 90 },
                  { label: "Opener style", value: "\"Hey\" or straight to it", bar: 25 },
                  { label: "Warmth", value: "Warm but efficient", bar: 65 },
                  { label: "Sign-off", value: "\"— Sarah\" or nothing", bar: 20 },
                ].map((trait, i) => (
                  <div key={trait.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-dark-400">{trait.label}</span>
                      <span className="text-[11px] text-dark-300 font-medium">{trait.value}</span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${trait.bar}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-crisp-600 to-crisp-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-dark-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-500">Voice match accuracy</span>
                  <span className="text-sm font-bold text-crisp-400">94%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three steps. <span className="gradient-text">Six outputs. Your voice.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Drop it in",
                desc: "Upload a PDF, DOCX, or paste any AI-generated text. Whatever you need to make yours.",
                color: "text-cyan-400",
                bg: "bg-cyan-400/10",
                border: "border-cyan-400/20",
              },
              {
                step: "02",
                icon: Fingerprint,
                title: "Crisp applies your voice",
                desc: "Your Voice DNA rewrites every output in your style — your sentence length, your word choices, your tone. Not generic. Yours.",
                color: "text-crisp-400",
                bg: "bg-crisp-500/10",
                border: "border-crisp-500/20",
              },
              {
                step: "03",
                icon: Download,
                title: "Ship it everywhere",
                desc: "Copy, download as DOCX or PDF, share a public link, or push to Slack, Notion, and Google Docs. It sounds like you wherever it lands.",
                color: "text-emerald-400",
                bg: "bg-emerald-400/10",
                border: "border-emerald-400/20",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-6 sm:p-8 hover:border-dark-600/50 transition-all duration-300 relative group"
              >
                <div className="absolute top-6 right-6 text-4xl font-extrabold text-dark-800/50 group-hover:text-dark-800/80 transition-colors">
                  {item.step}
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center mb-5`}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-dark-100 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-dark-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo — input → outputs with voice previews */}
      <section id="demo" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              One input. <span className="gradient-text">Every format. Your voice.</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto">
              Each output sounds like you wrote it for that specific context.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-4 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="text-xs text-dark-500 ml-2">Generic AI Output</span>
              </div>
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-dark-800/50 border border-dark-700/30">
                <Upload className="w-3.5 h-3.5 text-dark-500" />
                <span className="text-xs text-dark-400">strategy-deck.pdf</span>
                <span className="text-[10px] text-dark-600 ml-auto">or paste text</span>
              </div>
              <div className="text-sm text-dark-400 leading-relaxed space-y-3">
                <p>
                  Based on our comprehensive analysis of the Q2 market dynamics
                  and leveraging our cross-functional synergies, I would
                  recommend a multi-pronged approach to customer acquisition
                  that focuses on optimizing our value proposition...
                </p>
                <p className="text-dark-600 text-xs mt-2">
                  Could be from anyone. Sounds like nobody.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-dark-800/50">
                <span className="text-[10px] text-dark-600 flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Thought Depth: 14/25
                </span>
                <span className="text-[10px] text-dark-600">|</span>
                <span className="text-[10px] text-crisp-400/60 flex items-center gap-1">
                  <Fingerprint className="w-2.5 h-2.5" />
                  Voice DNA applied
                </span>
              </div>
            </motion.div>

            {/* Output side — with voice-styled previews */}
            <div className="space-y-3">
              {OUTPUT_CARDS.map((card, i) => (
                <motion.div
                  key={card.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-4 hover:bg-dark-800/30 hover:border-dark-600/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg ${card.bg} border ${card.border} flex items-center justify-center flex-shrink-0`}
                    >
                      <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                    </div>
                    <h3 className="text-sm font-semibold text-dark-100 flex-1">
                      {card.name}
                    </h3>
                    {"downloadable" in card && card.downloadable && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-crisp-500/10 border border-crisp-500/20">
                        <Download className="w-2.5 h-2.5 text-crisp-400" />
                        <span className="text-[9px] text-crisp-400 font-medium">{card.downloadable}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-dark-400 leading-relaxed pl-11 line-clamp-2">
                    {card.preview}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Everything else you&apos;d expect.{" "}
              <span className="gradient-text">And more.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Upload,
                title: "Document Ingestion",
                desc: "Upload PDFs and DOCX files. Crisp extracts the text and transforms it in your voice — no copy-paste needed.",
              },
              {
                icon: Download,
                title: "DOCX & PDF Export",
                desc: "Download professionally formatted documents with one click. Your voice, in a file you can send anywhere.",
              },
              {
                icon: Shield,
                title: "Thought Depth Score",
                desc: "Before Crisp rewrites anything, it evaluates if the AI content is worth reshaping. No polishing garbage.",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                desc: "Track time saved, voice consistency score, thought depth trends, and daily streaks. See your ROI.",
              },
              {
                icon: Share2,
                title: "Public Share Links",
                desc: "Share any output via a branded URL. Your voice, publicly visible. Track views and drive adoption.",
              },
              {
                icon: Bookmark,
                title: "Templates & Favorites",
                desc: "Save your go-to workflow as a one-click template. Star your best outputs for instant recall.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5 sm:p-6 hover:border-dark-600/50 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center mb-4 group-hover:bg-crisp-500/15 transition-colors">
                  <feature.icon className="w-4.5 h-4.5 text-crisp-400" />
                </div>
                <h3 className="text-base font-semibold text-dark-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-dark-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations bar */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Your voice, <span className="gradient-text">everywhere you work</span>
            </h2>
            <p className="text-dark-400 text-base mb-8 max-w-lg mx-auto">
              Push outputs directly to the tools your team uses. Every message sounds like you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {["Slack", "Notion", "Google Docs", "Google Slides", "Asana", "Monday.com"].map(
                (name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="px-5 py-2.5 rounded-xl border border-dark-700/50 bg-dark-900/40 text-sm text-dark-300 font-medium"
                  >
                    {name}
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Works Everywhere — Mac app + Browser extension */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-crisp-500/20 bg-crisp-500/5 text-xs text-crisp-400 mb-4">
              <Zap className="w-3 h-3" />
              Coming Soon
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Your voice, <span className="gradient-text">right where you paste</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Copy from ChatGPT. Paste into Slack. Crisp rewrites it in your voice
              before anyone sees the difference.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Monitor,
                title: "Mac App",
                desc: "Lives in your menu bar. Watches your clipboard. When you paste AI content anywhere, Crisp pops up and offers to rewrite it — one click.",
                badge: "macOS",
              },
              {
                icon: Globe,
                title: "Browser Extension",
                desc: "Detects AI text the moment you paste into Gmail, Slack, Notion, LinkedIn, or any text field. Inline popover, instant rewrite.",
                badge: "Chrome + Safari",
              },
              {
                icon: Clipboard,
                title: "Clipboard Magic",
                desc: "The rewritten text replaces your clipboard automatically. Just paste again. No switching tabs, no extra steps. Your voice, instantly.",
                badge: "Automatic",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-6 hover:border-dark-600/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center group-hover:bg-crisp-500/15 transition-colors">
                    <item.icon className="w-4.5 h-4.5 text-crisp-400" />
                  </div>
                  <span className="text-[10px] font-medium text-dark-500 uppercase tracking-wider px-2 py-0.5 rounded-full border border-dark-700/50 bg-dark-900/50">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-dark-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-dark-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Workflow visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 rounded-2xl border border-dark-700/50 bg-dark-900/30 p-5 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center">
              {[
                { step: "Copy from ChatGPT", color: "text-dark-400" },
                { step: "Paste into Slack", color: "text-dark-400" },
                { step: "Crisp pops up", color: "text-crisp-400" },
                { step: "One click — it's your voice", color: "text-crisp-300" },
              ].map((item, i) => (
                <React.Fragment key={item.step}>
                  {i > 0 && (
                    <ArrowRight className="w-4 h-4 text-dark-700 hidden sm:block flex-shrink-0" />
                  )}
                  <div className={`text-sm font-medium ${item.color} whitespace-nowrap`}>
                    {item.step}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Analytics preview */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Watch your voice get <span className="gradient-text">sharper</span>
              </h2>
              <p className="text-dark-400 text-base mb-6 leading-relaxed">
                The more you use Crisp, the better it matches you. The analytics
                dashboard tracks your voice consistency over time — so you can
                see the flywheel working.
              </p>
              <div className="space-y-3">
                {[
                  { icon: Star, label: "Voice match score improves with every edit" },
                  { icon: Flame, label: "Daily streaks build consistency" },
                  { icon: TrendingUp, label: "See time saved and output volume" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center">
                      <item.icon className="w-3.5 h-3.5 text-crisp-400" />
                    </div>
                    <span className="text-sm text-dark-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mock analytics card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-6"
            >
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Time Saved", value: "12.4h", color: "text-emerald-400" },
                  { label: "Streak", value: "7 days", color: "text-amber-400" },
                  { label: "Voice Match", value: "94%", color: "text-violet-400" },
                  { label: "Crisps", value: "48", color: "text-crisp-400" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-dark-800/50 p-3">
                    <div className="text-xs text-dark-500 mb-1">{stat.label}</div>
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-dark-800/50 p-4">
                <div className="text-xs text-dark-500 mb-3">Voice Consistency Over Time</div>
                <div className="flex items-end gap-1.5 h-16">
                  {[60, 65, 58, 72, 70, 78, 75, 82, 80, 88, 91, 94].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                      className="flex-1 bg-gradient-to-t from-crisp-600 to-crisp-500 rounded-t-sm"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-dark-600">Week 1</span>
                  <span className="text-[10px] text-dark-600">Week 12</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Simple, <span className="gradient-text">transparent</span> pricing
            </h2>
            <p className="text-dark-400 text-lg">
              Start free. Upgrade when your voice needs to scale.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`rounded-2xl p-5 sm:p-8 transition-all duration-300 ${
                  tier.featured
                    ? "border-2 border-crisp-500/40 bg-dark-900/60 shadow-lg shadow-crisp-500/10 relative"
                    : "border border-dark-700/50 bg-dark-900/30 hover:border-dark-600/50"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-crisp-600 to-crisp-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-dark-100 mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-dark-400">{tier.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-dark-50">
                    {tier.price}
                  </span>
                  <span className="text-dark-400 text-sm">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm text-dark-300"
                    >
                      <Check className="w-4 h-4 text-crisp-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="/app"
                  className={`block w-full text-center py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                    tier.featured
                      ? "bg-gradient-to-r from-crisp-600 to-crisp-500 text-white shadow-lg shadow-crisp-500/20 hover:shadow-crisp-500/40"
                      : "bg-dark-800 text-dark-200 hover:bg-dark-700 border border-dark-700/50"
                  }`}
                >
                  {tier.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — voice-focused */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Stop smoothing one doc by hand.{" "}
            <span className="gradient-text">Transform it into six.</span>
          </h2>
          <p className="text-dark-400 text-lg mb-8 max-w-lg mx-auto">
            One document in. Exec brief, email, Slack message, action items,
            DOCX, and PDF out. All in your voice, all in seconds.
          </p>
          <a
            href="/app"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-crisp-600 to-crisp-500 text-white px-10 py-4 rounded-2xl font-semibold text-sm shadow-lg shadow-crisp-500/25 hover:shadow-crisp-500/40 transition-all duration-300 glow"
          >
            Crisp It Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
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
