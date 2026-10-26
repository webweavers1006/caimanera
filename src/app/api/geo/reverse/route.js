import { NextResponse } from "next/server";
import { lightApiLimiter, getClientIp } from "@/features/shared/lib/api-rate-limiter";
import { reverseGeocode } from "@/features/location/lib/geocoder";
import { logger } from "@/features/shared/lib/logger";

/**
 * GET /api/geo/reverse?lat=...&lng=...
 * Returns a friendly label for the browser's current location.
 */
export async function GET(request) {
  const { allowed } = lightApiLimiter.checkLimit(getClientIp(request));
  if (!allowed) {
    return NextResponse.json({ label: null }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lng"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Coordenadas inválidas." }, { status: 400 });
  }

  try {
    const label = await reverseGeocode(latitude, longitude);
    return NextResponse.json({ label }, { headers: { "Cache-Control": "public, max-age=600" } });
  } catch (error) {
    logger.warn("Geocoder reverse failed", { error: error.message });
    return NextResponse.json({ label: null }, { status: 200 });
  }
}
