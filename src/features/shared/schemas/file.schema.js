import { z } from "zod";
import { FILE_MAX_SIZE, FILE_ALLOWED_EXTENSIONS } from "@/features/shared/lib/file-validation";

/**
 * Shared Zod schema for file upload validation.
 * Used by all file upload actions across features.
 *
 * Validates:
 *  - File object existence and basic integrity
 *  - Size ≤ FILE_MAX_SIZE (10 MB)
 *  - Extension in allowed list
 *  - Name sanitization (no path traversal, length ≤ 255)
 *  - caseId as positive integer
 *  - description max 500 chars
 */

/** Validates a File/Blob object shape */
const fileShape = z.object({
  name: z.string().min(1, "El archivo no tiene nombre.").max(255, "Nombre de archivo demasiado largo."),
  size: z.number().min(1, "El archivo está vacío.").max(FILE_MAX_SIZE, `El archivo excede el tamaño máximo de ${(FILE_MAX_SIZE / 1024 / 1024).toFixed(0)} MB.`),
  type: z.string().optional(),
}).refine(
  (f) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ext && FILE_ALLOWED_EXTENSIONS.includes(ext);
  },
  { message: "Extensión de archivo no permitida.", path: ["name"] }
).refine(
  (f) => !/[\/\\:\0]|\.\./.test(f.name),
  { message: "Nombre de archivo no válido.", path: ["name"] }
);

/** Schema for creating/uploading a case document */
export const documentUploadSchema = z.object({
  file: fileShape,
  caseId: z.number().int().positive("ID de caso inválido."),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres.").optional().default(""),
});

/** Schema for deleting a case document */
export const documentDeleteSchema = z.object({
  id: z.number().int().positive("ID de documento inválido."),
});
