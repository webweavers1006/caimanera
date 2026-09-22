"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TricolorBar } from "@/components/shared/TricolorBar";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut", delay },
});

/**
 * LoginHero — Left branding panel with official SAIME styling.
 * Layout: logo left → tricolor accent → subtitle in crescendo weight.
 */
export function LoginHero() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex w-full items-center justify-center px-10"
    >
      <motion.div
        {...fadeUp(0.1)}
        className="flex flex-col items-start gap-8"
      >
        {/* ── Logo ── */}
        <div className="relative size-36">
          <Image
            src="/img/saime_blanco.png"
            alt="SAIME Logo"
            fill
            sizes="144px"
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        {/* ── Tricolor accent bar ── */}
        <motion.div {...fadeUp(0.3)} className="w-full max-w-[420px]">
          <TricolorBar />
        </motion.div>

        {/* ── Subtitle — crescendo weight ── */}
        <motion.div {...fadeUp(0.5)} className="space-y-1.5 max-w-[440px]">
          <p className="text-[3.2rem] leading-none font-medium tracking-[0.05em] uppercase text-primary-foreground/80">
            SISTEMA DE
          </p>
          <p className="text-[3.2rem] leading-none font-extrabold tracking-[0.05em] uppercase text-primary-foreground/95">
            ATENCIÓN AL
          </p>
          <p className="text-[3.2rem] leading-none font-black tracking-[0.05em] uppercase text-primary-foreground">
            CIUDADANO
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
