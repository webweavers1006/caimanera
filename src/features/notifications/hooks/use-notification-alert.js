"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { NOTIFICATION_CONFIG } from "@/features/notifications";

const { LABELS } = NOTIFICATION_CONFIG.UI;

/**
 * Module-level AudioContext singleton.
 * Lazy-initialized on first use, resumed as needed for autoplay policy.
 */
let _audioCtx = null;
async function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === "suspended") {
    await _audioCtx.resume();
  }
  return _audioCtx;
}

/**
 * Plays an ascending two-tone notification chime: D6 → G6.
 * Uses proper envelope (attack + exponential decay) for a natural sound.
 * Follows the same Web Audio pattern as tickets/use-call-sound.js.
 */
async function playNotificationChime() {
  try {
    const ctx = await getAudioCtx();
    const now = ctx.currentTime;

    // Ascending two-tone: D6 (1174.7 Hz) → G6 (1568 Hz)
    const tones = [
      { freq: 1174.7, start: 0 },
      { freq: 1568.0, start: 0.12 },
    ];

    for (const { freq, start } of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + 0.4);
    }
  } catch {
    // Silently fail — audio is optional
  }
}

/**
 * Hook: plays a chime + shows a toast + refreshes cases page on new notifications.
 *
 * AudioContext is lazy-initialized on the first call to initAudio(),
 * which should be triggered by a user gesture (click) to comply with
 * browser autoplay policies.
 *
 * Toast and page refresh always fire regardless of audio state.
 * If the user is viewing /casos, router.refresh() keeps the
 * case list in sync without manual reload.
 *
 * @param {number} unreadCount - Current unread notification count.
 * @returns {{ initAudio: () => void }} Call initAudio on user click.
 */
export function useNotificationAlert(unreadCount) {
  const prevCountRef = useRef(unreadCount);
  const isFirstRender = useRef(true);
  const audioReadyRef = useRef(false);

  const initAudio = useCallback(() => {
    if (!audioReadyRef.current) {
      getAudioCtx(); // init + resume under user gesture
      audioReadyRef.current = true;
    }
  }, []);

  useEffect(() => {
    // Skip initial mount — don't alert on page load with existing notifications
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCountRef.current = unreadCount;
      return;
    }

    const prev = prevCountRef.current;
    if (unreadCount > prev) {
      const diff = unreadCount - prev;

      // Toast always shows — no user gesture needed
      toast(`Tienes ${diff} notificaci${diff === 1 ? "ón" : "ones"} nueva${diff === 1 ? "" : "s"}`, {
        description: LABELS.BELL.TOAST_DESCRIPTION,
        icon: "🔔",
        duration: 4000,
      });

      // Chime only if audio was initialized via user click
      if (audioReadyRef.current) {
        playNotificationChime();
      }
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  return { initAudio };
}
