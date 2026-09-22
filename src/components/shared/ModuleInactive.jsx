import { Power } from "lucide-react";

/**
 * ModuleInactive — centered notice shown when a feature module is disabled
 * via its feature flag (e.g. the turnos/tickets module).
 *
 * Server-safe (no "use client") — renders equally fine in RSC and client pages.
 *
 * @param {Object} props
 * @param {string} props.title - Notice title (from feature constants).
 * @param {string} props.description - Notice description (from feature constants).
 */
export default function ModuleInactive({ title, description }) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-lg p-8 text-center space-y-4">
        <Power className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
