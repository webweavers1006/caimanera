import { getUnreadCountAction } from "@/features/notifications/actions/notification.read.action";
import { NextResponse } from "next/server";
import { lightApiLimiter, getClientIp } from "@/features/shared/lib/api-rate-limiter";

/**
 * GET /api/notifications/unread-count
 *
 * Lightweight polling endpoint for the notification bell.
 * Returns { count: number } — the number of unread notifications for the current user.
 *
 * Architecture: API route → Action → Service → Repository
 *
 * Polling interval: 30 seconds (client-side setInterval).
 * Cache: no-store to always get fresh data.
 */
export async function GET(request) {
  try {
    // 0. Rate limit — polling endpoint
    const ip = getClientIp(request);
    const { allowed } = lightApiLimiter.checkLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
    }

    const result = await getUnreadCountAction();

    return NextResponse.json(
      { count: result?.count ?? 0 },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    // Fail gracefully — don't break the polling loop
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
