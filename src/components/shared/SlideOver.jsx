"use client";

import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Generic slide-over panel shell.
 *
 * Handles: backdrop, panel container, sticky header, loading/empty states.
 * The feature-specific content is passed as children.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the panel is visible
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Header title
 * @param {boolean} [props.isLoading=false] - Show loading spinner
 * @param {boolean} [props.isEmpty=false] - Show empty/error state
 * @param {string} [props.emptyMessage] - Message when empty
 * @param {React.ReactNode} [props.children] - Body content
 * @param {React.ReactNode} [props.footer] - Content below the body (dialogs, etc.)
 */
export function SlideOver({
  open,
  onClose,
  title,
  isLoading = false,
  isEmpty = false,
  emptyMessage,
  children,
  footer,
}) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l z-50 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty / Error */}
        {!isLoading && isEmpty && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            {emptyMessage || "Sin información disponible."}
          </div>
        )}

        {/* Content */}
        {!isLoading && !isEmpty && (
          <div className="p-6 space-y-6">
            {children}
          </div>
        )}

        {/* Footer (dialogs, etc.) */}
        {footer}
      </div>
    </>
  );
}
