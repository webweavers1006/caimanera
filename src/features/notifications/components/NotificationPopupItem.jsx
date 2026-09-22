"use client";

import { Check, Mail, MailOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NOTIFICATION_CONFIG } from "@/features/notifications";
import { formatRelativeTime } from "@/features/shared/lib/date-utils";

const { LABELS } = NOTIFICATION_CONFIG.UI;
const TYPES_MAP = LABELS.TYPES_MAP;

/**
 * Single notification item in the popover list.
 * Pure presentational — no logic, no hooks.
 */
export function NotificationPopupItem({ notification, onMarkAsRead }) {
  const typeLabel = TYPES_MAP[notification.type] || notification.type;
  const timeAgo = formatRelativeTime(notification.createdAt, {
    justNow: LABELS.LIST.TIME_JUST_NOW,
    minutes: LABELS.LIST.TIME_MINUTES,
    hours: LABELS.LIST.TIME_HOURS,
    days: LABELS.LIST.TIME_DAYS,
  });

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-accent/60 transition-colors min-w-0 overflow-hidden ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        {notification.isRead ? (
          <MailOpen className="size-4 text-muted-foreground" />
        ) : (
          <Mail className="size-4 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p
          className={`text-sm leading-snug break-words ${
            !notification.isRead ? "font-medium" : "text-foreground/80"
          }`}
        >
          {notification.message}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <Badge
            variant="outline"
            className="text-[9px] px-1 py-0 h-4 leading-none"
          >
            {typeLabel}
          </Badge>
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Mark as read button */}
      {!notification.isRead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
          className="shrink-0 size-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
          title={LABELS.LIST.MARK_READ}
          aria-label={LABELS.LIST.MARK_READ}
        >
          <Check className="size-3.5" />
        </button>
      )}
    </div>
  );
}
