import { NextResponse } from 'next/server'
import { decrypt, SESSION_COOKIE } from '@/features/auth/lib/auth'
import { ROUTES } from '@/features/shared/config/navigation/navigation.config'
import { getHomePathForRole } from '@/features/auth/config/auth.constants'

// ── Route classification derived from ROUTES (single source of truth) ──────
const LOGIN_PATH = ROUTES.AUTH.LOGIN.path
const { PUBLIC: PUBLIC_API_PATHS } = ROUTES.API

// Public page routes — no session required
const PUBLIC_PATHS = [
  ROUTES.PUBLIC.DISCOVERY.path,
  ROUTES.PUBLIC.MATCHES.path,
  ROUTES.PUBLIC.TERMS.path,
  ROUTES.PUBLIC.PRIVACY.path,
  LOGIN_PATH,
]

function isPublicPath(path) {
  // Uses '/' and '?' as explicit delimiters after the prefix to avoid collisions.
  return PUBLIC_PATHS.some(
    (publicPath) =>
      path === publicPath ||
      path.startsWith(publicPath + '/') ||
      path.startsWith(publicPath + '?')
  )
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

  const isApiRoute = path.startsWith('/api')
  const isProtected = !isPublicPath(path)
  const isPublicApi = isApiRoute && isPublicApiPath(path)
  const isLoginPage = path === LOGIN_PATH

  const cookie = req.cookies.get(SESSION_COOKIE)?.value
  const session = await decrypt(cookie)

  // API routes without session → 401 JSON (never redirect to login page)
  if (isApiRoute && !isPublicApi && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Page routes without session → redirect to login
  if (isProtected && !session && !isApiRoute) {
    const loginUrl = new URL(LOGIN_PATH, req.nextUrl)
    if (path !== '/') loginUrl.searchParams.set('next', path + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Already authenticated → redirect away from login page
  if (session && isLoginPage) {
    const next = req.nextUrl.searchParams.get('next')
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null
    return NextResponse.redirect(new URL(safeNext || getHomePathForRole(session.role), req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
