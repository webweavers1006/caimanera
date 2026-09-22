import { NextResponse } from 'next/server'
import { decrypt, SESSION_COOKIE } from '@/features/auth/lib/auth'
import { ROUTES } from '@/features/shared/config/navigation/navigation.config'

// ── Route classification derived from ROUTES (single source of truth) ──────
const LOGIN_PATH = ROUTES.AUTH.LOGIN.path
const DASHBOARD_PATH = ROUTES.DASHBOARD.path
const { PUBLIC: PUBLIC_API_PATHS } = ROUTES.API

// Public page routes — no session required
const PUBLIC_PATHS = [LOGIN_PATH]

function isPublicPath(path) {
  // Uses '/' and '?' as explicit delimiters after the prefix to avoid collisions.
  // E.g. '/turnos' matches '/turnos', '/turnos/123', '/turnos?office=1'
  // but NOT '/turnos-admin' (no '/' or '?' immediately after the prefix).
  return PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/') || path.startsWith(p + '?'))
}

function isPublicApiPath(path) {
  return PUBLIC_API_PATHS.some(p => path.startsWith(p))
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
    return NextResponse.redirect(new URL(LOGIN_PATH, req.nextUrl))
  }

  // Already authenticated → redirect away from login page
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
