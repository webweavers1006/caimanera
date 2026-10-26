/**
 * Links to the marketing landing (separate project and domain).
 * The app only owns the product; legal and acquisition content live there.
 */

const baseUrl = (process.env.NEXT_PUBLIC_LANDING_URL || "").replace(/\/+$/, "");

export const LANDING_CONFIG = {
  url: baseUrl || null,
  termsUrl: baseUrl ? `${baseUrl}/terminos` : null,
  privacyUrl: baseUrl ? `${baseUrl}/privacidad` : null,
};
