'use server'

import { logout } from '@/features/auth/lib/auth'
import { redirect } from 'next/navigation'
import { validateCsrf } from '@/features/shared/lib/csrf-guard'

/**
 * Server Action to logout.
 * Validates CSRF token, removes session cookie, and redirects to login.
 */
export async function logoutAction() {
  await validateCsrf()
  await logout()
  redirect('/login')
}
