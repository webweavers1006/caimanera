/**
 * Mapeador para la entidad User.
 * Centraliza la transformación entre Prisma y el Dominio.
 */

export const userMapper = {
  /**
   * Transforms a Prisma record into a Domain object.
   */
  toDomain(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      idCard: entity.idCard,
      email: entity.email,
      roleId: entity.roleId,
      administrativeDirectionId: entity.administrativeDirectionId,
      attentionChannelId: entity.attentionChannelId,
      officeId: entity.officeId,
      organizationalUnitId: entity.organizationalUnitId,
      // Computado: activo cuando no está eliminado suavemente
      isActive: entity.deletedAt == null,
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,

      // Relaciones
      role: entity.role ? {
        id: entity.role.id,
        name: entity.role.name,
        description: entity.role.description,
      } : null,
      administrativeDirection: entity.administrativeDirection ? {
        id: entity.administrativeDirection.id,
        name: entity.administrativeDirection.name,
        email: entity.administrativeDirection.email,
        isAudit: entity.administrativeDirection.isAudit,
        leaderId: entity.administrativeDirection.leaderId,
      } : null,
      attentionChannel: entity.attentionChannel ? {
        id: entity.attentionChannel.id,
        name: entity.attentionChannel.name,
      } : null,
      office: entity.office ? {
        id: entity.office.id,
        name: entity.office.name,
      } : null,
      organizationalUnit: entity.organizationalUnit ? {
        id: entity.organizationalUnit.id,
        name: entity.organizationalUnit.name,
        seeAllDirection: entity.organizationalUnit.seeAllDirection ?? false,
      } : null,
      departments: entity.departmentMembers
        ? entity.departmentMembers.map((m) => ({ id: m.department.id, name: m.department.name }))
        : [],
      // Permissions (only populated on PDF export queries — role.rolePermissions)
      permissions: entity.role?.rolePermissions
        ? entity.role.rolePermissions.map((rp) => rp.permission.slug)
        : undefined,
    };
  },

  /**
   * Transforms a list of Prisma records.
   */
  toDomainList(entities) {
    if (!entities || !Array.isArray(entities)) return [];
    return entities.map(this.toDomain);
  },

  /**
   * Transforms a Domain object into a Prisma write payload.
   */
  toPersistence(domain) {
    if (!domain) return null;

    const entity = {};

    if (domain.firstName !== undefined) entity.firstName = domain.firstName?.trim().toUpperCase();
    if (domain.lastName  !== undefined) entity.lastName  = domain.lastName?.trim().toUpperCase();
    if (domain.idCard    !== undefined) entity.idCard    = domain.idCard?.trim();
    if (domain.email     !== undefined) entity.email     = domain.email?.trim().toLowerCase();
    if (domain.password  !== undefined) entity.password  = domain.password;
    // Use relation "connect" syntax for FK fields to satisfy Prisma's XOR<UserUpdateInput, UserUncheckedUpdateInput>
    // Passing scalar FK fields (like "roleId") triggers "Unknown argument" errors because Prisma resolves
    // the XOR to the checked variant (UserUpdateInput), which only accepts relations ("role").
    if (domain.roleId !== undefined) {
      entity.role = domain.roleId !== null
        ? { connect: { id: Number(domain.roleId) } }
        : { disconnect: true };
    }
    if (domain.administrativeDirectionId !== undefined) {
      entity.administrativeDirection = domain.administrativeDirectionId !== null
        ? { connect: { id: Number(domain.administrativeDirectionId) } }
        : { disconnect: true };
    }
    if (domain.attentionChannelId !== undefined) {
      entity.attentionChannel = domain.attentionChannelId !== null
        ? { connect: { id: Number(domain.attentionChannelId) } }
        : { disconnect: true };
    }
    if (domain.officeId !== undefined) {
      entity.office = domain.officeId !== null
        ? { connect: { id: Number(domain.officeId) } }
        : { disconnect: true };
    }
    
    // isActive (dominio) → deletedAt (Prisma): true = activo (null), false = soft-delete (ahora)
    if (domain.isActive !== undefined) {
      entity.deletedAt = domain.isActive ? null : (domain.deletedAt || new Date());
    }

    return entity;
  },

  /**
   * Translates domain sort keys to Prisma field names.
   */
  toSortKey(domainKey) {
    const allowedKeys = ["firstName", "lastName", "idCard", "email", "role", "createdAt"];
    return allowedKeys.includes(domainKey) ? domainKey : "createdAt";
  }
};
