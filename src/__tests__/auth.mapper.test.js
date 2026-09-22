import { describe, it, expect } from 'vitest'
import { authMapper } from '@/features/auth/mappers/auth.mapper'

describe('authMapper', () => {
  const mockEntity = {
    id: 'uuid-123',
    idCard: '12345678',
    password: '$2a$10$hashed',
    deletedAt: null,
    role: { name: 'ADMIN' },
  }

  const mockDeletedEntity = {
    id: 'uuid-456',
    idCard: '87654321',
    password: null,
    deletedAt: new Date('2025-01-01'),
    role: null,
  }

  describe('toDomain', () => {
    it('should return null for null input', () => {
      expect(authMapper.toDomain(null)).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(authMapper.toDomain(undefined)).toBeNull()
    })

    it('should map all fields correctly', () => {
      const result = authMapper.toDomain(mockEntity)
      expect(result).toEqual({
        id: 'uuid-123',
        idCard: '12345678',
        password: '$2a$10$hashed',
        deletedAt: null,
        roleName: 'ADMIN',
      })
    })

    it('should handle null role', () => {
      const result = authMapper.toDomain(mockDeletedEntity)
      expect(result.roleName).toBeNull()
    })

    it('should preserve deletedAt date', () => {
      const result = authMapper.toDomain(mockDeletedEntity)
      expect(result.deletedAt).toEqual(new Date('2025-01-01'))
    })
  })

  describe('toDomainList', () => {
    it('should return empty array for null', () => {
      expect(authMapper.toDomainList(null)).toEqual([])
    })

    it('should return empty array for undefined', () => {
      expect(authMapper.toDomainList(undefined)).toEqual([])
    })

    it('should return empty array for non-array', () => {
      expect(authMapper.toDomainList('not-array')).toEqual([])
    })

    it('should map an array of entities', () => {
      const result = authMapper.toDomainList([mockEntity, mockDeletedEntity])
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('uuid-123')
      expect(result[1].id).toBe('uuid-456')
    })

    it('should handle empty array', () => {
      expect(authMapper.toDomainList([])).toEqual([])
    })
  })

  describe('toSortKey', () => {
    it('should return allowed keys unchanged', () => {
      expect(authMapper.toSortKey('idCard')).toBe('idCard')
      expect(authMapper.toSortKey('deletedAt')).toBe('deletedAt')
      expect(authMapper.toSortKey('createdAt')).toBe('createdAt')
    })

    it('should fallback to createdAt for unknown keys', () => {
      expect(authMapper.toSortKey('email')).toBe('createdAt')
      expect(authMapper.toSortKey('invalid')).toBe('createdAt')
    })
  })
})
