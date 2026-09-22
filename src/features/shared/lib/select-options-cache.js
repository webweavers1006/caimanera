/**
 * Client-side cache for async select options (catalogs).
 *
 * Purpose: catalog dropdowns (case statuses, areas, reasons, attention types,
 * offices, etc.) should open instantly instead of waiting in the Next.js
 * router queue behind SSE-triggered refreshes.
 *
 * Design:
 * - TTL-based (60s default): a newly created catalog item appears in all
 *   dropdowns within ≤60s WITHOUT manual cache clearing.
 * - Automatic invalidation: catalog table dialog hooks call
 *   `invalidateSelectOptionsCache()` after a successful create/edit.
 * - Keys are stable across renders for module-level fetchers (server action
 *   imports): built from the fetcher's $$id when present, otherwise from
 *   function name + a WeakMap-assigned instance id. Explicit `cacheKey` props
 *   are preferred at call sites (shared per-catalog keys like
 *   `filter:case-status`) so the same catalog is cached once app-wide.
 *
 * This module is client-safe (no server-only imports).
 */

const DEFAULT_TTL_MS = 60 * 1000;
const cache = new Map();

/**
 * djb2 hash — stable across renders, used only for cache keys (not security).
 * @param {string} str
 * @returns {string}
 */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return String(h >>> 0);
}

/**
 * Per-instance function ids (WeakMap) — session-scoped and stable across
 * renders for module-level fetchers.
 *
 * Why needed: in Next.js 16, server action references passed to client
 * components are plain functions created by `createServerReference`. The
 * runtime does NOT set `$$id`/`$$name` as own properties (the action id lives
 * in an internal map of the react-server-dom runtime), and every proxy shares
 * the same `toString()` source. Hashing the source alone would therefore
 * produce the SAME key for every action — all dropdowns would read each
 * other's cached options. A WeakMap id is the only reliable discriminator.
 */
const functionIds = new WeakMap();
let functionIdCounter = 0;

function getFunctionId(fn) {
  let id = functionIds.get(fn);
  if (id === undefined) {
    id = ++functionIdCounter;
    functionIds.set(fn, id);
  }
  return id;
}

/**
 * Builds a deterministic cache key for a select fetcher invocation.
 *
 * @param {Function} fetcher - The async fetcher function (or null when explicit cacheKey given).
 * @param {string} [query] - Current search term.
 * @param {*} [parentValue] - Parent entity value (e.g. countryId for states).
 * @param {string} [cacheKey] - Optional explicit key (more precise than source hash).
 * @returns {string}
 */
export function getSelectOptionsCacheKey(fetcher, query, parentValue, cacheKey) {
  const q = query ?? "";
  const p = parentValue === undefined || parentValue === null ? "" : String(parentValue);
  if (cacheKey) return `k:${cacheKey}:${p}:${q}`;

  // React server action references may expose a stable $$id in some runtimes.
  // Prefer it when available; otherwise fall back to name + WeakMap instance id.
  const serverRefId = fetcher && (fetcher.$$id || fetcher.$$name);
  if (serverRefId) return `f:${hash(String(serverRefId))}:${p}:${q}`;

  const fnName = typeof fetcher === "function" ? fetcher.name || "anonymous" : "none";
  const fnUid = typeof fetcher === "function" ? getFunctionId(fetcher) : 0;
  return `f:${hash(`${fnName}:${fnUid}`)}:${p}:${q}`;
}

/**
 * Returns cached options if fresh (within TTL). Deletes expired entries.
 * @param {string} key
 * @returns {Array|null}
 */
export function getCachedSelectOptions(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > DEFAULT_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Stores a value in the cache (options arrays or detail objects).
 * @param {string} key
 * @param {*} value
 */
export function setCachedSelectOptions(key, value) {
  if (value !== undefined && value !== null) {
    cache.set(key, { ts: Date.now(), value });
  }
}

/**
 * Invalidates ALL cached select options.
 * Call after a successful catalog create/edit/delete so dropdowns
 * reflect the change immediately in the current browser.
 */
export function invalidateSelectOptionsCache() {
  cache.clear();
}

/**
 * Returns the current number of cached entries (debugging only).
 * @returns {number}
 */
export function getSelectOptionsCacheSize() {
  return cache.size;
}
