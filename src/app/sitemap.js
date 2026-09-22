import { ROUTES } from '@/features/shared/config/navigation/navigation.config'

/**
 * Generates sitemap.xml with static public routes.
 * Admin routes are excluded (protected by auth + robots.txt).
 */
export default function sitemap() {
  // NEXT_PUBLIC_SITE_URL must be set in production to avoid localhost fallback.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
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
