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
  Zap,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react";

const OUTPUT_CARDS = [
  { icon: Briefcase, name: "Exec Brief", desc: "3-sentence CEO summary", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  { icon: Mail, name: "Email Draft", desc: "Ready-to-send email", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { icon: CheckSquare, name: "Action Items", desc: "Bulleted task list", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { icon: MessageSquare, name: "Slack Message", desc: "Casual, scannable", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
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
      "All 8 output types",
      "Full Voice DNA",
      "3 voice profiles",
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
      "Shared brand voices",
      "Team voice library",
      "Admin dashboard",
      "Usage analytics",
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
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-crisp-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dark-700/50 bg-dark-900/50 text-xs text-dark-300 mb-8"
          >
            <Sparkles className="w-3 h-3 text-crisp-400" />
            Stop forwarding AI slop
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            AI gave you the draft.{" "}
            <span className="gradient-text">Crisp makes it yours.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Paste any AI output. Get it instantly recast into every format you
            need — in your voice — in 5 seconds.
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
              href="#demo"
              className="text-dark-300 hover:text-dark-100 px-8 py-4 rounded-2xl font-medium text-sm border border-dark-700/50 hover:border-dark-600/50 bg-dark-900/30 hover:bg-dark-800/50 transition-all"
            >
              See how it works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              One paste. <span className="gradient-text">Six outputs.</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto">
              Drop a ChatGPT dump and watch Crisp transform it into every format
              you actually need.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="text-xs text-dark-500 ml-2">AI Output</span>
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
            </motion.div>

            {/* Output side */}
            <div className="space-y-4">
              {OUTPUT_CARDS.map((card, i) => (
                <motion.div
                  key={card.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                  className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-4 hover:bg-dark-800/30 hover:border-dark-600/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center`}
                    >
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-dark-100">
                        {card.name}
                      </h3>
                      <p className="text-xs text-dark-400">{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="gradient-text">Crisp</span> is different
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Thought Depth Score",
                desc: "Before recasting, Crisp evaluates if the AI content is actually worth reshaping. Scores 5 dimensions of thinking quality — so you never polish garbage.",
              },
              {
                icon: Shield,
                title: "Voice DNA",
                desc: "Crisp learns your writing style from samples and voice recordings. Every output sounds like you, not ChatGPT. Multiple profiles for different contexts.",
              },
              {
                icon: Sparkles,
                title: "Chain Feature",
                desc: "Edit one output, then recast that edited version into further formats. Each step preserves context — no re-prompting, no lost context.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-dark-700/50 bg-dark-900/30 p-8 hover:border-dark-600/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-crisp-500/10 border border-crisp-500/20 flex items-center justify-center mb-5 group-hover:bg-crisp-500/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-crisp-400" />
                </div>
                <h3 className="text-lg font-semibold text-dark-100 mb-3">
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

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, <span className="gradient-text">transparent</span> pricing
            </h2>
            <p className="text-dark-400 text-lg">
              Start free. Upgrade when you need more.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`rounded-2xl p-8 transition-all duration-300 ${
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

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-dark-800/50">
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
