import { NextResponse } from 'next/server'
import { decrypt, SESSION_COOKIE } from '@/features/auth/lib/auth'
import { ROUTES } from '@/features/shared/config/navigation/navigation.config'
import { LANDING_CONFIG } from '@/features/shared/config/app/landing.config'
import { getHomePathForRole, isManagementRole } from '@/features/auth/config/auth.constants'

// ── Route classification derived from ROUTES (single source of truth) ──────
const LOGIN_PATH = ROUTES.AUTH.LOGIN.path
const HOME_PATH = ROUTES.PLAYER.HOME.path
const { PUBLIC: PUBLIC_API_PATHS } = ROUTES.API

// Legal content now lives in the landing. Old in-app URLs keep working.
const LEGACY_LEGAL_REDIRECTS = {
  '/terminos': LANDING_CONFIG.termsUrl,
  '/privacidad': LANDING_CONFIG.privacyUrl,
}

// Open pages — no session required.
// The home is the public entry point: it shows the welcome, quick actions and
// nearby venues. Everything else that is not explicitly open needs a session.
const OPEN_PATHS = [HOME_PATH, LOGIN_PATH]

function matchesPath(path, base) {
  // Uses '/' and '?' as explicit delimiters after the prefix to avoid collisions.
  return (
    path === base ||
    path.startsWith(base + '/') ||
    path.startsWith(base + '?')
  )
}

function isOpenPath(path) {
  return OPEN_PATHS.some((openPath) => matchesPath(path, openPath))
}

function isPublicApiPath(path) {
  return PUBLIC_API_PATHS.some((publicPath) => path.startsWith(publicPath))
}

export async function proxy(req) {
  const path = req.nextUrl.pathname

  // Skip static files and Next.js internals
  if (path.startsWith('/_next') || path.startsWith('/static') || path.includes('.')) {
    return NextResponse.next()
  }

  // Legacy legal URLs: send them to the landing, or to the app entry if the
  // landing is not configured yet.
  if (Object.hasOwn(LEGACY_LEGAL_REDIRECTS, path)) {
    const destination = LEGACY_LEGAL_REDIRECTS[path] || ROUTES.PUBLIC.MATCHES.path
    return NextResponse.redirect(new URL(destination, req.nextUrl))
  }

  const isApiRoute = path.startsWith('/api')
  const isPublicApi = isApiRoute && isPublicApiPath(path)
  const isLoginPage = path === LOGIN_PATH
  const isHome = path === HOME_PATH

  const cookie = req.cookies.get(SESSION_COOKIE)?.value
  const session = await decrypt(cookie)

  // API routes without session → 401 JSON (never redirect to login page)
  if (isApiRoute && !isPublicApi && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // App entry: public home. Visitors see the welcome, quick actions and the
  // venue mosaic; staff goes to the panel; players stay on their home.
  if (isHome) {
    // Legacy `?partido=` deep links now point at the canonical detail.
    const legacyMatchId = req.nextUrl.searchParams.get('partido')
    if (legacyMatchId) {
      return NextResponse.redirect(
        new URL(`${ROUTES.PUBLIC.MATCHES.path}/${encodeURIComponent(legacyMatchId)}`, req.nextUrl)
      )
    }

    if (session && isManagementRole(session.role)) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD.path, req.nextUrl))
    }
    return NextResponse.next()
  }

  // Already authenticated → redirect away from login page
  if (session && isLoginPage) {
    const next = req.nextUrl.searchParams.get('next')
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null
    return NextResponse.redirect(new URL(safeNext || getHomePathForRole(session.role), req.nextUrl))
  }

  // Staff lives in the administrative panel. If they open a player surface,
  // send them back to the dashboard instead of mixing both experiences.
  const isAdminPath =
    path === ROUTES.DASHBOARD.path || path.startsWith(`${ROUTES.DASHBOARD.path}/`)
  if (session && isManagementRole(session.role) && !isAdminPath && !isApiRoute) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD.path, req.nextUrl))
  }

  // Everything that is not explicitly open requires a session.
  // This covers player pages, the admin panel and unknown paths.
  if (!isOpenPath(path) && !isApiRoute && !session) {
    const loginUrl = new URL(LOGIN_PATH, req.nextUrl)
    loginUrl.searchParams.set('next', path + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
