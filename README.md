# Admin Starter

Panel de administración genérico con autenticación, gestión de usuarios, roles y permisos.

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 16.2 (App Router) |
| **UI** | React 19 + Tailwind CSS 4 |
| **Componentes** | shadcn/ui (Radix) |
| **ORM** | Prisma 7.5 |
| **Base de Datos** | PostgreSQL |
| **Auth** | JWT (jose) + bcrypt |
| **Validación** | Zod + react-hook-form |
| **Notificaciones** | sonner |
| **Íconos** | lucide-react |

## 🚀 Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd admin-starter
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

Variables requeridas:
- `DATABASE_URL` — Conexión PostgreSQL
- `JWT_SECRET` — Clave secreta para tokens (mín 32 chars)

### 3. Base de Datos

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm seed          # o: pnpm prisma db seed
```

El seed puebla 5 fases: catálogos base, geografía, personas, auth (roles/permisos/admin) y casos de ejemplo. Cada fase puede ejecutarse por separado si solo necesitas resembrar una parte:

```bash
node prisma/seeds/seed-catalogs.js   # Solo catálogos
node prisma/seeds/seed-geography.js  # Solo geografía
node prisma/seeds/seed-persons.js    # Solo personas
node prisma/seeds/seed-auth.js       # Solo auth
node prisma/seeds/seed-cases.js      # Solo casos (requiere auth previo)
```

### 4. Iniciar

```bash
pnpm dev
# Abre http://localhost:3001
```

### Credenciales por defecto

| Campo | Valor |
|-------|-------|
| **Email** | admin@admin.starter |
| **Password** | admin123 |

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Rutas Next.js (solo ruteo)
│   ├── login/              # Página de login
│   └── (root)/             # Dashboard protegido
│       └── admin/          # Panel de administración
│           ├── usuarios/   # CRUD de Usuarios
│           └── roles/      # CRUD de Roles y Permisos
├── features/
│   ├── auth/               # Autenticación (login, sesión, JWT)
│   ├── users/              # Gestión de Usuarios (CRUD)
│   ├── roles/              # Gestión de Roles (CRUD)
│   ├── permissions/        # Control de acceso RBAC
│   └── shared/             # Infraestructura compartida
│       ├── lib/            # Prisma, safe-action, logger
│       ├── config/         # Rutas, site, constantes
│       └── hooks/          # Hooks genéricos
└── components/
    ├── ui/                 # Átomos shadcn/ui
    └── shared/             # DataTable, Toolbar, Providers
```

## 🏗️ Arquitectura A-S-R-M

Cada feature sigue el patrón de capas:

| Capa | Responsabilidad |
|------|----------------|
| **Actions** | Orquestación Next.js, validación Zod, sesión |
| **Services** | Lógica de dominio y negocio |
| **Repositories** | Acceso a datos (único lugar con Prisma) |
| **Mappers** | Transformación de datos |

## 🔐 Modelo de Seguridad

- **JWT** en cookies HTTP-only (8h expiración)
- **RBAC**: Roles → Permisos
- **Server Actions** protegidas con `createProtectedAction`
- **Middleware** de protección de rutas

## � Despliegue en Producción

### Prerrequisitos

- Node.js 20+
- PostgreSQL 15+
- pnpm
- PM2 (instalado globalmente: `pnpm add -g pm2`)

### 1. Variables de Entorno del Sistema

**En producción NUNCA debes usar archivos `.env`.** Los secrets deben venir de variables del sistema operativo o un secret manager.

**Opción A — `/etc/environment` (recomendado para VPS):**
```bash
sudo nano /etc/environment
```
```ini
# Agregar al final del archivo:
NODE_ENV="production"
JWT_SECRET="<generado con: openssl rand -base64 32>"
DATABASE_URL="postgresql://usuario:password@localhost:5432/siac_saime"
```
```bash
# Recargar sin reiniciar
source /etc/environment
```

**Opción B — Perfil de usuario (`~/.bashrc` o `~/.zshrc`):**
```bash
export NODE_ENV=production
export JWT_SECRET="<openssl rand -base64 32>"
export DATABASE_URL="postgresql://..."
```

**Opción C — Secret Manager (cloud):**
- AWS Secrets Manager / Parameter Store
- HashiCorp Vault
- Doppler / Infisical

> ⚠️  **NUNCA** escribas secrets en `ecosystem.config.js`, `.env`, o cualquier archivo que se commitee a git.

### 2. Build y Deploy

```bash
# Instalar dependencias de producción
pnpm install --prod

# Generar cliente de Prisma
pnpm prisma generate

# Ejecutar migraciones pendientes
pnpm prisma migrate deploy

# Build de Next.js
pnpm build

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # Auto-inicio al reiniciar el servidor
```

### 3. Verificar el despliegue

```bash
pm2 status
pm2 logs admin-starter
curl http://localhost:3001
```

El sistema estará disponible en `http://<ip-del-servidor>:3001`.

Para producción real, coloca un reverse proxy (Nginx, Caddy) con HTTPS delante.

## 🌱 Sistema de Seeds

El seed se organiza en módulos independientes dentro de `prisma/seeds/`:

```
prisma/seeds/
├── index.js              # Orquestador principal (5 fases)
├── seed-catalogs.js      # 14 catálogos base (países, estatus, canales…)
├── seed-geography.js     # Geografía venezolana (26 estados, 336 municipios, 1135 parroquias)
├── seed-persons.js       # Personas (terceros + personas de caso)
├── seed-auth.js          # Roles, 71 permisos, usuario admin
├── seed-cases.js         # Casos de ejemplo con entidades relacionadas
├── lib/                  # Logger y cliente Prisma compartidos
└── data/                 # Constantes de auth (ROLES, PERMISSIONS, ADMIN_USER)
```

Los datos viven en `prisma/seed-data/` — **28 archivos JSON individuales**, uno por entidad. Nada está hardcodeado en el código.

### Convención de casing en catálogos
- **Title Case**: statuses, channels, areas, types, reasons, países, geografía
- **UPPERCASE**: entes adscritos, direcciones administrativas (nombres institucionales)
- **Mixto (códigos)**: oficinas ("OF016 - Guasdualito")

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|------------|
| `pnpm dev` | Servidor de desarrollo (puerto 3001) |
| `pnpm build` | Build de producción |
| `pnpm start` | Iniciar build de producción (puerto 3001) |
| `pnpm lint` | Ejecutar ESLint |
| `pnpm test` | Ejecutar tests (40 tests, 4 suites) |
| `pnpm test:watch` | Tests en modo watch (desarrollo) |
| `pnpm seed` | Sembrar base de datos (28 archivos JSON, 5 fases) |

## 🧪 Testing

### Stack

- **Vitest** — Test runner rápido con API compatible con Jest
- **@testing-library/react** — Tests de componentes React
- **@testing-library/jest-dom** — Matchers adicionales (toBeInTheDocument, etc.)
- **jsdom** — Simula el DOM en Node.js

### Configuración

```bash
vitest.config.js       # Configuración de Vitest + path aliases
src/__tests__/setup.js # Setup global (jest-dom matchers)
```

### Suites de Tests

| Suite | Tests | Qué cubre |
|-------|-------|-----------|
| `rate-limiter.test.js` | 7 | Rate limiting — límites, ventanas, reset, IPs independientes |
| `auth.mapper.test.js` | 12 | Mapper de autenticación — toDomain, toDomainList, toSortKey |
| `permission.mapper.test.js` | 13 | Mapper de permisos — toDomain, toPersistence, toSortKey |
| `safe-action.test.js` | 8 | Core de seguridad — CSRF, sesión, permisos, validación Zod |

### Ejecutar

```bash
pnpm test              # Todos los tests (40 tests)
pnpm test:watch        # Modo watch (re-ejecuta al guardar)
pnpm test -- --reporter=verbose  # Salida detallada
```

### Convenciones

- Archivos: `src/__tests__/**/*.test.js`
- Tests de lógica pura (mappers, rate limiter) — sin dependencias externas
- Tests de Server Actions — con mocks de sesión, permisos y CSRF
- Sin tests de integración con BD (requiere PostgreSQL, se agrega con CI/CD)
