import prisma from "@/features/shared/lib/prisma";
import { permissionMapper } from "../mappers/permission.mapper";

/**
 * Creates a new permission.
 * @param {Object} domainDto — { slug, description }
 * @returns {Promise<Object>} Domain permission object.
 */
export async function createPermission(domainDto) {
  const data = permissionMapper.toPersistence(domainDto);

  const rawPermission = await prisma.permission.create({ data });
  return permissionMapper.toDomain(rawPermission);
}

/**
 * Updates an existing permission by ID.
 * @param {number} id — Permission ID.
 * @param {Object} domainDto — { slug, description }
 * @returns {Promise<Object>} Updated domain permission object.
 */
export async function updatePermission(id, domainDto) {
  const data = permissionMapper.toPersistence(domainDto);

  const rawPermission = await prisma.permission.update({
    where: { id: Number(id) },
    data,
  });
  return permissionMapper.toDomain(rawPermission);
}

/**
 * Soft-deletes a permission by ID.
 * @param {number} id — Permission ID.
 * @returns {Promise<Object>} Soft-deleted domain permission object.
 */
export async function deletePermission(id) {
  const rawPermission = await prisma.permission.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
  });
  return permissionMapper.toDomain(rawPermission);
}
