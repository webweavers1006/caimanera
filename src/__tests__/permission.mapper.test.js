import { describe, it, expect } from 'vitest'
import { permissionMapper } from '@/features/permissions/mappers/permission.mapper'

describe('permissionMapper', () => {
  const mockEntity = {
    id: 1,
    slug: 'users:read',
    description: 'View users',
  }

  const mockEntityNoDesc = {
    id: 2,
    slug: 'roles:create',
    description: null,
  }

  describe('toDomain', () => {
    it('should return null for null input', () => {
      expect(permissionMapper.toDomain(null)).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(permissionMapper.toDomain(undefined)).toBeNull()
    })

    it('should map all fields', () => {
      const result = permissionMapper.toDomain(mockEntity)
      expect(result).toEqual({
        id: 1,
        slug: 'users:read',
        description: 'View users',
      })
    })

    it('should handle null description', () => {
      const result = permissionMapper.toDomain(mockEntityNoDesc)
      expect(result.description).toBeNull()
    })
  })

  describe('toDomainList', () => {
    it('should return empty array for null', () => {
      expect(permissionMapper.toDomainList(null)).toEqual([])
    })

    it('should return empty array for non-array', () => {
      expect(permissionMapper.toDomainList({})).toEqual([])
    })

    it('should map an array of entities', () => {
      const result = permissionMapper.toDomainList([mockEntity, mockEntityNoDesc])
      expect(result).toHaveLength(2)
    })
  })

  describe('toPersistence', () => {
    it('should return null for null input', () => {
      expect(permissionMapper.toPersistence(null)).toBeNull()
    })

    it('should transform domain to persistence payload', () => {
      const domain = { slug: '  users:read  ', description: '  View users  ' }
      const result = permissionMapper.toPersistence(domain)
      expect(result).toEqual({
        slug: 'users:read',
        description: 'View users',
      })
    })

    it('should handle missing description', () => {
      const domain = { slug: 'roles:create' }
      const result = permissionMapper.toPersistence(domain)
      expect(result).toEqual({
        slug: 'roles:create',
        description: undefined,
      })
    })

    it('should trim whitespace from slug and description', () => {
      const domain = { slug: '  users:delete  ', description: '  Delete users  ' }
      const result = permissionMapper.toPersistence(domain)
      expect(result.slug).toBe('users:delete')
      expect(result.description).toBe('Delete users')
    })
  })

  describe('toSortKey', () => {
    it('should return allowed keys unchanged', () => {
      expect(permissionMapper.toSortKey('slug')).toBe('slug')
      expect(permissionMapper.toSortKey('description')).toBe('description')
      expect(permissionMapper.toSortKey('createdAt')).toBe('createdAt')
    })

    it('should fallback to slug for unknown keys', () => {
      expect(permissionMapper.toSortKey('name')).toBe('slug')
      expect(permissionMapper.toSortKey('invalid')).toBe('slug')
    })
  })
})
