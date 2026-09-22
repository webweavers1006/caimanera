import { z } from 'zod'

/**
 * Whitelist validation for the login-locks unlock action.
 * Accepts IPv4, IPv6-like strings, or the 'unknown' fallback key
 * used by the login rate limiter.
 */
export const unlockLoginIpSchema = z.object({
  ip: z
    .string()
    .trim()
    .min(1, 'IP inválida')
    .max(64, 'IP inválida')
    .regex(/^(unknown|(\d{1,3}(\.\d{1,3}){3})|[0-9a-fA-F:]+)$/, 'IP inválida'),
})
