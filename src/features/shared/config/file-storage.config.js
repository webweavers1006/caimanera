/**
 * File Storage Configuration — Dropbox API endpoints and defaults.
 *
 * ⚠️  SECURITY: Secrets (DROPBOX_REFRESH_TOKEN, DROPBOX_APP_KEY, DROPBOX_APP_SECRET)
 *     MUST come from environment variables — NEVER hardcoded here.
 *
 *     .env.example should document all required vars without real values.
 *
 * Usage:
 *   import { FILE_STORAGE_CONFIG } from "@/features/shared/config/file-storage.config";
 */
export const FILE_STORAGE_CONFIG = {
  /** Dropbox OAuth 2.0 token endpoint (for refresh_token flow). */
  DROPBOX_API_OAUTH_TOKEN: "https://api.dropboxapi.com/oauth2/token",

  /** Stored access token fallback (set via DROPBOX_ACCESS_TOKEN env var).
   *  Only used when refresh_token flow is unavailable. May be expired.
   *  Empty string is intentional — the token may come from a refresh flow at runtime. */
  DROPBOX_ACCESS_TOKEN: process.env.DROPBOX_ACCESS_TOKEN || "",

  /** Dropbox Content API — file upload endpoint. */
  DROPBOX_API_UPLOAD: "https://content.dropboxapi.com/2/files/upload",

  /** Dropbox Sharing API — create shared link endpoint. */
  DROPBOX_API_LINK: "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",

  /** Dropbox Files API — delete endpoint. */
  DROPBOX_API_DELETE: "https://api.dropboxapi.com/2/files/delete_v2",
};
