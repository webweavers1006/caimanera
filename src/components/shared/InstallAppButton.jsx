"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PWA_CONFIG } from "@/features/shared";

const UI = PWA_CONFIG.UI;

const emptySubscribe = () => () => {};

/** True only after hydration, so browser-only checks stay SSR-safe. */
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOSDevice() {
  const ua = navigator.userAgent;
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * "Install app" card.
 *
 * - Android/desktop Chromium: uses the captured `beforeinstallprompt` event.
 * - iOS Safari does not expose that event, so it shows the manual steps.
 * - Hidden when the app is already running in standalone mode.
 */
export function InstallAppButton() {
  const isClient = useIsClient();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    const handlePrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const handleInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const isStandalone = isClient ? isStandaloneMode() : true;
  const isIOS = isClient ? isIOSDevice() : false;
  const canPrompt = Boolean(deferredPrompt);

  if (isStandalone || (!canPrompt && !isIOS)) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Download className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{UI.INSTALL_TITLE}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {UI.INSTALL_DESCRIPTION}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-3 h-10 px-4"
            onClick={canPrompt ? handleInstall : () => setShowIOSHint((value) => !value)}
          >
            {canPrompt ? <Download className="size-4" /> : <Share className="size-4" />}
            {canPrompt ? UI.INSTALL_ACTION : UI.INSTALL_ACTION_IOS}
          </Button>

          {!canPrompt && showIOSHint && (
            <p className="mt-2 text-xs text-muted-foreground" role="status">
              {UI.INSTALL_IOS_HINT}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
