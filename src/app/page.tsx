"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import {
  Briefcase,
  Mail,
  CheckSquare,
  MessageSquare,
  Sparkles,
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
} from "lucide-react";

const OUTPUT_CARDS = [
  { icon: Briefcase, name: "Exec Brief", desc: "3-sentence CEO summary", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  { icon: Mail, name: "Email Draft", desc: "Ready-to-send email", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { icon: CheckSquare, name: "Action Items", desc: "Bulleted task list", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { icon: MessageSquare, name: "Slack Message", desc: "Casual, scannable", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { icon: FileText, name: "Document (DOCX)", desc: "Professional doc download", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
  { icon: Presentation, name: "Report (PDF)", desc: "Formal report download", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
];

const STATS = [
  { value: "8 min", label: "saved per output" },
  { value: "12+", label: "output formats" },
  { value: "5 sec", label: "to transform" },
  { value: "100%", label: "your voice" },
];

const PRICING_TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Try the magic",
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
    description: "For power users",
    features: [
      "Unlimited crisps",
      "All 12+ output types",
      "DOCX & PDF export",
      "Full Voice DNA (3 profiles)",
      "Templates & favorites",
      "Public share links",
      "Chain feature",
      "Custom output types",
    ],
    cta: "Start Pro Trial",
    featured: true,
  },
  {
    name: "Team",
    price: "$39",
    period: "/user/month",
    description: "Scale your team",
    features: [
      "Everything in Pro",
      "10 voice profiles",
      "Shared brand voices",
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

      {/* Hero */}
      <section className="relative pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[300px] sm:h-[600px] bg-crisp-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dark-700/50 bg-dark-900/50 text-xs text-dark-300 mb-8"
          >
            <Sparkles className="w-3 h-3 text-crisp-400" />
            Upload docs. Paste AI output. Get results in your voice.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Drop a doc.{" "}
            <span className="gradient-text">Get every format you need.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed"
          >
            Upload any PDF, DOCX, or paste AI output. Crisp transforms it into
            emails, exec briefs, slide decks, action items, and downloadable
            documents — all in your voice, in seconds.
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
              href="#how-it-works"
              className="text-dark-300 hover:text-dark-100 px-8 py-4 rounded-2xl font-medium text-sm border border-dark-700/50 hover:border-dark-600/50 bg-dark-900/30 hover:bg-dark-800/50 transition-all"
            >
              See how it works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Social proof stats */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 border-y border-dark-800/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-dark-500">{stat.label}</div>
            </motion.div>
          ))}
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
              Three steps. <span className="gradient-text">Zero effort.</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto">
              From raw AI content or documents to polished, on-brand outputs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Drop it in",
                desc: "Upload a PDF, DOCX, or paste any AI-generated text. Drag and drop works too.",
                color: "text-cyan-400",
                bg: "bg-cyan-400/10",
                border: "border-cyan-400/20",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "Crisp it",
                desc: "Choose your audience, pick output formats, and hit one button. Crisp scores, restructures, and rewrites in your voice.",
                color: "text-crisp-400",
                bg: "bg-crisp-500/10",
                border: "border-crisp-500/20",
              },
              {
                step: "03",
                icon: Download,
                title: "Ship it",
                desc: "Copy to clipboard, download as DOCX or PDF, share a public link, or push directly to Slack, Notion, or Google Docs.",
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

      {/* Demo — input → outputs */}
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
              One input. <span className="gradient-text">Every output.</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto">
              Upload a document or paste AI text — Crisp generates every format including
              downloadable DOCX and PDF files.
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
                <span className="text-xs text-dark-500 ml-2">Input</span>
              </div>
              {/* File upload indicator */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-crisp-500/5 border border-crisp-500/10">
                <Upload className="w-3.5 h-3.5 text-crisp-400" />
                <span className="text-xs text-crisp-400">strategy-deck.pdf</span>
                <span className="text-[10px] text-dark-500 ml-auto">or paste text</span>
              </div>
              <div className="text-sm text-dark-400 leading-relaxed space-y-3">
                <p>
                  Based on our comprehensive analysis of the Q2 market dynamics
                  and leveraging our cross-functional synergies, I would
                  recommend a multi-pronged approach to customer acquisition
                  that focuses on...
                </p>
                <p className="text-dark-500">
                  [2,000 more words of AI-generated strategy content that nobody
                  will read in this format]
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dark-800/50">
                <span className="text-[10px] text-dark-600 flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Thought Depth: 14/25
                </span>
              </div>
            </motion.div>

            {/* Output side */}
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
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center`}
                    >
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-dark-100">
                        {card.name}
                      </h3>
                      <p className="text-xs text-dark-400">{card.desc}</p>
                    </div>
                    {(card.name.includes("DOCX") || card.name.includes("PDF")) && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-crisp-500/10 border border-crisp-500/20">
                        <Download className="w-3 h-3 text-crisp-400" />
                        <span className="text-[10px] text-crisp-400 font-medium">
                          {card.name.includes("DOCX") ? ".docx" : ".pdf"}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid — 6 features */}
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
              Built to make you <span className="gradient-text">unstoppable</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto">
              Every feature designed to save time and keep your voice consistent.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Upload,
                title: "Document Ingestion",
                desc: "Upload PDFs and DOCX files directly. Crisp extracts the text and transforms it — no copy-paste gymnastics required.",
              },
              {
                icon: Download,
                title: "DOCX & PDF Export",
                desc: "Generate professionally formatted documents with one click. Download as DOCX for editing or PDF for sharing.",
              },
              {
                icon: Shield,
                title: "Voice DNA",
                desc: "Crisp learns your writing style from samples and recordings. Every output sounds like you wrote it, across all formats.",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                desc: "Track your time saved, thought depth trends, voice consistency score, and daily streaks. See your ROI in real-time.",
              },
              {
                icon: Share2,
                title: "Public Share Links",
                desc: "Share any output via a branded public URL. Track views and drive organic adoption across your network.",
              },
              {
                icon: Bookmark,
                title: "Templates & Favorites",
                desc: "Save your go-to workflow as a template. Star your best outputs. One-click to repeat any setup.",
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
              Push outputs <span className="gradient-text">everywhere</span>
            </h2>
            <p className="text-dark-400 text-base mb-8 max-w-lg mx-auto">
              Send crisped outputs directly to the tools your team already uses.
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
                Track your <span className="gradient-text">ROI</span>
              </h2>
              <p className="text-dark-400 text-base mb-6 leading-relaxed">
                The analytics dashboard shows exactly how much time Crisp saves
                you, how your thought quality is improving, and how well your
                voice is being matched.
              </p>
              <div className="space-y-3">
                {[
                  { icon: Flame, label: "Daily streaks keep you consistent" },
                  { icon: TrendingUp, label: "Thought depth trends over time" },
                  { icon: Star, label: "Voice consistency percentage" },
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
              {/* Mini chart mock */}
              <div className="rounded-xl bg-dark-800/50 p-4">
                <div className="text-xs text-dark-500 mb-3">Weekly Activity</div>
                <div className="flex items-end gap-1.5 h-16">
                  {[3, 5, 2, 7, 4, 8, 6, 9, 5, 7, 10, 8].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${(h / 10) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                      className="flex-1 bg-gradient-to-t from-crisp-600 to-crisp-500 rounded-t-sm"
                    />
                  ))}
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
              Start free. Upgrade when you need more.
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

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Stop polishing AI slop by hand.
          </h2>
          <p className="text-dark-400 text-lg mb-8 max-w-lg mx-auto">
            Upload a doc, hit one button, and get every format you need — in
            your voice, ready to ship.
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
            Built to kill AI slop.
          </p>
        </div>
      </footer>
    </div>
  );
}
