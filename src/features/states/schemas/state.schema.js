import { z } from "zod";

/**
 * Zod schema for State validation.
 * Select-only feature — minimal schema for query params.
 */
export const stateQuerySchema = z.object({
  searchTerm: z.string().optional(),
  countryId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(30),
  sortKey: z.enum(["name", "id"]).optional().default("name"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("asc"),
});
