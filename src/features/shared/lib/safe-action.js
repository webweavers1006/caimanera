import { getSession } from "@/features/auth/lib/auth";
import { verifyPermission } from "@/features/permissions/services/permission.authorization.service";
import { validateCsrf } from "@/features/shared/lib/csrf-guard";
import { logger } from "@/features/shared";

/**
 * Crea una Server Action protegida con validación CSRF, sesión, permisos y esquema Zod.
 * (Diseñada para usar con useActionState / Formularios, pero soporta invocación directa con JSON)
 * 
 * @param {string | (data: any) => string} permissionSlug - El slug requerido (ej: 'users:create') o función para determinarlo dinámicamente.
 * @param {import("zod").Schema} schema - Schema de Zod para validar el FormData.
 * @param {Function} handler - Tu función de lógica de negocio: (data, session) => Promise<Result>
 * @returns {Function} Server Action lista para usar en formularios: (prevState, formData) => Promise<Result>
 */
export function createProtectedAction(permissionSlug, schema, handler) {
  return async (arg1, arg2) => {
    try {
      // 0. CSRF Protection — blocks cross-origin requests
      await validateCsrf();

      // 1. Verificar Sesión
      const session = await getSession();
      if (!session) {
        return { success: false, error: "No autorizado. Por favor inicia sesión nuevamente." };
      }

      // 2. Normalizar Input (Soporte polimórfico: FormData vs JSON)
      let rawData;
      
      // Caso A: (prevState, formData) - Estándar useActionState
      if (arg2 instanceof FormData) {
        rawData = Object.fromEntries(arg2);
      }
      // Caso B: (formData) - Invocación directa como action={fn}
      else if (arg1 instanceof FormData) {
        rawData = Object.fromEntries(arg1);
      }
      // Caso C: (dataObject) - Invocación programática await fn({ ... })
      else if (typeof arg1 === 'object' && arg1 !== null) {
        rawData = arg1;
      }
      else {
        // Fallback para evitar crash si llega undefined
        rawData = {};
      }
      
      const parsed = schema.safeParse(rawData);

      if (!parsed.success) {
        // Devolver errores estructurados para que el frontend pueda mapearlos a los inputs
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const errorMessage = "Error de validación. Revisa los campos marcados.";
        
        return { 
          success: false, 
          error: errorMessage,
          details: fieldErrors // { email: ["Email inválido"], cedula: ["..."] }
        };
      }

      // 3. Determinar el Permiso requerido
      const requiredPerm = typeof permissionSlug === 'function' 
        ? permissionSlug(parsed.data) 
        : permissionSlug;

      // 4. Verificar Permiso en DB
      const hasAccess = await verifyPermission(session.role, requiredPerm);
      
      if (!hasAccess) {
        return { 
          success: false, 
          error: "Acceso denegado. No tienes permisos suficientes para realizar esta acción." 
        };
      }

      // 5. Ejecutar lógica de negocio
      return await handler(parsed.data, session);

    } catch (error) {
      logger.error("SafeAction error", { error: error.message });
      return { success: false, error: "Error interno del servidor." };
    }
  };
}

/**
 * Crea una función segura para invocar directamente (ej. Delete con ID).
 * No procesa FormData, recibe argumentos directos.
 * 
 * @param {string} permissionSlug - El slug del permiso requerido.
 * @param {Function} handler - Tu función (args, session) => Promise<Result>
 */
export function createProtectedFunction(permissionSlug, handler) {
    return async (...args) => {
        try {
            // CSRF Protection
            await validateCsrf();

            const session = await getSession();
            if (!session) return { success: false, error: "No autorizado" };

            const hasAccess = await verifyPermission(session.role, permissionSlug);
            if (!hasAccess) {
                return { success: false, error: "Acceso denegado. No tienes permisos suficientes para realizar esta acción." };
            }

            return await handler(...args, session);
        } catch (error) {
            logger.error("ProtectedFunction error", { error: error.message });
            return { success: false, error: "Error interno." };
        }
    }
}

/**
 * Crea una función segura que requiere autenticación (CSRF + sesión)
 * pero SIN permiso RBAC específico.
 *
 * Usar exclusivamente para catálogos públicos de solo lectura
 * (estados, municipios, tipos de atención, etc.) usados en dropdowns.
 *
 * NO usar para: datos con PII, operaciones de escritura, o datos
 * que deban restringirse por rol.
 *
 * @param {Function} handler - Tu función (args, session) => Promise<Result>
 */
export function createAuthenticatedFunction(handler) {
    return async (...args) => {
        try {
            // CSRF Protection
            await validateCsrf();

            const session = await getSession();
            if (!session) return { success: false, error: "No autorizado" };

            return await handler(...args, session);
        } catch (error) {
            logger.error("AuthenticatedFunction error", { error: error.message });
            return { success: false, error: "Error interno." };
        }
    }
}
