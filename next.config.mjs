import { config } from 'dotenv'

// Load .env first — Next.js does this later, but we need SECRETS_FILE now
// to know where the external secrets file lives.
config({ override: true })

// Load secrets from an external file outside the project directory.
// Path comes via SECRETS_FILE env var (set in .env or ecosystem.config.js).
if (process.env.SECRETS_FILE) {
  config({ path: process.env.SECRETS_FILE, override: true })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow dev server access from LAN IPs
  allowedDevOrigins: process.env.DEV_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) ?? [],

  // Server Actions body size limit (default 1 MB — too small for file uploads)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      // Trust our own reverse proxy (nginx) so legitimate requests
      // forwarded with x-forwarded-host don't get blocked.
      allowedForwardedHosts: ['siac.saime.gob.ve'],
    },
  },

  // ── Security Headers ─────────────────────────────────────────────────
  // Applied to all routes. CSP can be tightened per environment.
  headers: async () => {
    const isProduction = process.env.NODE_ENV === 'production'

    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HSTS — force HTTPS in production (max-age 1 year)
          ...(isProduction
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
          // CSP — restrict script/style sources
          // 'unsafe-inline' for scripts is required by Next.js runtime (hydration chunks).
          // TODO: Migrate to nonce-based CSP for stricter script control.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${!isProduction ? "'unsafe-eval'" : ''}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com",
              "font-src 'self' data:",
              "connect-src 'self' https://tile.openstreetmap.org https://*.tile.openstreetmap.org ws://127.0.0.1:3002 wss://127.0.0.1:3002 ws://127.0.0.1:3003/ wss://127.0.0.1:3003/ http://tablet.sigwebtablet.com:47289 https://tablet.sigwebtablet.com:47290",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig;