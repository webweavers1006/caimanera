# Reglas del Proyecto — Admin Starter

> **Agent Profile:** Senior Full-Stack Developer.
> **Environment:** Linux. Node.js con `TZ=UTC`.
> **Stack:** Next.js 16.2 (App Router), React 19, Tailwind 4, Prisma 7.5, PostgreSQL, JWT (jose).

---

## 1. 🛠️ Stack Specifications

### Next.js 16.2 & React 19

- Usar **Server Components por defecto**.
- Implementar `"use cache"` en `services/` para optimizar data fetching.
- En React 19, los `refs` son props normales. **Prohibido**: usar `forwardRef`.
- **Prohibido**: renderizar fechas dinámicas directamente en el cliente. Usar estrategias de supresión o formateo del lado del servidor para evitar *Hydration Mismatch*.

### Tailwind CSS v4

- **Prohibido**: usar `tailwind.config.js`. Toda la customización del tema va en CSS global vía `@theme`.

### Prisma

- Uso exclusivo en la capa `repositories/`. Prohibido en componentes, actions, services o app.
- Usar el Driver Adapter `@prisma/adapter-pg` para estabilidad.
- Después de cualquier cambio en el schema, ejecutar `npx prisma generate`.
- Usar `npx prisma migrate dev --name <description>` para migraciones en desarrollo.
- **No ejecutar** `npm audit fix --force`: rompe Next.js y Prisma.

### Shadcn UI

- **Configuración canónica**: `components.json` define los aliases. El alias `utils` apunta a `@/features/shared/lib/shared-utils`.
- **Prohibido**: crear `src/lib/utils.js` o usar `@/lib/utils`. Todos los componentes shadcn importan `cn` desde `@/features/shared/lib/shared-utils`.
- Al añadir componentes con `npx shadcn add`, el CLI respeta el alias de `components.json` automáticamente.
- **DataTable**: Usar `@/components/shared/table/DataTable` (basado en TanStack Table). La paginación viene incluida vía `TablePagination` interno.

### UI

- Íconos: `lucide-react`.
- Notificaciones toast: `sonner`.
- Puerto: **3001**.

---

## 2. 🎯 Code Paradigms

### Límite estricto de líneas

- Máximo **250 líneas por archivo**. Si se excede, refactorizar inmediatamente.
- *Excepción*: Código de librería (Shadcn UI en `src/components/ui/`) no tiene límite.

### Lenguaje

- Solo **JS/JSX**. TypeScript está prohibido a menos que se solicite explícitamente.

### Estructura modular por Feature

#### `src/app/`
- Solo archivos de ruteo. **Prohibido**: lógica de negocio o UI compleja aquí.
- El page component solo debe: (1) verificar permisos con `checkPageAccess()`, (2) renderizar el container del feature.
- **Patrón page**: Extraer la lógica de fetch, searchParams y error handling a un Server Component container en `src/features/[feature]/components/` (ej: `UserPageContainer.jsx`).
- **EntityPageContainer**: Para features CRUD simples, usar el componente genérico `EntityPageContainer` (`src/components/shared/EntityPageContainer.jsx`) que maneja fetch, error, loading, PageHeader y Suspense automáticamente. Solo crear un `[Feature]PageContainer.jsx` manual si el feature necesita lógica custom (stats, dashboard, workspace con filtros avanzados).

#### `src/features/[feature]/`
- Único lugar para lógica de dominio. Capas: `components/`, `hooks/`, `actions/`, `services/`, `repositories/`, `mappers/`, `schemas/`, `config/`.
- **Barrel exports obligatorio**: Cada feature debe tener un `index.js` que re-exporte su API pública. Evita imports con rutas profundas y facilita refactors.
- **Regla de seguridad del barrel**: Solo exportar config, constantes, datos y utilidades puras. **Prohibido** exportar funciones server-only (`getSession`, `prisma`, `createProtectedAction`, `checkPageAccess`) a través del barrel. Estas deben importarse por ruta directa. Si un componente cliente importa del barrel y este re-exporta algo con `next/headers` o `prisma`, el build truena.

#### `src/components/`
- `ui/` (átomos shadcn), `shared/` (infraestructura/layout), `app-sidebar/` (sidebar).

#### Carpetas PROHIBIDAS en `src/`
- ❌ `src/lib/` — No existe. Utilidades en `src/features/shared/lib/`.
- ❌ `src/hooks/` — No existe. Hooks en `src/features/shared/hooks/`.
- Solo deben existir: `src/app/`, `src/components/`, `src/features/`.

---

## 3. 🧱 Architecture Layers (A-S-R-M)

### Actions (`actions/`)
- Orquestación de Next.js.
- Manejan validación **Zod**, revalidación de caché (`revalidatePath`) y gestión de sesión.
- Llaman **exclusivamente** a `services`.

### Services (`services/`)
- Lógica de dominio y negocio.
- Orquestan llamadas a uno o más `repositories`.
- **Prohibido**: usar API client o conocer URLs aquí.

### Repositories (`repositories/`)
- Acceso a datos.
- **Único lugar** donde se hacen queries de Prisma (read, write, update, delete).
- Llaman **exclusivamente** a `mappers`.
- Gracias a Prisma `@map` / `@@map`, todos los nombres de campos aquí son en **inglés**.

### Mappers (`mappers/`)
- Capa de transformación de datos **obligatoria**.
- Métodos obligatorios: `toDomain(entity)`, `toDomainList(entities)`, `toPersistence(domain)`, `toSortKey(domainKey)`.

### Segregación Read/Write (CQRS)
- Para mantener el límite de 250 líneas, separar archivos por intención:
  - `[feature].read.[layer].js`
  - `[feature].write.[layer].js`

### Convención de nombres (Inglés)
- Nombres de archivos, carpetas, variables, funciones y constantes en **INGLÉS**.
- Componentes UI en **PascalCase** (ej. `UserTable.jsx`).
- Hooks en **hyphen-case** (ej. `use-user-form.js`).

### Servicios de Integración Cross-Feature (`.integration.service.js`)
- Cuando un feature A necesita consumir lógica de otro feature B, se crea un archivo `[feature].integration.service.js` **en el feature dueño de la lógica** (B).
- El feature A importa **una sola función** de ese servicio — cero fugas de implementación.
- El servicio de integración expone una API limpia que oculta los detalles internos (repositories, mappers, PDF generation, etc.).
- **Siempre fire-and-forget**: el caller usa `.catch()` para no bloquear su operación principal.
- **Ejemplo**: `case-sheets/services/case-sheet.integration.service.js` → `attachPlanillaToEmail(caseId)` genera el PDF y devuelve el attachment listo para nodemailer. Lo consume `case.write.service.js`.

**Integration Services existentes (6):**

| Feature | Archivo | Función |
|---|---|---|
| `case-sheets/` | `case-sheet.integration.service.js` | `attachPlanillaToEmail(caseId)` — PDF + attachment |
| `case-stats/` | `case-stats.integration.service.js` | Estadísticas cross-feature |
| `cases/` | `case.integration.service.js` | Integración de casos con otros features |
| `persons/` | `saime.integration.service.js` | Integración con API SAIME |
| `tickets/` | `ticket.integration.service.js` | Integración de tickets/turnos |
| `users/` | `user.integration.service.js` | Integración de usuarios |

### Feature `procedures/` — Planillas de Requisitos
- CRUD de trámites + **generación de planillas PDF** de requisitos.
- **`procedures.sheet.service.js`** + **`procedures.sheet.action.js`** — generan PDF con lista de recaudos.
- Similar a `case-sheets/` en patrón: `jspdf` server-side, sin página propia para la generación.

### Features sin Página Propia
- **`case-sheets/`**: Sin página. Se accede desde columna acciones en tabla de casos y toolbar en detalle de caso. API route: `GET /api/case-sheets?caseId=X`.
- **`notifications/`**: Sin página. Componente `NotificationBell` en el header + SSE/polling.
- **`tickets/`**: Página de display público (`/turnos`), pero sin página admin de catálogo.
- Estas features NO necesitan `PageContainer`, `TableView`, ni entrada en sidebar. Solo necesitan integration services, actions y API routes.

### Row-Level Security — `buildScopeFilter()`
- En `cases/lib/filter-helpers.js`, `buildScopeFilter(scope)` implementa **filtrado jerárquico de datos**:
  - `"all"` — admin ve todo.
  - `"scoped"` — usuario ve sus casos + casos de supervisados + forwards a su unidad/dirección.
  - `"none"` — sin acceso.
- Usado en `cases/`, `operator-workspace/`, y `case-stats/` para limitar visibilidad según rol.

### Policy Services
- `case-policy.service.js` y `workspace-policy.service.js` encapsulan **reglas de negocio** para visibilidad y acciones permitidas según rol.
- Separar políticas de la lógica CRUD para mantener services enfocados.

### Feature `case-sheets/` — Planillas PDF por Caso
- **Sin página propia**. Se accede desde: (1) columna acciones en tabla de casos, (2) toolbar en detalle de caso.
- **2 formatos de plantilla** según `attentionTypeId`: `sheet-generic` (1,2,3,4,6 — Asesoría, Sugerencia, Queja, Reclamo, Petición), `sheet-denuncia` (5).
- Mediación SAPI (id=23) **descartada** — modelo `Mediation` no se implementa.
- **Generación**: on-demand (caso individual vía API route `GET /api/case-sheets?caseId=X`) + batch (vía `generateBatchSheetsAction`, ZIP de PDFs).
- **Auto-attach en email**: al crear un caso con `attentionType.sendEmail = true`, se adjunta la planilla PDF automáticamente vía `case-sheet.integration.service.js`.
- **Librería PDF**: `jspdf` server-side. Cintillo SAIME en `public/img/cintillo.jpg`.
- **Permiso**: `case_sheets:generate`.
- Los templates deben mantener consistencia visual entre sí: mismos helpers (`sectionHeader`, `underlinedField`, `drawCheckbox`), mismas dimensiones de campos (NOMBRES 130mm + CÉDULA 60mm, municipio/parroquia/teléfono en tercios), mismas firmas (FECHA + FIRMA DEL SOLICITANTE centradas con líneas).

### Select Actions — Filtros por Entidad Padre (Obligatorio)

Toda `[feature].select.action.js` debe exponer parámetros opcionales de filtro por la FK padre, para permitir dropdowns encadenados (ej: área → motivo, estado → municipio).

**Patrón estándar:**

```js
// Acción — acepta parentId opcional
export async function getXxxForSelectAction({ searchTerm, parentId } = {}) {
  const result = await xxxReadRepository.findMany({
    searchTerm: searchTerm || "",
    parentId: parentId || undefined,   // ← opcional, sin romper backward compat
    // ...
  });
  return result.items.map(item => ({ label: item.name, value: item.id }));
}
```

```js
// Repositorio — filtra solo si se pasa el parámetro
const where = {
  ...(searchTerm && { name: { contains: searchTerm, mode: "insensitive" } }),
  ...(parentId && { parentFk: Number(parentId) }),  // ← filtro condicional
  deletedAt: null,
};
```

- **Parámetro siempre opcional**: si no se pasa, carga todos (compatible hacia atrás).
- **Nombre del parámetro**: usar el nombre de la FK en camelCase tal cual está en el schema Prisma (ej: `caseAreaId`, `stateId`, `municipalityId`).
- **JSDoc obligatorio**: documentar `@param {number} [options.parentId]` en cada acción.

**Jerarquías cubiertas:**

| Acción | Parámetro padre |
|---|---|
| `getStatesForSelectAction` | `countryId` |
| `getMunicipalitiesForSelectAction` | `stateId` |
| `getParishesForSelectAction` | `municipalityId` |
| `getOfficesForSelectAction` | `stateId` |
| `getReasonsForSelectAction` | `caseAreaId` |
| `getAttentionTypeDetailsForSelectAction` | `attentionTypeId` |
| `getUnitsForSelectAction` | `directionId` |

> **Nota**: `getCaseOperatorsForSelectAction` es el **único** select action que usa `createProtectedFunction` (requiere permiso `cases:view` + filtro de jerarquía). Todos los demás usan `createAuthenticatedFunction` (sin permiso RBAC, solo sesión + CSRF).

---

## 4. 🧱 Database

### Queries seguras
- **Prohibido**: usar strings concatenadas en queries. Solo se permite la API tipada de Prisma.

### Prisma Schema: Puente Inglés/Español vía `@map` / `@@map`
- Todos los modelos y campos en **inglés** en el schema.
- Usar `@map("nombre_columna")` y `@@map("nombre_tabla")` para la DB en español.

### Convención de Timestamps
- Todo modelo debe incluir:
  - `createdAt DateTime? @default(now()) @map("creado_en") @db.Timestamptz(6)`
  - `updatedAt DateTime? @updatedAt @map("actualizado_en") @db.Timestamptz(6)`
  - `deletedAt DateTime? @map("eliminado_en") @db.Timestamptz(6)` (soft delete obligatorio)

### Sistema de Seeds (Runner-based)
- Los seeds NO residen en `prisma/seed.js`. Usan el sistema runner-based en `prisma/seeds/`:
  - `_runner.js` — framework con registro en modelo `Seeder` (tracking de seeds ejecutados).
  - Archivos `.seed.js` con timestamp: `[YYYYMMDDHHMMSS]_[nombre].seed.js`.
  - Cada `.seed.js` exporta: `{ name: string, run(prisma, log): Promise }`.
- **Comandos**:
  - `pnpm db seed` — ejecuta seeds pendientes.
  - `--only=<nombre>` — ejecuta un solo seeder.
  - `--force` — ignora registro, re-ejecuta todo.
  - `--clean` — borra BD y ejecuta todo.
  - `--list` — lista seeders ya ejecutados.
  - `--reset` — reinicia registro.
  - `--mark-seeded` — marca como ejecutados sin correr (útil en prod).
  - `make <nombre>` — crea nuevo `.seed.js` + `.json`.
- **Idempotencia**: Usar `upsert` con `where` único en cada seeder.
- **Permisos**: Agregar los 4 permisos del módulo (`:read`, `:create`, `:update`, `:delete`) en un seeder de permisos y asignarlos al rol ADMIN.

---

## 5. 🖼️ UI Conventions

### UI Config-Driven (Obligatorio)
- **Prohibido**: strings hardcodeados (texto en español) directamente en componentes.
- Todos los labels, placeholders, tooltips y mensajes deben residir en `[feature].constants.js`.

### Formularios
- Stack: `react-hook-form` + `zod` + `[feature].form.config.js`.
- **Campos de formulario**: Cada tipo de campo es un componente dedicado en `src/components/shared/form/`:
  - `CustomFormField` — input básico (`type="text"|"email"|"number"`).
  - `CustomFormTextarea` — texto largo.
  - `CustomFormSelect` — select estático (opciones fijas).
  - `CustomFormSwitch` — toggle booleano.
  - `CustomFormCheckbox` — checkbox único.
  - `CustomFormCheckboxGroup` — grupo de checkboxes.
  - `AsyncSelect` — select asíncrono con búsqueda (para FK). Props clave: `fetcher`, `fetchOnOpen`, `parentValue`, `initialData`, `getLabel`, `getValue`.
  - `AsyncMultiSelect` — multi-select asíncrono con búsqueda (para M2M). Props: `fetcher`, `minSearchLength`, `allowEmptyQuery`.
  - `CustomMultiSelect` — multi-select con opciones estáticas.
  - `FileUpload` — upload de archivos con drag & drop.
  - `SchemaRequirements` — muestra requisitos de esquema Zod visualmente.
- **Prohibido**: usar un solo `CustomFormField` monolítico con `component: "asyncSelect"`. Cada tipo tiene su propio componente.

### Tablas
- Usar `createActionsColumn` + `DataTable` genérico.

### Toolbar
- Usar el componente compuesto `<Toolbar>` de `@/components/shared/Toolbar`.

### SlideOver — Panel de Detalle Rápido
- **Componente:** `src/components/shared/SlideOver.jsx`
- Panel deslizable derecho genérico para detalles/acciones rápidas.
- Props: `open`, `onClose`, `title`, `isLoading`, `isEmpty`, `emptyMessage`, `children`, `footer`.
- Maneja 3 estados automáticamente: loading (spinner), empty (mensaje), content (children).
- Usado en `cases/` para detalle rápido de caso.

### InfoItem — Key-Value con Ícono
- **Componente:** `src/components/shared/InfoItem.jsx`
- Muestra un ícono + label + valor. Usado en slide-overs y páginas de detalle.
- Props: `icon` (Lucide), `label`, `value`, `className`.

### StatCard — Tarjeta KPI
- **Componente:** `src/components/shared/StatCard.jsx`
- Tarjeta de estadística con ícono, título, valor numérico y subtítulo opcional.
- Variantes de color: `default`, `open` (ámbar), `closed` (esmeralda).
- Usado en `dashboard/`, `case-stats/`, `regional-stats/`.

### StatsRowTable — Tabla de Estadísticas
- **Componente:** `src/components/shared/StatsRowTable.jsx`
- Tabla reutilizable para estadísticas por categoría (abiertos/cerrados/total).
- Soporta columnas de "reenviados/no reenviados".
- Usado en `case-stats/` y `regional-stats/`.

### PageHeader — Encabezado de Página (Obligatorio)

Todo `*PageContainer.jsx` **debe** usar el componente compartido `<PageHeader>` como encabezado en lugar de `<h1>` + `<p>` manual.

**Componente:** `src/components/shared/PageHeader.jsx`  
**Configuración de imagen:** `SITE_CONFIG.PAGE_HEADER` en `src/features/shared/config/app/site.config.js`

```jsx
import { PageHeader } from "@/components/shared/PageHeader";

// En el return del container:
<PageHeader
  title={FEATURE_CONFIG.TITLE}
  subtitle={LABELS.DESCRIPTION}
  showNav={false}
/>
```

**Reglas:**
- `showNav={false}` en páginas admin (los botones back/forward son para páginas públicas como tomar turno).
- La imagen por defecto es `SITE_CONFIG.PAGE_HEADER.imageSrc` (`/img/saime_logo.png`). Para páginas sin imagen usar `imageSrc={null}`.
- Para páginas de detalle (ej: `CaseDetailPageContainer`) que ya tienen breadcrumb con back-link, **no** usar `PageHeader` — mantener su header específico.
- El `PageHeader` es `"use client"` (por `window.history`). Esto no afecta el container que es Server Component — Next.js hidrata el client component dentro del RSC sin problema.

---

## 6. 🛡️ Security & Authentication (PRIORIDAD MÁXIMA)

### 🔑 JWT y Secrets

- `JWT_SECRET` **debe** tener mínimo **32 caracteres**. Sin fallback. Si no existe o es corto, el sistema debe lanzar error fatal.
- **Prohibido**: valores por defecto, hardcodeados o `fallback` en secrets.
- **Prohibido**: commits con secrets. Usar `.env` (ya en `.gitignore`).

### 🔐 Sesión (Jose)

- Almacenada en cookies **HTTP-only**, **Secure** (en producción), **SameSite=Lax**, **Path=/**.
- **Payload mínimo**: `id, role`. No incluir datos innecesarios.
- **Expiración obligatoria**: **8 horas**.
- **Logout**: debe eliminar la cookie del lado del servidor.
- **Prohibido**: almacenar tokens o sesiones en `localStorage`, `sessionStorage`, o cookies accesibles por JS.

### 🔒 Autenticación

- **bcrypt** con mínimo **10 rondas de salt** para hashing de contraseñas.
- **Mismo mensaje de error** para credenciales inválidas, usuario inexistente, o cuenta inactiva. **Nunca** revelar si el usuario existe.

### ⏱️ Rate Limiting

- **Obligatorio** en endpoints de login: mínimo **5 intentos por IP en 15 minutos**.
- Usar la factory genérica `createRateLimiter()` de `@/features/shared/lib/rate-limiter`.
- **Patrón por feature**:
  1. Definir config en `[feature].constants.js` → `RATE_LIMIT: { MAX_ATTEMPTS, WINDOW_MS, HEADERS: { CLIENT_IP, REAL_IP } }`
  2. Crear instancia en `[feature]/lib/rate-limiter.js` con `createRateLimiter({ maxAttempts, windowMs, name })`
  3. Usar `limiter.checkLimit(ip)` en el action ANTES de cualquier lógica de negocio
- **Prohibido**: usar `express-rate-limit` (es para Express, no Next.js).
- **No reinventar**: la factory ya maneja algoritmo, limpieza, stats y reset.

### 🛂 Control de Acceso (RBAC)

- **Toda** Server Action debe usar una de las tres fábricas de seguridad:
  - `createProtectedAction(permission, schema, handler)` — Para formularios (create/update). Valida CSRF + sesión + permiso RBAC + Zod.
  - `createProtectedFunction(permission, handler)` — Para acciones con datos sensibles (delete, read detalle con PII). Valida CSRF + sesión + permiso RBAC.
  - `createAuthenticatedFunction(handler)` — **Solo para catálogos públicos de solo lectura** usados en dropdowns (estados, municipios, tipos de atención, etc.). Valida CSRF + sesión. **Sin permiso RBAC**. Prohibido para datos con PII u operaciones de escritura.
- **Toda** página RSC debe usar `checkPageAccess(requiredSlug)`.
- **Cliente**: usar `usePermission().can(slug)` solo para ocultar UI. **Nunca** como única verificación.
- **Prohibido**: mensajes de error que filtren slugs de permisos o detalles internos.

### ✅ Validación (Zod)

- **Obligatoria** en cada entrada de datos (formularios, APIs, params).
- **Whitelist**, no blacklist: definir exactamente qué se acepta, no qué se rechaza.
- Schemas mínimos: email con formato, strings con límites de longitud, números con rangos.

### 🧹 Sanitización y XSS

- **Prohibido**: `dangerouslySetInnerHTML`.
- **Excepción**: `src/components/ui/chart.jsx` — código de librería shadcn UI, necesario para inyectar CSS de gráficos. No modificar.
- **Prohibido**: renderizar datos crudos de usuario sin sanitizar.
- Todo output en JSX debe ser escapado por React (no usar `@html` ni similares).

### 🗄️ Base de Datos

- **Prohibido**: SQL crudo o strings concatenadas. Solo API tipada de Prisma.
- **Soft delete obligatorio**: nunca `DELETE` físico en modelos de negocio. Usar `deletedAt`.
  - Aplica a: usuarios, roles, catálogos, y cualquier entidad referenciada por FK.
  - Excepción: tablas pivote M2M (se gestionan con connect/disconnect, no tienen delete propio).
- **Timestamps de auditoría**: `createdAt`, `updatedAt` en todos los modelos.

### 🔍 Logging Seguro

- **Prohibido**: loguear PII (cédulas completas, JWT, cookies, contraseñas).
- Solo IDs, hashes, o datos anonimizados.
- Usar `logger` centralizado (`@/features/shared/lib/logger`), nunca `console.log`.

### 🌐 Headers de Seguridad

- **CSP**: Content-Security-Policy configurado en `proxy.js` o `next.config.mjs`.
- **HSTS**: Strict-Transport-Security en producción.
- **X-Content-Type-Options**: nosniff.
- **X-Frame-Options**: DENY.

### 🛡️ DevToolsGuard — Bloqueo de DevTools en Producción

- **Componente:** `src/components/shared/DevToolsGuard.jsx`
- Bloquea F12, Ctrl+Shift+I/J/C, Ctrl+U, menú contextual y detección de DevTools dockeados.
- **Control:** `NEXT_PUBLIC_DISABLE_DEVTOOLS=true` en `.env`.
- Usar `<DevToolsGuard />` en el layout raíz para producción.

### 📦 Dependencias

- **Prohibido**: `npm audit fix --force` (rompe Next.js/Prisma).
- Ejecutar `npm audit` regularmente. Vulnerabilidades moderadas en dependencias de build son aceptables.
- Mantener dependencias actualizadas (Dependabot o similar).

### 🏷️ Environment Variables

- **Prohibido**: valores por defecto para secrets en código.
- `.env.example` debe documentar todas las variables requeridas sin valores reales.
- `.env` **nunca** se commitea (verificar `.gitignore`).

---

## 7. 📝 Communication

### Código
- Nombres de variables, funciones y **comentarios en INGLÉS**.

### Interacción
- Explicaciones y respuestas al usuario en **ESPAÑOL**.

---

## 8. 🧭 Navegación y Rutas

### Sidebar (Configuración Unificada)
- La configuración de navegación reside en `src/features/shared/config/navigation/` con 3 archivos:
  - `routes.config.js` — objeto `ROUTES` con paths, permisos y títulos.
  - `sidebar.config.js` — `SIDEBAR_CONFIG` con `UI.LABELS` y `NAV.items` (estructura de navegación con íconos, rutas y permisos).
  - `navigation.config.js` — **barrel** que re-exporta `ROUTES` y `SIDEBAR_CONFIG` desde los dos anteriores.
- El componente `SidebarNav` consume `SIDEBAR_CONFIG.NAV.items` para renderizar la navegación filtrando por permisos.
- **Los consumidores externos** (`proxy.js`, `robots.js`, `sitemap.js`, `shared/index.js`) importan desde `navigation.config.js` sin cambios.

### Rutas Centralizadas
- `routes.config.js` centraliza todas las rutas del panel admin en el objeto `ROUTES`.
- Cada feature exporta su `PATH`, `TITLE` y `PERMISSIONS` desde su `[feature].constants.js`.
- `routes.config.js` importa esos datos y los ensambla en `ROUTES`.
- **Secciones de `ROUTES`**:
  - `AUTH` — login.
  - `DASHBOARD` — dashboard principal.
  - `CASE_STATS`, `REGIONAL_STATS` — analíticas.
  - `PROCESSES` — workspace, cases, persons, tickets, procedures, map.
  - `ADMIN` — users, roles, permissions.
  - `AUDIT`, `SENT_EMAILS` — auditoría.
  - `ORG_CHART` — organigrama.
  - `SAIME_CONSULTATION` — consultas SAIME.
  - `CATALOGS` — 14 catálogos (case-statuses, call-statuses, countries, attention-channels, attached-entities, popular-organizations, offices, beneficiary-types, case-areas, reasons, attention-types, attention-type-details, administrative-directions, states).
  - `API.PUBLIC` — rutas de API públicas (ej: `/api/tickets/events`).

### Auto-Registro de Módulos (Pattern)
- Al crear un nuevo feature, debes:
  1. Agregar su ruta en `routes.config.js` → `ROUTES` (en la sección que corresponda: `PROCESSES`, `ADMIN`, `CATALOGS`, etc.).
  2. Agregar su nav item en `sidebar.config.js` → `SIDEBAR_CONFIG.NAV.items` (una entrada con ícono, ruta y permiso, en el grupo correspondiente).
  3. Crear la page en `src/app/(root)/admin/[feature]/page.jsx` (thin page → delega al container).
  4. Para features CRUD simples, el container usa `EntityPageContainer`. Solo crear `[Feature]PageContainer.jsx` manual si el feature tiene lógica custom.

### proxy.js (Next.js 16+)
- El archivo `proxy.js` reemplaza al deprecado `middleware.js` en Next.js 16+.
- Debe residir en `src/proxy.js` (no en la raíz del proyecto).
- Exporta una función `proxy(request)` y opcionalmente un `config.matcher`.
- Maneja protección de rutas, redirección login/dashboard, y headers de seguridad.

---

## 9. ⚡ Performance

### React.cache() para Sesión
- `getSession()` en `src/features/auth/lib/auth.js` debe usar `React.cache()` para deduplicar llamadas dentro del mismo request.
- Esto evita que layouts anidados (`app/layout.js` + `(root)/layout.jsx`) hagan múltiples lecturas de cookie.

### Server Components por defecto
- Solo añadir `"use client"` cuando sea estrictamente necesario (hooks, eventos, estado).
- Las páginas RSC hacen el fetch inicial y pasan datos como props a client components.

### SSE (Server-Sent Events) — Proveedor Compartido
- **Componente:** `src/components/shared/providers/sse-provider.jsx`
- Una sola conexión `EventSource` a `/api/events/stream` compartida por toda la pestaña.
- **Patrón pub/sub**: `subscribe(eventType, callback)` → `unsubscribe()`.
- **Hook**: `useSseSubscription(eventType, callback, { enabled })`.
- Lo usan: `dashboard/`, `case-stats/`, `regional-stats/`, `operator-workspace/`, `tickets/`, `notifications/`.
- **API routes SSE**: `/api/events/stream` (autenticada) y `/api/tickets/events` (pública para display).

### API Routes
- Las API routes residen en `src/app/api/`.
- **Endpoints existentes**:
  - `/api/case-sheets` — GET con `?caseId=X` para PDF de planilla individual.
  - `/api/case-stats` — endpoints de estadísticas.
  - `/api/cases/[caseId]` — GET/PATCH por ID de caso.
  - `/api/events/stream` — SSE stream (requiere sesión).
  - `/api/notifications` — API de notificaciones.
  - `/api/procedures` — API de trámites.
  - `/api/reasons` — API de motivos.
  - `/api/tickets/events` — SSE pública para display de turnos (definida en `ROUTES.API.PUBLIC`).

---

## 10. 🗂️ shared/config/ — Convención de Agrupación

`src/features/shared/config/` está organizado por dominio:

```
config/
├── app/          # site.config.js, theme.config.js, animations.config.js
├── navigation/   # navigation.config.js (rutas + sidebar unificados)
├── pages/        # dashboard.constants.js
└── shared.constants.js
```

- Al añadir nuevos archivos de config, seguir esta agrupación.
- `shared.constants.js` permanece en la raíz de `config/` por ser transversal.
