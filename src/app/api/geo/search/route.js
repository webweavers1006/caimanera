import { NextResponse } from "next/server";
import { lightApiLimiter, getClientIp } from "@/features/shared/lib/api-rate-limiter";
import { searchAddresses } from "@/features/location/lib/geocoder";
import { logger } from "@/features/shared/lib/logger";

/**
 * GET /api/geo/search?q=...
 * Public address search for the location picker. Falls back gracefully if
 * the upstream geocoder is unavailable; the UI also offers local zones/courts.
 */
export async function GET(request) {
  const { allowed } = lightApiLimiter.checkLimit(getClientIp(request));
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas búsquedas. Intenta en un minuto." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();

  if (query.length < 3) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  if (query.length > 120) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  try {
    const results = await searchAddresses(query);
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
    );
  } catch (error) {
    logger.warn("Geocoder search failed", { error: error.message });
    return NextResponse.json(
      { results: [], fallback: true },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
