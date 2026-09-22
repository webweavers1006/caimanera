import { useState, useEffect, useCallback, useRef } from "react";
import {
  markAsReadAction,
  markAllAsReadAction,
} from "@/features/notifications/actions/notification.write.action";

/**
 * Hook: fetches the notification list and handles mark-as-read actions
 * with optimistic updates and rollback on failure.
 *
 * Designed for use inside the NotificationBell popover.
 * Fetches on mount (popover open).
 *
 * @param {Object} opts
 * @param {() => void} opts.onRead - Callback after a successful mark-as-read
 *   (used to refresh the badge count).
 * @returns {{
 *   items: Array|null,
 *   error: string|null,
 *   markingAll: boolean,
 *   hasUnread: boolean,
 *   handleMarkAsRead: (id: number) => Promise<void>,
 *   handleMarkAllAsRead: () => Promise<void>,
 * }}
 */
export function useNotificationList({ onRead }) {
  const [items, setItems] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  // Stable ref to latest items for rollback (avoids stale closure issues)
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Fetch notification list on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/notifications?limit=10", {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setItems([]);
          return;
        }
        const data = await res.json();
        if (!cancelled) setItems(data.items || []);
      } catch (err) {
        if (!cancelled) {
          setError("Error al cargar notificaciones.");
          setItems([]); // Resolve loading state — don't show skeletons forever
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleMarkAsRead = useCallback(
    async (id) => {
      // Optimistic update
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      const result = await markAsReadAction(id);
      if (result?.success) {
        onRead?.(); // Refresh badge count
      } else {
        // Rollback
        setItems((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
        );
      }
    },
    [onRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    setMarkingAll(true);
    const previousItems = itemsRef.current;

    // Optimistic: mark all as read
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));

    const result = await markAllAsReadAction();
    if (result?.success) {
      onRead?.();
    } else {
      setItems(previousItems); // Rollback
    }
    setMarkingAll(false);
  }, [onRead]);

  const hasUnread = items?.some((n) => !n.isRead);

  return {
    items,
    error,
    markingAll,
    hasUnread,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
}
