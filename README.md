# Caimanera

Plataforma hiperlocal para descubrir partidos y canchas cerca de ti. Los jugadores eligen una ubicación, ven los partidos ordenados por distancia y se inscriben en segundos. El panel administrativo permite gestionar canchas, partidos, inscripciones y pases.

> Estado detallado, decisiones y siguiente bloque de trabajo: [`ESTADO_PROYECTO.md`](./ESTADO_PROYECTO.md).

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| ORM | Prisma 7 + PostgreSQL |
| Auth | JWT (`jose`) + bcrypt |
| Validación | Zod + react-hook-form |
| Mapas | Leaflet + react-leaflet |
| Geolocalización | Nominatim + `geolib` |
| Fechas | date-fns + date-fns-tz (`America/Caracas`) |
| Notificaciones | sonner |
| Pagos | BDT, pago móvil, Binance y tarjeta (transacciones `PENDING`) |

## Requisitos

- Node.js 20.19+
- pnpm
- PostgreSQL 15+

## Instalación

```bash
pnpm install
cp .env.example .env
# Edita DATABASE_URL y JWT_SECRET
pnpm prisma generate
pnpm prisma migrate deploy
pnpm seed
pnpm dev
```

La app queda en `http://localhost:4000`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión PostgreSQL |
| `JWT_SECRET` | Clave de firma (mínimo 32 caracteres) |
| `COOKIE_SECURE` | `false` en desarrollo local sin HTTPS |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt del admin inicial (solo seed) |
| `SMTP_*` | Envío de credenciales por correo (opcional) |
| `NEXT_PUBLIC_SITE_URL` | URL pública de la app para sitemap y enlaces |
| `NEXT_PUBLIC_LANDING_URL` | URL de la landing (otro dominio) para legales y redirects |
| `NEXT_PUBLIC_VES_RATE` | Tasa USD → VES para mostrar el total en bolívares (opcional) |

## Rutas principales

### App pública (sin sesión)

- `/` — Inicio público: bienvenida, ubicación, accesos y mosaico de canchas.
- `/login` — Acceso a la cuenta con pantalla adaptada a móvil.
- `/partidos`, `/partidos/[id]`, `/canchas` y `/canchas/[id]` requieren sesión; si un visitante entra, se le pide iniciar sesión y se le devuelve a la ruta solicitada.

Los textos legales viven en la landing (`NEXT_PUBLIC_LANDING_URL`). Las URLs antiguas `/terminos` y `/privacidad` redirigen allí, o a `/` si la variable no está configurada.

### App del jugador (sesión)

- `/` — Inicio personalizado del jugador. Un visitante anónimo ve el inicio público; el staff va a `/admin`.
- `/partidos` y `/partidos/[id]` — Búsqueda, detalle e inscripción.
- `/canchas` y `/canchas/[id]` — Listado y detalle de canchas.
- `/mis-partidos` — Agenda e historial del jugador.
- `/cuenta` — Hub de cuenta: pase, pagos y perfil.
- `/cuenta/pases` — Pase activo, compra/renovación e historial de pases.
- `/cuenta/pagos` — Historial de pagos de partidos y pases.

### Panel administrativo (sesión + permisos)

- `/admin` — Panel de control.
- `/admin/partidos` — Gestión de partidos.
- `/admin/canchas` — Gestión de canchas y fotos.
- `/admin/participantes` — Inscripciones.
- `/admin/suscripciones` — Catálogo de planes y pases.
- `/admin/pagos` — Transacciones y confirmación de pagos pendientes.
- `/admin/users`, `/admin/roles`, `/admin/permissions` — Administración.
- `/admin/perfil` — Cuenta y cambio de contraseña del staff.

## Usuarios demo

| Rol | Correo | Contraseña |
|-----|--------|------------|
| ADMIN | `admin@caimanera.app` | `admin123` |
| PLAYER | `carlos.perez@caimanera.app` | `caimanera123` |
| PLAYER | `maria.rodriguez@caimanera.app` | `caimanera123` |
| PLAYER | `luis.gomez@caimanera.app` | `caimanera123` |
| COURT_MANAGER | `ana.torres@caimanera.app` | `caimanera123` |
| COURT_MANAGER | `pedro.rivas@caimanera.app` | `caimanera123` |

Los jugadores y encargados vienen de `prisma/seeds/20260915095000_caimanera-demo-users.seed.js`. El admin viene del seed de auth y su contraseña se configura con `ADMIN_PASSWORD_HASH` o `ADMIN_DEFAULT_PASSWORD`.

> Cambia estas credenciales antes de exponer el sistema a Internet.

## Panel público móvil

La experiencia pública se organiza en dos etapas:

1. **Inicio público:** módulo de bienvenida con saludo y selector de ubicación integrado, tarjeta con tres accesos directos (buscar partido, canchas y mapa) y un mosaico de canchas cercanas. Se ve sin iniciar sesión; los accesos y las canchas piden login y devuelven al jugador a la ruta solicitada.
2. **Elegir partido (sesión):** módulo superior con selector de ubicación y deportes, panel de filtros, chips de filtros activos, contador de resultados y vista de lista o mapa. Las tarjetas reutilizan el lenguaje visual de los módulos del inicio.

Al tocar un partido se abre un **preview** con horario, cancha, cupos y precio. Desde ahí:

- Se confirma la participación y se elige un método de pago: **BDT**, pago móvil/transferencia, Binance o tarjeta.
- Los pagos externos crean una transacción en estado `PENDING`; la inscripción queda reservada hasta la conciliación.
- Los jugadores con pase activo pueden usar un crédito sin pasar por la pasarela.
- El staff con permiso `participants:create` puede confirmar sin pago.
- El checkout también se puede abrir directo con `/?partido=<id>`.

### Pases y pagos del jugador

- `/cuenta` es el hub: muestra el pase activo y enlaza a pases, pagos y perfil.
- `/cuenta/pases` permite consultar pases activos, comprar o renovar un plan y revisar el historial.
- La compra crea una transacción `SUBSCRIPTION_PURCHASE` en estado `PENDING`; al confirmarla el admin, se activa o renueva el pase.
- `/cuenta/pagos` muestra el historial de pagos de partidos y pases con método, estado y referencia.
- `/admin/pagos` lista las transacciones y permite confirmar los pagos pendientes.

- El selector de ubicación acepta la ubicación actual del navegador, búsqueda de direcciones (Nominatim) y zonas/canchas sugeridas.
- La última ubicación y las recientes se guardan en `localStorage`.
- Las distancias y el orden por cercanía usan `geolib`.
- El mapa usa OpenStreetMap y agrupa los partidos por cancha.
- El tema oscuro es el predeterminado en toda la aplicación.

## Login móvil

`/login` tiene un shell propio, sin header ni footer público:

- En móvil: barra superior con volver y marca, logo destacado, formulario en tarjeta redondeada y CTA a ancho completo.
- Campos de 48 px, íconos, mostrar/ocultar contraseña, estado de carga y error de credenciales integrado.
- Safe areas (`env(safe-area-inset-*)`) y `min-h-dvh` para navegadores móviles.
- En tablet se mantiene una sola columna; desde `lg` aparece el panel de marca con beneficios junto al formulario.
- Redirección por rol: staff → `/admin`; jugadores → `/`.
- Se respeta `?next=` con validación de rutas internas.

## Arquitectura

Cada feature sigue el patrón A-S-R-M:

```
src/features/[feature]/
├── actions/       # Server Actions protegidas (sesión + permisos + Zod)
├── components/    # UI
├── config/        # Constantes, labels y columnas
├── hooks/         # Estado de cliente
├── mappers/       # Prisma ↔ Dominio
├── repositories/  # Único lugar con Prisma
├── schemas/       # Zod
└── services/      # Reglas de negocio
```

Reglas clave:

- La UI pública no expone datos personales de los jugadores.
- Las mutaciones pasan por `createProtectedAction` / `createProtectedFunction`.
- El registro de inscripciones es transaccional (cupos, lista de espera y créditos de pase).
- Las fechas se persisten en UTC y se muestran en `America/Caracas`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo (4000) |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción (4000) |
| `pnpm lint` | ESLint |
| `pnpm test` | Tests (Vitest) |
| `pnpm seed` | Ejecuta seeders pendientes |
| `node prisma/seed --only=<nombre>` | Ejecuta un seeder específico |

## Despliegue

```bash
pnpm install --prod
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
pm2 start ecosystem.config.js
```

Configura los secretos por variables del sistema, nunca en archivos versionados. Coloca Nginx/Caddy con HTTPS delante de la app.
