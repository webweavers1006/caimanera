import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'

// Mock the dependencies before importing the module under test
vi.mock('@/features/auth/lib/auth', () => ({
  getSession: vi.fn(),
}))

vi.mock('@/features/permissions/services/permission.authorization.service', () => ({
  verifyPermission: vi.fn(),
}))

vi.mock('@/features/shared/lib/csrf-guard', () => ({
  validateCsrf: vi.fn(),
}))

vi.mock('@/features/shared', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

const { createProtectedAction } = await import('@/features/shared/lib/safe-action')
const { getSession } = await import('@/features/auth/lib/auth')
const { verifyPermission } = await import('@/features/permissions/services/permission.authorization.service')
const { validateCsrf } = await import('@/features/shared/lib/csrf-guard')

const testSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
})

describe('createProtectedAction', () => {
  const mockHandler = vi.fn().mockResolvedValue({ success: true, data: { id: 1 } })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reject when there is no session', async () => {
    getSession.mockResolvedValue(null)

    const action = createProtectedAction('users:create', testSchema, mockHandler)
    // Invoke as direct call (arg1 = data object)
    const result = await action({ name: 'Test', email: 'test@test.com' })

    expect(result.success).toBe(false)
    expect(result.error).toContain('No autorizado')
    expect(mockHandler).not.toHaveBeenCalled()
  })

  it('should reject invalid data (Zod validation)', async () => {
    getSession.mockResolvedValue({ id: 'uuid-1', role: 'ADMIN' })
    verifyPermission.mockResolvedValue(true)

    const action = createProtectedAction('users:create', testSchema, mockHandler)
    const result = await action({ name: 'A', email: 'not-an-email' })

    expect(result.success).toBe(false)
    expect(result.error).toContain('validación')
    expect(result.details).toBeDefined()
    expect(mockHandler).not.toHaveBeenCalled()
  })

  it('should reject when user lacks permission', async () => {
    getSession.mockResolvedValue({ id: 'uuid-1', role: 'USER' })
    verifyPermission.mockResolvedValue(false)

    const action = createProtectedAction('users:create', testSchema, mockHandler)
    const result = await action({ name: 'Test', email: 'test@test.com' })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Acceso denegado')
    expect(mockHandler).not.toHaveBeenCalled()
  })

  it('should execute handler when session, permission, and validation pass', async () => {
    getSession.mockResolvedValue({ id: 'uuid-1', role: 'ADMIN' })
    verifyPermission.mockResolvedValue(true)

    const action = createProtectedAction('users:create', testSchema, mockHandler)
    const result = await action({ name: 'Test User', email: 'test@test.com' })

    expect(result.success).toBe(true)
    expect(mockHandler).toHaveBeenCalledTimes(1)
    expect(mockHandler).toHaveBeenCalledWith(
      { name: 'Test User', email: 'test@test.com' },
      { id: 'uuid-1', role: 'ADMIN' }
    )
  })

  it('should support dynamic permission slugs (function)', async () => {
    getSession.mockResolvedValue({ id: 'uuid-1', role: 'ADMIN' })
    verifyPermission.mockResolvedValue(true)

    const dynamicPerm = (data) => data.id ? 'users:update' : 'users:create'
    const action = createProtectedAction(dynamicPerm, testSchema, mockHandler)
    const result = await action({ name: 'Test', email: 'test@test.com' })

    expect(result.success).toBe(true)
    expect(verifyPermission).toHaveBeenCalledWith('ADMIN', 'users:create')
  })

  it('should handle handler errors gracefully', async () => {
    getSession.mockResolvedValue({ id: 'uuid-1', role: 'ADMIN' })
    verifyPermission.mockResolvedValue(true)
    const failingHandler = vi.fn().mockRejectedValue(new Error('DB error'))

    const action = createProtectedAction('users:create', testSchema, failingHandler)
    const result = await action({ name: 'Test', email: 'test@test.com' })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Error interno')
  })

  it('should call CSRF validation before processing', async () => {
    validateCsrf.mockResolvedValue(undefined)
    getSession.mockResolvedValue({ id: 'uuid-1', role: 'ADMIN' })
    verifyPermission.mockResolvedValue(true)

    const action = createProtectedAction('users:create', testSchema, mockHandler)
    await action({ name: 'Test', email: 'test@test.com' })

    // CSRF must be called before any other check
    expect(validateCsrf).toHaveBeenCalled()
  })

  it('should reject when CSRF validation fails', async () => {
    // Simulate CSRF failure — the guard throws
    validateCsrf.mockImplementation(() => { throw new Error('CSRF validation failed') })
    getSession.mockResolvedValue({ id: 'uuid-1', role: 'ADMIN' })
    verifyPermission.mockResolvedValue(true)

    const action = createProtectedAction('users:create', testSchema, mockHandler)
    const result = await action({ name: 'Test', email: 'test@test.com' })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Error interno')
    expect(mockHandler).not.toHaveBeenCalled()
    expect(getSession).not.toHaveBeenCalled()
  })
})
