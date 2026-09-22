/**
 * File Storage Service.
 * Handles upload, share-link creation, and deletion in Dropbox.
 * This is the ONLY place that knows about Dropbox API details.
 */

import { FILE_STORAGE_CONFIG } from "@/features/shared/config/file-storage.config"
import { logger } from "@/features/shared"

/** Module-level cache for the current access token. */
let cachedToken = null
let cachedExpiry = 0 // Timestamp when the cached token expires

/**
 * Obtains a valid access token, refreshing via refresh_token when needed.
 * Development mode tokens expire in 4h; this auto-refreshes silently.
 */
async function getAccessToken() {
  if (cachedToken && Date.now() < cachedExpiry) return cachedToken

  const { DROPBOX_API_OAUTH_TOKEN, DROPBOX_ACCESS_TOKEN: storedToken } = FILE_STORAGE_CONFIG
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN
  const appKey = process.env.DROPBOX_APP_KEY
  const appSecret = process.env.DROPBOX_APP_SECRET

  if (refreshToken && appKey && appSecret) {
    const response = await fetch(DROPBOX_API_OAUTH_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: appKey,
        client_secret: appSecret,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      cachedToken = data.access_token
      cachedExpiry = Date.now() + (data.expires_in || 14400) * 1000
      return cachedToken
    }

    const body = await response.text()
    logger.error("Dropbox token refresh failed, falling back to stored:", { status: response.status, body })
  }

  // Fallback: use the stored token (may be expired)
  return storedToken
}

/**
 * Build the Dropbox API upload args header.
 */
function uploadArgs(filePath) {
  return JSON.stringify({
    path: filePath,
    mode: "add",
    autorename: true,
  })
}

/**
 * Upload a raw buffer to Dropbox.
 * @param {Buffer} buffer - File content as Buffer.
 * @param {string} remotePath - Destination path in Dropbox (e.g. /uploads/documentos/uuid.pdf).
 * @returns {Promise<string>} The shared link URL.
 */
export async function uploadToDropbox(buffer, remotePath) {
  const { DROPBOX_API_UPLOAD } = FILE_STORAGE_CONFIG
  const token = await getAccessToken()

  const response = await fetch(DROPBOX_API_UPLOAD, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Dropbox-API-Arg": uploadArgs(remotePath),
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    logger.error("Dropbox upload failed:", { status: response.status, body: errorBody })
    throw new Error("Error al subir el archivo al almacenamiento.")
  }

  const uploaded = await response.json()
  logger.info(`File uploaded to Dropbox: ${uploaded.path_display}`)
  return uploaded
}

/**
 * Create a shared link for a file in Dropbox.
 * @param {string} path - The path in Dropbox (e.g. /uploads/documentos/uuid.pdf).
 * @returns {Promise<string>} The public shared URL.
 */
export async function createSharedLink(path) {
  const { DROPBOX_API_LINK } = FILE_STORAGE_CONFIG
  const token = await getAccessToken()

  const response = await fetch(DROPBOX_API_LINK, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path,
      settings: { requested_visibility: "public" },
    }),
  })

  if (!response.ok) {
    // If link already exists, fetch the existing one
    if (response.status === 409) {
      const existing = await response.json()
      return existing?.url?.replace("?dl=0", "?raw=1") || ""
    }
    const errorBody = await response.text()
    logger.error("Dropbox link creation failed:", { status: response.status, body: errorBody })
    throw new Error("Error al generar el enlace público.")
  }

  const linkData = await response.json()
  return linkData.url.replace("?dl=0", "?raw=1")
}

/**
 * Upload a file to Dropbox and return its public URL.
 * Combines upload + shared link in one call.
 * @param {Buffer} buffer - File content.
 * @param {string} remotePath - Destination path.
 * @returns {Promise<string>} Public URL.
 */
export async function uploadAndGetLink(buffer, remotePath) {
  const uploaded = await uploadToDropbox(buffer, remotePath)
  const url = await createSharedLink(uploaded.path_display)
  return url
}

/**
 * Delete a file from Dropbox by path.
 * @param {string} path - The path in Dropbox.
 */
export async function deleteFromDropbox(path) {
  const { DROPBOX_API_DELETE } = FILE_STORAGE_CONFIG
  const token = await getAccessToken()

  const response = await fetch(DROPBOX_API_DELETE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  })

  if (!response.ok) {
    logger.error("Dropbox delete failed:", { status: response.status, path })
  }
}
