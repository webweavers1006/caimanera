import prisma from "@/features/shared/lib/prisma";
import { auditLogMapper } from "../mappers/audit-log.mapper";

export const auditLogWriteRepository = {
  /**
   * Creates a single audit log entry.
   * Used by other modules to register system events.
   */
  async create(data) {
    const persistence = auditLogMapper.toPersistence(data);
    return await prisma.auditLog.create({ data: persistence });
  },
};
