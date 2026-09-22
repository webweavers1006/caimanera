/**
 * file-validation.js — Shared file validation utilities.
 *
 * Pure functions + constants. No side effects, no I/O, no DB access.
 * Safe to import from both client and server components.
 */

/** Maximum file size in bytes (10 MB) */
export const FILE_MAX_SIZE = 10 * 1024 * 1024;

/** Allowed file extensions */
export const FILE_ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "xls", "xlsx",
  "jpg", "jpeg", "png",
  "txt", "csv",
];

/** MIME types mapped to extensions */
export const FILE_EXTENSION_MIME_MAP = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  txt: "text/plain",
  csv: "text/csv",
};

/** Max length for sanitized file name */
export const FILE_MAX_NAME_LENGTH = 200;

/**
 * Checks if the file extension is in the allowed list.
 * Returns { valid, ext } or { valid, error }.
 */
export function validateFileExtension(fileName) {
  if (!fileName) return { valid: false, error: "NO_EXTENSION" };
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext || !FILE_ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: "INVALID_EXTENSION", ext };
  }
  return { valid: true, ext };
}

/**
 * Detects path traversal or malicious patterns in a file name.
 */
export function hasPathTraversal(fileName) {
  if (!fileName) return true;
  return /\.\.\/|\.\.\\|\0|\/|\\|:/.test(fileName);
}

/**
 * Detects double extensions (.pdf.exe, .doc.html).
 */
export function hasDoubleExtension(fileName) {
  if (!fileName) return false;
  const parts = fileName.split(".");
  if (parts.length > 2) {
    const last = parts[parts.length - 1].toLowerCase();
    const secondLast = parts[parts.length - 2].toLowerCase();
    if (FILE_ALLOWED_EXTENSIONS.includes(last) && FILE_ALLOWED_EXTENSIONS.includes(secondLast)) {
      return true;
    }
  }
  return false;
}

/**
 * Sanitizes a file name: lowercase, no accents, safe chars only.
 * Returns base name without extension, capped to maxBase chars.
 */
export function sanitizeFileName(rawName, maxBase = FILE_MAX_NAME_LENGTH - 37) {
  if (!rawName) return "file";

  const lastDot = rawName.lastIndexOf(".");
  const ext = lastDot > 0 ? rawName.substring(lastDot).toLowerCase() : "";
  let base = lastDot > 0 ? rawName.substring(0, lastDot) : rawName;

  base = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  if (!base) base = "file";
  if (base.length > maxBase) base = base.substring(0, maxBase);

  return base + ext;
}

/**
 * Validates a File object client-side (size + name + extension).
 * Returns { valid, errorKey } or { valid, fileInfo }.
 * Does NOT read file contents — safe for client-side pre-validation.
 */
export function validateClientFile(file) {
  if (!file || file.size === 0) return { valid: false, error: "NO_FILE" };
  if (file.size > FILE_MAX_SIZE) return { valid: false, error: "FILE_TOO_LARGE" };
  if (!file.name || hasPathTraversal(file.name) || file.name.length > 255) {
    return { valid: false, error: "INVALID_NAME" };
  }
  if (hasDoubleExtension(file.name)) return { valid: false, error: "INVALID_EXTENSION" };

  const extResult = validateFileExtension(file.name);
  if (!extResult.valid) return { valid: false, error: "INVALID_EXTENSION" };

  return {
    valid: true,
    fileInfo: {
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type || FILE_EXTENSION_MIME_MAP[extResult.ext] || "application/octet-stream",
      extension: extResult.ext,
    },
  };
}

/**
 * Formats a file size in bytes to a human-readable string.
 * Pure function, safe for both client and server.
 */
export function formatFileSize(bytes) {
  if (bytes == null) return "—";
  const n = Number(bytes);
  if (n === 0) return "0 B";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(1) + " MB";
}
