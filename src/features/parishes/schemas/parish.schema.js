import { z } from "zod";

/**
 * Zod schema for Parish validation.
 * Select-only feature — minimal schema for query params.
 */
export const parishQuerySchema = z.object({
  searchTerm: z.string().optional(),
  municipalityId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(1500).optional().default(1200),
  sortKey: z.enum(["name", "id"]).optional().default("name"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("asc"),
});
