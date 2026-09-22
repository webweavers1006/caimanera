import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { AUTH_CONFIG } from '../config/auth.constants'

const secret = process.env.JWT_SECRET
if (!secret || secret.length < 32) {
  throw new Error(
    '[AUTH] JWT_SECRET is not defined or is less than 32 characters. ' +
    'Generate a secure one with: openssl rand -base64 32'
  )
}
const key = new TextEncoder().encode(secret)
const ALG = 'HS256'

/**
 * Cookie name — uses __Host- prefix in production (Secure=true) for cookie tossing protection.
 * Falls back to plain 'session' in dev without HTTPS, since __Host- requires Secure.
 */
export const SESSION_COOKIE = process.env.COOKIE_SECURE !== 'false'
  ? '__Host-session'
  : 'session'

/**
 * Encrypts a payload into a JWT.
 * @param {Object} payload - Data to encrypt.
 * @returns {Promise<string>} JWT string.
 */
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(AUTH_CONFIG.SESSION.EXPIRES_IN_STR)
    .sign(key)
}

/**
 * Decrypts and verifies a JWT.
 * @param {string} token - JWT string.
 * @returns {Promise<Object|null>} Payload or null if invalid.
 */
export async function decrypt(token) {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: [ALG] })
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Creates a session cookie.
 * @param {Object} user - User data ({ id, role, firstName }).
 */
export async function createSession(user) {
  const expires = new Date(Date.now() + AUTH_CONFIG.SESSION.EXPIRES_IN_MS)

  // Minimal JWT payload — id, role, and firstName (needed for UI display)
  const session = await encrypt({
    id: user.id,
    role: user.role,
    firstName: user.firstName,
  })

  const cookieStore = await cookies()

  // Secure in production (HTTPS), overridable via COOKIE_SECURE env var.
  // Set COOKIE_SECURE=false only for local dev without HTTPS.
  const isSecure = process.env.COOKIE_SECURE !== 'false'

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: isSecure,
    expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export const getSession = cache(async () => {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)?.value
  if (!session) return null
  return await decrypt(session)
})
