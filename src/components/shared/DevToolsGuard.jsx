"use client";

import Script from "next/script";

const ENABLED = process.env.NEXT_PUBLIC_DISABLE_DEVTOOLS === "true";

// ── Customizable messages ──────────────────────────────────────────
const TITLE = "Acceso restringido";
const SUBTITLE = "";

// ── Build inline script with configurable text ─────────────────────
const escapedTitle = TITLE.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const escapedSubtitle = SUBTITLE.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const INLINE_SCRIPT = `
(function(){document.addEventListener("keydown",function(e){if(e.key==="F12"||(e.ctrlKey&&e.shiftKey&&(e.key==="I"||e.key==="J"||e.key==="C"))||(e.ctrlKey&&e.key==="U")){e.preventDefault()}});document.addEventListener("contextmenu",function(e){e.preventDefault()});var s=!1;function c(){var o=window.outerWidth-window.innerWidth>150;if(o&&!s){s=!0;var e=document.getElementById("__dt_block");if(!e){e=document.createElement("div");e.id="__dt_block";e.style.cssText="position:fixed;inset:0;z-index:2147483647;background:#0a0a0a;display:flex;align-items:center;justify-content:center";e.innerHTML='<div style=\\"text-align:center;color:#ef4444;font:600 20px system-ui,sans-serif;padding:24px\\">\\uD83D\\uDD12 ${escapedTitle}<br><span style=\\"font-size:14px;color:#9ca3af;font-weight:400\\">${escapedSubtitle}</span></div>';document.body.appendChild(e)}}else if(!o&&s){s=!1;var e=document.getElementById("__dt_block");if(e){e.remove()}}setTimeout(c,2000)}c()})();
`;

/**
 * DevTools & Console Guard — Production Security.
 *
 * Blocks common DevTools access vectors:
 * - F12, Ctrl+Shift+I/J/C, Ctrl+U
 * - Right-click context menu
 * - Docked DevTools via size-diff detection
 *
 * Edit TITLE and SUBTITLE constants above to customize the overlay text.
 * Controlled via NEXT_PUBLIC_DISABLE_DEVTOOLS env var.
 */
export function DevToolsGuard() {
  if (!ENABLED) return null;

  return (
    <Script id="devtools-guard" strategy="beforeInteractive">
      {INLINE_SCRIPT}
    </Script>
  );
}




