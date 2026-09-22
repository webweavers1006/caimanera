"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NOTIFICATION_CONFIG } from "@/features/notifications";
import { useNotificationSSE } from "@/features/notifications/hooks/use-notification-sse";
import { useNotificationAlert } from "@/features/notifications/hooks/use-notification-alert";
import { NotificationPopoverContent } from "@/features/notifications/components/NotificationPopoverContent";

const { LABELS } = NOTIFICATION_CONFIG.UI;

/**
 * NotificationBell — Client component for the sidebar inset header.
 *
 * Renders a bell icon with an unread badge counter.
 * On click, opens a popover with the notification list.
 * Plays a beep when the unread count increases (new notification arrived).
 *
 * Logic delegated to hooks:
 *  - useNotificationSSE → badge counter via real-time SSE (no polling)
 *  - useNotificationAlert → beep + toast on new notifications
 *  - NotificationPopoverContent → uses useNotificationList internally
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, isLoading, refresh } = useNotificationSSE();
  const { initAudio } = useNotificationAlert(unreadCount);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex items-center justify-center size-9 rounded-md hover:bg-sidebar-accent transition-colors"
          onClick={initAudio}
          aria-label={
            isLoading
              ? LABELS.BELL.ARIA_LABEL
              : unreadCount > 0
                ? LABELS.BELL.UNREAD_COUNT(unreadCount)
                : LABELS.BELL.ZERO_COUNT
          }
          title={LABELS.BELL.TOOLTIP}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-destructive rounded-full pointer-events-none"
              aria-hidden="true"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[380px] max-w-[380px] p-0">
        <NotificationPopoverContent onRead={refresh} />
      </PopoverContent>
    </Popover>
  );
}
