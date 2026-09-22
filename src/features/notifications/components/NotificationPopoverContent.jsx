"use client";

import { CheckCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NOTIFICATION_CONFIG } from "@/features/notifications";
import { useNotificationList } from "@/features/notifications/hooks/use-notification-list";
import { NotificationPopupItem } from "@/features/notifications/components/NotificationPopupItem";

const { LABELS } = NOTIFICATION_CONFIG.UI;

/**
 * Popover inner content — fetches and displays the notification list.
 *
 * Responsible for:
 *  - Header with "Mark all as read" button
 *  - Loading skeletons
 *  - Empty state
 *  - Error state
 *  - Notification list rendering
 *
 * Logic delegated to useNotificationList hook.
 */
export function NotificationPopoverContent({ onRead }) {
  const {
    items,
    error,
    markingAll,
    hasUnread,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotificationList({ onRead });

  return (
    <div className="flex flex-col max-h-[480px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <h4 className="font-semibold text-sm">{LABELS.LIST.TITLE}</h4>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="text-xs h-7 gap-1"
          >
            <CheckCheck className="size-3" />
            {LABELS.LIST.MARK_ALL_READ}
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {items === null ? (
          <LoadingSkeletons />
        ) : error ? (
          <p className="text-sm text-muted-foreground text-center py-8 px-4">
            {error}
          </p>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="py-1">
            {items.map((notification) => (
              <NotificationPopupItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Internal sub-components ─────────────────────────────────────────────

function LoadingSkeletons() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-2">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Mail className="size-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">
        {LABELS.LIST.EMPTY}
      </p>
    </div>
  );
}
