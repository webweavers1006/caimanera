"use client";

/**
 * use-user-pdf-download.js
 * Client hook for downloading the users PDF report.
 *
 * Responsibilities:
 * - Loading state management
 * - Fetch PDF from /api/users with current filter params
 * - Trigger browser download via Blob + URL.createObjectURL
 * - Error handling with sonner toast
 * - Cleanup of object URLs
 */

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { USER_CONFIG } from "../config/user.constants";

const { PDF: L } = USER_CONFIG.UI.LABELS;

/**
 * Hook for downloading the users PDF report.
 * Supports two modes:
 * - download() → all users matching current filters
 * - downloadSelected(userIds) → only the selected users
 *
 * @param {object} options
 * @param {object} options.filters - Current filter state from the users table
 * @returns {{ download: Function, downloadSelected: Function, isDownloading: boolean }}
 */
export function useUserPdfDownload({ filters } = {}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const objectUrlRef = useRef(null);

  /**
   * Builds query params and triggers the download.
   * @param {string[]} [userIds] - Optional specific user UUIDs for selection mode
   */
  const doDownload = useCallback(async (userIds) => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const params = new URLSearchParams();

      // Selection mode: only pass userIds, ignore filters
      if (userIds && userIds.length > 0) {
        params.set("userIds", userIds.join(","));
      } else if (filters) {
        // Filter mode: pass all current filters
        if (filters.searchTerm) params.set("q", filters.searchTerm);
        if (filters.status && filters.status !== "all") params.set("status", filters.status);
        if (filters.roleId?.length > 0) params.set("roleId", filters.roleId);
        if (filters.officeId?.length > 0) params.set("officeId", filters.officeId);
        if (filters.directionId?.length > 0) params.set("directionId", filters.directionId);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);
      }

      const qs = params.toString();
      const url = `/api/users${qs ? `?${qs}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || L.GENERATE_ERROR);
      }

      const blob = await response.blob();

      // Build filename from Content-Disposition header or fallback
      const disposition = response.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="?(.+?)"?$/);
      const filename = filenameMatch?.[1] || "reporte_usuarios.pdf";

      // Clean up previous object URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(L.GENERATED);
    } catch (error) {
      toast.error(error.message || L.GENERATE_ERROR);
    } finally {
      setIsDownloading(false);
    }
  }, [filters, isDownloading]);

  const download = useCallback(() => doDownload(), [doDownload]);
  const downloadSelected = useCallback((userIds) => doDownload(userIds), [doDownload]);

  return { download, downloadSelected, isDownloading };
}
