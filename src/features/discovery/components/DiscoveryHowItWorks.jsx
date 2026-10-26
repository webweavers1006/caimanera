"use client";

import { MapPin, Search, Trophy } from "lucide-react";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";

const STEP_ICONS = [MapPin, Search, Trophy];

export function DiscoveryHowItWorks() {
  const labels = DISCOVERY_CONFIG.UI.SECTIONS;

  return (
    <section id="como-funciona" className="scroll-mt-24 rounded-3xl border bg-card p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{labels.HOW_TITLE}</h2>
        <p className="text-sm text-muted-foreground">{labels.HOW_SUBTITLE}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {labels.HOW_STEPS.map((step, index) => {
          const Icon = STEP_ICONS[index] || Trophy;
          return (
            <div key={step.title} className="rounded-2xl bg-muted/50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Paso {index + 1}
                </span>
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
