import prisma from "@/features/shared/lib/prisma";
import { roleMapper } from "../mappers/role.mapper";

/**
 * Crea un nuevo rol con sus permisos asociados.
 */
export async function createRole(domainDto) {
  const data = roleMapper.toPersistence(domainDto);

  if (domainDto.permissionIds?.length > 0) {
    data.rolePermissions = {
      create: domainDto.permissionIds.map(id => ({
        permission: { connect: { id } }
      }))
    };
  }

  const rawRole = await prisma.role.create({
    data,
    include: {
      rolePermissions: { include: { permission: true } }
    }
  });

  return roleMapper.toDomain(rawRole);
}

/**
 * Actualiza un rol existente y sus permisos.
 */
export async function updateRole(id, domainDto) {
  const data = roleMapper.toPersistence(domainDto);

  if (domainDto.permissionIds) {
    data.rolePermissions = {
      deleteMany: {},
      create: domainDto.permissionIds.map(permId => ({
        permission: { connect: { id: permId } }
      }))
    };
  }

  const rawRole = await prisma.role.update({
    where: { id: Number(id) },
    data,
    include: {
      rolePermissions: { include: { permission: true } }
    }
  });

  return roleMapper.toDomain(rawRole);
}

/**
 * Soft-delete de un rol por ID.
 */
export async function deleteRole(id) {
  const rawRole = await prisma.role.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
  });
  return roleMapper.toDomain(rawRole);
}
