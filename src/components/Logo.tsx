"use client";

import { motion } from "framer-motion";

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "text-xl",
    default: "text-2xl",
    large: "text-4xl md:text-5xl",
  };

  return (
    <motion.span
      className={`font-black tracking-tight ${sizeClasses[size]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="gradient-text">Crisp</span>
      <span className="text-crisp-400 opacity-40">.</span>
    </motion.span>
  );
}
