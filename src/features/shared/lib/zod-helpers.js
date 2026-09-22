import { z } from "zod";

/**
 * Reusable Zod helpers for schema definitions across the project.
 */

/**
 * Optional positive integer FK.
 * Preprocesses empty/falsy values to null, then validates as nullable optional positive int.
 *
 * Usage: optionalIntId
 * - null / "" / undefined → null (passes)
 * - 0 → fails (not positive)
 * - 123 → passes
 */
export const optionalIntId = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().int().positive().nullable().optional()
);
