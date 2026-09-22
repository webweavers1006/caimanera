import { getMyNotificationsAction } from "@/features/notifications/actions/notification.read.action";
import { NextResponse } from "next/server";
import { lightApiLimiter, getClientIp } from "@/features/shared/lib/api-rate-limiter";

/**
 * GET /api/notifications
 *
 * Returns a paginated list of notifications for the current user.
 * Used by the NotificationBell popover.
 *
 * Architecture: API route → Action → Service → Repository
 *
 * Query params:
 *   ?limit=10   — max items to return (default 10, max 50)
 *   ?onlyUnread=true — filter only unread notifications
 */
export async function GET(request) {
  try {
    // 0. Rate limit — polling endpoint
    const ip = getClientIp(request);
    const { allowed } = lightApiLimiter.checkLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "10", 10),
      50
    );
    const onlyUnread = searchParams.get("onlyUnread") === "true" || undefined;

    const result = await getMyNotificationsAction({
      page: 1,
      pageSize: limit,
      onlyUnread,
      sortKey: "createdAt",
      sortDirection: "desc",
    });

    if (!result?.success) {
      return NextResponse.json(
        { items: [], totalCount: 0 },
        { status: result?.error ? 401 : 200 }
      );
    }

    return NextResponse.json(
      {
        items: result.data.items,
        totalCount: result.data.totalCount,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { items: [], totalCount: 0 },
      { status: 200 }
    );
  }
}
