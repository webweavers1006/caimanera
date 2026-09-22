/**
 * mapper-utils.js
 * Shared utility for building Prisma persistence payloads safely.
 *
 * PROBLEM IT SOLVES:
 *   Traditional mappers return ALL fields with null defaults, so partial
 *   updates like { caseStatusId: 2 } would overwrite every other column
 *   with null — effectively deleting all case data.
 *
 * USAGE:
 *   pickPresent(domain, {
 *     description: (v) => v?.trim() || null,
 *     caseStatusId: (v) => v ? Number(v) : null,
 *   })
 *
 *   // domain = { caseStatusId: 2 }
 *   // → { caseStatusId: 2 }           ← only present fields
 *
 *   // domain = { description: "Hola", caseStatusId: 2, caseAreaId: 3 }
 *   // → { description: "Hola", caseStatusId: 2, caseAreaId: 3 }
 *
 * @param {Object} domain - The domain object with potentially partial keys.
 * @param {Object<string, Function>} mapping - Key → transform function.
 *        Only keys present in `domain` are processed.
 * @returns {Object} Prisma-compatible payload with only the mapped fields.
 */
export function pickPresent(domain, mapping) {
  const payload = {};

  for (const key of Object.keys(mapping)) {
    if (key in domain) {
      payload[key] = mapping[key](domain[key]);
    }
  }

  return payload;
}
