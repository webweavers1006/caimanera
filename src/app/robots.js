import { ROUTES } from '@/features/shared/config/navigation/navigation.config'

/**
 * Generates robots.txt rules.
 * Blocks all crawlers from admin routes and login, allows the rest.
 */
export default function robots() {
  const privatePaths = [
    ROUTES.PUBLIC.MATCHES.path,
    ROUTES.PUBLIC.COURTS.path,
    ROUTES.PLAYER.MY_MATCHES.path,
    ROUTES.PLAYER.ACCOUNT.path,
    ROUTES.PLAYER.PASSES.path,
    ROUTES.PLAYER.PAYMENTS.path,
    ROUTES.DASHBOARD.path,
    ...Object.values(ROUTES.ADMIN).map((route) => route.path),
    ROUTES.AUDIT.path,
    ...Object.values(ROUTES.CATALOGS).map((route) => route.path),
    ROUTES.PROFILE.path,
    // PWA offline fallback: static and never indexed.
    '/offline',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [ROUTES.AUTH.LOGIN.path, ...privatePaths],
      },
    ],
    // NEXT_PUBLIC_SITE_URL must be set in production for correct sitemap URL.
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/sitemap.xml`,
  }
}
