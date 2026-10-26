import { ROUTES } from '@/features/shared/config/navigation/navigation.config'

/**
 * Generates sitemap.xml with the public app route.
 * Player, match search, venue and admin routes are excluded because they
 * require a session (see robots.txt).
 */
export default function sitemap() {
  // NEXT_PUBLIC_SITE_URL must be set in production to avoid localhost fallback.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

  return [
    {
      url: `${baseUrl}${ROUTES.PLAYER.HOME.path}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}${ROUTES.AUTH.LOGIN.path}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
