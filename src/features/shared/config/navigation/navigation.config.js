/**
 * NAVIGATION CONFIG — Barrel file. Re-exports routes + sidebar from their own modules.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * To add a new module:
 *   1. Add its route in routes.config.js → ROUTES
 *   2. Add its nav item in sidebar.config.js → SIDEBAR_CONFIG.NAV.items
 *   3. Create the page at src/app/(root)/admin/[feature]/page.jsx
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { ROUTES } from "./routes.config"
export { SIDEBAR_CONFIG } from "./sidebar.config"
