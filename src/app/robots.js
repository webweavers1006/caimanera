import { ROUTES } from '@/features/shared/config/navigation/navigation.config'

/**
 * Generates robots.txt rules.
 * Blocks all crawlers from admin routes and login, allows the rest.
 */
export default function robots() {
  const adminPaths = Object.values(ROUTES.ADMIN).map((r) => r.path)

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [ROUTES.AUTH.LOGIN.path, ...adminPaths],
      },
    ],
    // NEXT_PUBLIC_SITE_URL must be set in production for correct sitemap URL.
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/sitemap.xml`,
  }
}
