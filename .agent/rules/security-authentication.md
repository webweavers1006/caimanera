---
trigger: always_on
---

# 🛡️ Security & Authentication (PRIORIDAD MÁXIMA)

> **Principio**: Seguridad por defecto. Toda funcionalidad debe ser inaccesible hasta que se verifiquen autenticación y autorización.

## 🔑 JWT y Secrets

- `JWT_SECRET` **debe** tener mínimo **32 caracteres**. Sin fallback. Si no existe o es corto, el sistema debe lanzar error fatal.
- **Prohibido**: valores por defecto, hardcodeados o `fallback` en secrets.
- **Prohibido**: commits con secrets. Usar `.env` (ya en `.gitignore`).
- Algoritmo: **HS256** como mínimo.

## 🔐 Sesión (Jose)

- Almacenada en cookies **HTTP-only**, **Secure** (en producción), **SameSite=Lax**, **Path=/**.
- **Payload mínimo**: `id, role`. No incluir datos innecesarios (email, nombre, etc.).
- **Expiración obligatoria**: **8 horas** (`8 * 60 * 60 * 1000` ms).
- **Logout**: debe eliminar la cookie del lado del servidor.
- **Prohibido**: almacenar tokens o sesiones en `localStorage`, `sessionStorage`, o cookies accesibles por JS.

## 🔒 Autenticación

- **bcrypt** con mínimo **10 rondas de salt** (`bcrypt.hash(password, 10)`).
- **Mismo mensaje de error** para: credenciales inválidas, usuario inexistente, cuenta inactiva/eliminada. **Nunca** revelar si el usuario existe.
- **Rate limiting** en endpoints de login (mínimo: 5 intentos por IP en 15 minutos).
- La contraseña nunca se loguea, ni hasheada.

## 🛂 Control de Acceso (RBAC)

- **Toda** Server Action debe usar `createProtectedAction(permissionSlug, schema, handler)` o `createProtectedFunction(permissionSlug, handler)`.
- **Toda** página RSC protegida debe usar `checkPageAccess(requiredSlug)` de `auth-guard.js`.
- **Cliente**: usar `usePermission().can(slug)` del `PermissionsProvider` **solo para ocultar UI**. Nunca como única verificación de seguridad.
- **Prohibido**: mensajes de error que filtren slugs de permisos, nombres de roles, o detalles internos del sistema.

## ✅ Validación (Zod)

- **Obligatoria** en cada entrada de datos: formularios, APIs, query params.
- **Whitelist, no blacklist**: definir exactamente qué se acepta (tipo, longitud, formato), no qué se rechaza.
- Schemas mínimos: email con `.email()`, strings con `.min()`/`.max()`, números con `.int()`/`.positive()`.

## 🧹 Sanitización y XSS

- **Prohibido**: `dangerouslySetInnerHTML`.
- **Prohibido**: renderizar datos crudos de usuario sin sanitizar (React escapa por defecto — no desactivarlo).
- **Prohibido**: insertar HTML desde el servidor sin sanitización previa.

## 🗄️ Base de Datos

- **Prohibido**: SQL crudo o strings concatenadas. Solo API tipada de Prisma.
- `$queryRaw` solo con bind parameters (`$queryRaw\`SELECT ... WHERE id = ${id}\``), nunca con interpolación directa.
- **Soft delete obligatorio**: nunca `DELETE` físico en usuarios o entidades auditables. Usar `deletedAt`.
- **Timestamps de auditoría**: `createdAt`, `updatedAt` en todos los modelos.

## 🔍 Logging Seguro

- **Prohibido**: loguear PII (cédulas completas, JWT, cookies, contraseñas, emails completos).
- Solo IDs, hashes, o primeros/últimos caracteres.
- Usar `logger` centralizado (`@/features/shared/lib/logger`), nunca `console.log`.
- Niveles: `error` para fallos, `warn` para intentos fallidos de auth, `info` para operaciones normales.

## 🌐 Headers de Seguridad

- **CSP**: Content-Security-Policy configurado en `proxy.js` o `next.config.mjs` (restringir scripts, estilos, conexiones).
- **HSTS**: Strict-Transport-Security en producción (forzar HTTPS).
- **X-Content-Type-Options**: `nosniff`.
- **X-Frame-Options**: `DENY` (evitar clickjacking).
- **Referrer-Policy**: `strict-origin-when-cross-origin`.

## 📦 Dependencias

- **Prohibido**: `npm audit fix --force` (rompe Next.js y Prisma).
- Ejecutar `npm audit` regularmente para detectar vulnerabilidades.
- Vulnerabilidades moderadas en dependencias de build/desarrollo son aceptables.

## 🏷️ Environment Variables

- **Prohibido**: valores por defecto para secrets en código.
- `.env.example` debe documentar todas las variables requeridas sin valores reales.
- `.env` **nunca** se commitea (ya en `.gitignore`).
