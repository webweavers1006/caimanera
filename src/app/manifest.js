import { PWA_CONFIG, SITE_CONFIG } from '@/features/shared'

/** Colors mirror `--background` of the dark theme in `globals.css`. */
const THEME_COLOR = PWA_CONFIG.themeColor

/**
 * Web app manifest. Served at `/manifest.webmanifest` and linked automatically
 * by Next.js. Relative URLs keep it portable across local, staging and
 * production origins.
 */
export default function manifest() {
  return {
    id: '/',
    name: SITE_CONFIG.name,
    short_name: SITE_CONFIG.shortName,
    description: SITE_CONFIG.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'browser'],
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    lang: 'es',
    dir: 'ltr',
    categories: ['sports', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Buscar partidos',
        short_name: 'Partidos',
        description: 'Encuentra partidos cerca de ti',
        url: '/partidos',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Mis partidos',
        short_name: 'Mis partidos',
        description: 'Tu agenda y tu historial',
        url: '/mis-partidos',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Mi cuenta',
        short_name: 'Cuenta',
        description: 'Pase, pagos y datos de la cuenta',
        url: '/cuenta',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  }
}
