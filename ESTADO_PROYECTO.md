# Estado del proyecto — Caimanera

> **Fecha de corte:** 26 de octubre de 2026  
> **Rama:** `main`  
> **Estado general:** funcional, compilando y con tests en verde.  
> **Fase actual:** panel público simplificado, login móvil, checkout de pagos, tema oscuro global y sección “Mis partidos”.  
> **Siguiente foco:** conciliación de pagos, webhook de BDT e historial de partidos.

---

## 1. Resumen ejecutivo

El sistema pasó de ser un panel administrativo genérico a una plataforma con dos experiencias claras:

1. **Experiencia pública** para descubrir partidos y canchas cerca de una ubicación.
2. **Panel administrativo** para gestionar canchas, partidos, inscripciones, pases y usuarios.

La app pública ya permite:

- Elegir ubicación por GPS, dirección o cancha.
- Buscar partidos desde un inicio simplificado en tres accesos.
- Filtrar por deporte, día, distancia y orden desde un panel.
- Ver un mapa de las canchas con partidos disponibles.
- Ver un preview del partido antes de confirmar.
- Inscribirse, entrar a lista de espera o cancelar.
- Iniciar el pago con BDT, pago móvil/transferencia, Binance o tarjeta (transacción `PENDING`).
- Usar créditos de un pase activo.
- Ver el detalle público del partido sin exponer datos personales.
- Consultar sus próximos partidos y cancelar desde “Mis partidos”, sin entrar al panel administrativo.
- Iniciar sesión desde una pantalla de acceso adaptada a móvil y al tema oscuro de la app.
- Usar un tema oscuro global, también en el panel administrativo.

El panel administrativo ya permite:

- Editar y eliminar partidos desde la lista y desde el detalle.
- Gestionar canchas, fotos e inscripciones.
- Ver un dashboard con próximos partidos y accesos rápidos.
- Gestionar usuarios, roles y permisos.
- Exportar reportes de usuarios en PDF/Excel con branding Caimanera.

---

## 2. Cambios principales realizados

### 2.1 Nueva experiencia de descubrimiento

> Primera versión del descubrimiento. El rediseño móvil vigente se describe en 2.10.

Se creó el feature `src/features/discovery/` con:

- Selector de ubicación:
  - Ubicación actual del navegador.
  - Búsqueda de direcciones con Nominatim.
  - Zonas populares precargadas.
  - Canchas y clubes como ubicación.
  - Ubicaciones recientes guardadas en `localStorage`.
- Filtros de partidos:
  - Deporte.
  - Día (hoy, mañana, esta semana).
  - Distancia (1, 3, 5, 10, 25 km o todo).
  - Orden por cercanía, fecha, precio o cupos.
- Tarjetas de partido con:
  - Foto de la cancha.
  - Deporte y estado.
  - Distancia.
  - Fecha y hora.
  - Cupos libres y barra de ocupación.
  - Precio.
  - CTA de inscripción / lista de espera / cancelación.
- Vista de mapa con Leaflet y OpenStreetMap.
- Sección de canchas cercanas.
- Sección “Cómo funciona”.
- Página de detalle público `/partidos/[id]`.
- Páginas legales `/terminos` y `/privacidad`.

### 2.2 Separación público / administrativo

Antes `/` era el dashboard protegido. Ahora:

| Ruta | Acceso | Propósito |
|------|--------|-----------|
| `/partidos` | Público | Entrada de la app: búsqueda, filtros y mapa |
| `/partidos/[id]` | Público | Detalle y inscripción |
| `/` | Sesión (jugador) | Inicio personalizado; anónimo → `/partidos`, staff → `/admin` |
| `/mis-partidos` | Sesión | Agenda del jugador |
| `/cuenta` | Sesión | Perfil del jugador |
| `/admin` | Sesión + permiso | Dashboard administrativo |
| `/admin/partidos` | Sesión + permiso | Gestión de partidos |
| `/admin/canchas` | Sesión + permiso | Gestión de canchas |
| `/admin/participantes` | Sesión + permiso | Gestión de inscripciones |
| `/admin/suscripciones` | Sesión + permiso | Catálogo de pases |
| `/admin/users` | Sesión + permiso | Usuarios |
| `/admin/roles` | Sesión + permiso | Roles |
| `/admin/permissions` | Sesión + permiso | Permisos |
| `/admin/perfil` | Sesión + staff | Perfil y contraseña del staff |
| `/login` | Público | Inicio de sesión |

Los textos legales (`/terminos`, `/privacidad`) ya no viven en la app: se enlazan a la landing con `NEXT_PUBLIC_LANDING_URL`.

Después del login:

- **ADMIN / COURT_MANAGER** → `/admin`.
- **PLAYER / otros roles** → `/`.
- Los jugadores nunca entran al layout administrativo: cualquier intento los redirige a `/`.

### 2.3 Reglas de inscripción

La inscripción ahora se resuelve de forma transaccional:

- Verifica que el partido exista y no esté eliminado.
- Verifica que la cancha esté activa.
- Rechaza partidos cancelados, completados, en curso o pasados.
- Detecta inscripción duplicada.
- Decide `CONFIRMED` o `WAITLIST` según cupos reales.
- Si hay pase activo y el partido lo permite, descuenta un crédito y registra `SUBSCRIPTION_CREDIT`.
- Actualiza el estado del partido a `FULL` u `OPEN`.
- Usa transacción `Serializable` con reintentos para reducir sobrecupo por concurrencia.

Cancelación:

- Elimina la inscripción del jugador.
- Si el jugador estaba confirmado, promueve al primero de la lista de espera.
- Si usó crédito de pase, devuelve el crédito.
- Recalcula el estado del partido.
- El jugador puede cancelar desde la tarjeta o el detalle sin permisos administrativos.

### 2.4 Gestión de partidos

Se conectó el CRUD que antes estaba incompleto:

- Menú de acciones en cada tarjeta del admin:
  - Ver detalle.
  - Editar.
  - Eliminar.
- Botones de editar y eliminar en el detalle administrativo.
- Filtro por estado:
  - Próximos.
  - Todos.
  - Abiertos.
  - Llenos.
  - Finalizados.
  - Cancelados.
- Por defecto, el admin ve primero los partidos próximos.
- Validación de solapamiento de horarios por rango, no solo por hora exacta.
- Validación de fechas pasadas.
- Las fechas se guardan en UTC y se muestran en `America/Caracas`.

### 2.5 Permisos y privacidad

- Se creó el permiso `participants:self_enroll`.
- `PLAYER` ya no tiene `participants:create`.
- `PLAYER` ya no ve la lista administrativa de participantes.
- El detalle público no muestra nombres ni datos de jugadores.
- El detalle administrativo oculta la pestaña de participantes si el rol no tiene `participants:read`.
- `getUsersForSelectAction` exige permisos de gestión y ya no devuelve cédulas.
- Se valida la sesión contra la base de datos:
  - Si el usuario fue eliminado, la sesión se invalida.
  - Si el rol cambió, se usa el rol actual para permisos.
- La campana de notificaciones solo se muestra a roles con `notifications:read`.
- El SSE solo se conecta cuando hay permisos de notificaciones.
- El proxy valida el parámetro `next` para evitar open redirects.

### 2.6 Correcciones funcionales importantes

- Las fotos de canchas ya se incluyen en el listado; antes se borraban al editar.
- La actualización de cancha solo reemplaza fotos cuando se envía una lista explícita.
- Los selectores de canchas excluyen canchas inactivas.
- El selector de partidos para inscripciones solo muestra partidos próximos.
- La paginación valida página y tamaño máximo.
- Los reportes de usuarios se rebrandearon a Caimanera:
  - Cédula, nombre, correo, rol y estado.
  - Logo y colores Caimanera.
- El envío de credenciales ya no cambia contraseñas si el correo falla.
- Se valida unicidad de cédula/correo al editar usuarios.
- Se corrigió el reset de filtros en usuarios y partidos.
- Se corrigieron hooks con errores de lint (`use-mobile`, notificaciones, SSE monitor).

### 2.7 Branding y limpieza

- README reescrito para Caimanera.
- `package.json` renombrado a `caimanera-app`.
- `ecosystem.config.js` renombrado a Caimanera y puerto 3001.
- Correo del admin demo cambiado a `admin@caimanera.app`.
- Eliminadas referencias visibles a PlayMatch.
- Eliminado el grupo “Catálogos” del sidebar para reducir ruido.
- Nuevo header con breadcrumb.
- Nuevo `PageHeader` con branding verde Caimanera.
- Fechas y precios formateados en español.
- CSP actualizada para permitir fotos demo y tiles de OpenStreetMap.

### 2.8 Seed y datos demo

Se agregaron dos seeders nuevos:

- `20260915095000_caimanera-demo-users`
  - Crea jugadores y encargados de cancha demo.
- `20261025000000_caimanera-public-launch`
  - Agrega `participants:self_enroll`.
  - Quita permisos administrativos a `PLAYER`.
  - Actualiza el correo del admin.

También se mejoró el seed demo existente:

- Actualiza las fechas de los partidos en cada ejecución.
- Recalcula `OPEN` / `FULL` según ocupación real.
- Agrega partidos nuevos.
- Mantiene vigentes las suscripciones demo.
- Incluye usuarios demo en instalaciones limpias.

### 2.9 Librerías añadidas o aprovechadas

| Librería | Uso |
|----------|-----|
| `geolib` | Cálculo y ordenamiento por distancia |
| `date-fns` | Manejo de fechas |
| `date-fns-tz` | Zona horaria `America/Caracas` |
| `leaflet` | Mapa |
| `react-leaflet` | Integración del mapa con React |
| Nominatim | Geocodificación de direcciones |

### 2.10 Nuevo panel móvil y checkout (26 de octubre de 2026)

La experiencia pública se rediseñó con enfoque mobile-first y tema oscuro global:

- **Etapa 1 — Inicio simplificado (módulos):**
  - Módulo de bienvenida con saludo, título y selector de ubicación integrado.
  - Módulo de accesos: buscar partido, canchas y mapa.
  - Mosaico de tres canchas cercanas.
  - Detalle del rediseño vigente en 2.13.
- **Etapa 2 — Elegir partido:**
  - Módulo superior con título, ubicación y tabs por deporte.
  - Búsqueda, día, distancia y orden dentro de un panel de filtros.
  - Chips de filtros activos, contador de resultados y selector Lista/Mapa.
  - Detalle del rediseño vigente en 2.14.
- **Preview del partido:** imagen, cancha, fecha, hora, cupos, precio y ubicación.
- **Checkout:**
  - Métodos: BDT, pago móvil/transferencia, Binance y tarjeta nacional/internacional.
  - Transacciones externas en estado `PENDING`.
  - Pago con crédito de pase.
  - Confirmación directa para staff con `participants:create` (hoy `ADMIN`).
  - Enlace directo `/?partido=<id>`.
- **Tema oscuro global:** paleta azul-marino con acento verde menta para público y administración.
- **Navegación móvil:** barra inferior Inicio, Partidos, Mis partidos, Perfil.
- **Modelo de datos:** `PaymentMethod` y campos `amountVes`, `currency`, `method`, `metadata` en `Transaction`.

Migración: `20261026125339_add_transaction_payment_fields`.

### 2.11 “Mis partidos” público (26 de octubre de 2026)

Se agregó la agenda del jugador fuera del panel administrativo:

- **Ruta:** `/mis-partidos`, dentro del shell público, protegida por sesión y excluida en `robots.txt`.
- **Consulta:** inscripciones del jugador con `scheduledAt >= now`; excluye partidos pasados, completados y cancelados.
- **Interfaz:**
  - Título, contador y lista simple ordenada por fecha.
  - Tarjetas reutilizadas del descubrimiento, con estado **Confirmado** o **En espera**.
  - Distancia calculada si el jugador ya eligió una ubicación.
  - Estado vacío con CTA para buscar partido.
- **Gestión:** al tocar una tarjeta se abre el mismo preview/checkout del descubrimiento para ver el detalle o cancelar la inscripción.
- **Navegación:** entrada en la barra inferior (Inicio, Partidos, Mis partidos, Perfil), en el header de escritorio y en el pie cuando hay sesión.
- **Revalidación:** las acciones de inscripción, pago y cancelación revalidan `/mis-partidos`.
- **Pendiente:** pestaña de historial para partidos pasados.

### 2.12 Login móvil (26 de octubre de 2026)

Se rediseñó `/login` para que se sienta como la pantalla de acceso de una app y use el mismo lenguaje visual del resto del sistema:

- **Móvil:** barra superior con volver y marca, logo destacado, formulario en tarjeta redondeada y CTA a ancho completo.
- **Controles táctiles:** campos de 48 px, etiquetas compactas, íconos, mostrar/ocultar contraseña y botón con estado de carga.
- **Escritorio:** panel de marca con beneficios a la izquierda y formulario a la derecha.
- **Accesibilidad:** labels asociados, `role="alert"` para errores, foco visible y autocompletado (`email` / `current-password`).
- **Safe areas:** padding con `env(safe-area-inset-*)` y altura `min-h-dvh` para navegadores móviles.
- **Redirección:** se mantiene el soporte de `?next=` y el destino por rol (`/admin` o `/`).
- **Consistencia:** paleta oscura azul-marino con acento menta, tarjetas y radios del tema global.

### 2.13 Módulos del inicio público (26 de octubre de 2026)

Se unificó la cabecera del inicio con el lenguaje de módulos del resto de la app:

- **Módulo de bienvenida:** saludo, título y subtítulo dentro de una tarjeta redondeada con borde, fondo y radios del tema.
- **Ubicación integrada:** el selector dejó de ser un bloque suelto; ahora vive dentro del módulo de bienvenida, a la derecha en escritorio y apilado en móvil.
- **Módulo de accesos:** “¿Qué quieres hacer?” pasó a una tarjeta con subtítulo y los tres accesos (buscar partido, canchas y mapa) sobre fondos y bordes consistentes.
- **Copy centralizado:** los textos del inicio se movieron a `DISCOVERY_CONFIG.UI.HOME` en `src/features/discovery/config/discovery.constants.js`.
- **Archivos:** `src/features/discovery/components/DiscoveryHome.jsx` y `src/features/discovery/config/discovery.constants.js`.
- **Verificación:** ESLint sin errores, test de discovery en verde y revisión visual en escritorio con el tema oscuro.

### 2.14 Etapa “Elegir partido” reorganizada (26 de octubre de 2026)

Se rediseñó el listado de partidos para que siga el mismo lenguaje de módulos del inicio y se lea como una pantalla nativa:

- **Módulo superior:** título, subtítulo, ubicación y tabs de deporte viven dentro de una tarjeta redondeada con el mismo borde, fondo, radios y padding que el módulo “¿Dónde jugamos hoy?”.
- **Ubicación compartida:** se extrajo `DiscoveryLocationButton` y ahora el inicio y la etapa de partidos usan exactamente el mismo selector (ícono, etiqueta “Tu ubicación / Buscando cerca de”, valor y chevron).
- **Ancho de lectura:** la etapa se centra en `max-w-2xl`, igual que “Mis partidos”, para evitar tarjetas de 1900 px en escritorio.
- **Tabs de deporte:** visibles completas en móvil (sin emojis para ganar espacio), con emoji desde `sm` y ajuste en varias líneas en pantallas muy angostas.
- **Filtros activos:** chips removibles para búsqueda, día y distancia dentro del mismo módulo, con acción “Limpiar”.
- **Encabezado de resultados:** título de sección + contador (`Próximos partidos` / `6 partidos disponibles`) y control segmentado Lista/Mapa, igual que los encabezados del inicio.
- **Barra de pantalla:** volver, título y filtros en una fila; la ubicación usa su propio control debajo y el filtro conserva el contador de filtros activos.
- **Tarjeta de partido:** imagen de 76 px, título y precio con jerarquía clara, cancha y fecha/hora agrupadas, y pie con cupos (`3 de 4`), barra de ocupación y estado. Usa `shadow-sm` y el mismo borde que las tarjetas del inicio.
- **Navegación inferior:** la pestaña “Partidos” se marca activa también cuando el listado vive en `/#partidos`.
- **Copy centralizado:** nuevos textos en `DISCOVERY_CONFIG.UI.MATCHES_STAGE` y reutilización de `UI.SECTIONS` para el encabezado de resultados.
- **Archivos:** `DiscoveryMatchesStage.jsx`, `DiscoveryMatchCard.jsx`, `DiscoveryLocationButton.jsx`, `DiscoveryHome.jsx`, `PublicBottomNav.jsx`, `DiscoveryView.jsx` y `discovery.constants.js`.
- **Verificación:** revisión visual en 390×844 y 375×812 con Chrome (lista, filtros activos, mapa y estado vacío) y en escritorio a 1440 px; ESLint sin errores.

### 2.15 Separación app / admin — primer bloque (26 de octubre de 2026)

Se inició la separación fuerte entre la app del jugador y el panel administrativo. Este bloque no rediseña pantallas: establece rutas, shell y límites de acceso.

**Decisiones de producto:**

- La entrada depende de la sesión: visitante anónimo → `/partidos`; jugador → `/`; staff → `/admin`.
- “Canchas” será un módulo real con `/canchas` y `/canchas/[id]` (siguiente bloque).
- Los textos legales se moverán a la landing; la app solo enlazará a ellos.

**Cambios realizados:**

- **Route groups renombrados:** `(public)` → `(app)` y `(root)` → `(admin)`. Las URLs no cambian.
- **Rutas por superficie:** `ROUTES.PUBLIC` (solo `/partidos`), `ROUTES.PLAYER` (`/`, `/mis-partidos`, `/cuenta`) y `ROUTES.LEGAL` (temporal).
- **Proxy reescrito:** clasificación explícita de rutas abiertas y privadas. `/` ya no es público; redirige según sesión y rol. `/cuenta` entra en la lista de rutas con sesión.
- **Shell de la app:** `PublicHeader`, `PublicFooter` y `PublicBottomNav` se movieron a `features/app-shell` y se renombraron a `AppHeader`, `AppFooter` y `AppBottomNav`. El shell ya no consulta permisos ni conoce `matches:create`.
- **Jugador fuera del admin:** el perfil vive en `/cuenta` dentro del shell de la app. El layout de `(admin)` redirige a `/` a cualquier rol que no sea `ADMIN` o `COURT_MANAGER`.
- **`/partidos` independiente del inicio:** la página fuerza la etapa de búsqueda con `initialStage="matches"`; `/` mantiene el inicio. El botón “volver” solo aparece cuando hay sesión.
- **Dominio desacoplado:** `match.enroll.action.js` y `match.payment.action.js` ya no importan `DISCOVERY_CONFIG`; usan `ROUTES` para revalidar.
- **Limpieza:** se eliminó el anchor muerto `#como-funciona` del navegador de discovery.
- **Enlaces actualizados:** sidebar admin y navegación móvil del admin apuntan a `/partidos` para “Descubrir”; `robots.txt` bloquea `/cuenta`.

**Verificación:**

- `pnpm build` exitoso con las rutas `/`, `/partidos`, `/partidos/[id]`, `/mis-partidos`, `/cuenta`, `/admin/*`, `/login`.
- `pnpm test`: 67/67.
- `npx eslint src`: 0 errores, 18 warnings.
- Pruebas HTTP con sesión real:
  - Anónimo: `/` → 307 `/partidos`; `/mis-partidos` y `/cuenta` → 307 `/login`; `/partidos` → 200.
  - PLAYER: `/`, `/partidos`, `/mis-partidos`, `/cuenta` → 200; `/admin` y `/admin/perfil` → 307 `/`.
  - ADMIN: `/` → 307 `/admin`; `/admin` y `/admin/perfil` → 200.

**Pendiente del siguiente bloque:** separar `/canchas`, filtros de búsqueda en la URL, extraer `booking` y `location`, y convertir `/` en un inicio sin buscador embebido.

### 2.16 Cierre de infraestructura del bloque 1 (26 de octubre de 2026)

Se cerraron los pendientes que no requerían rediseñar pantallas:

- **Legales fuera de la app:** se eliminaron `/terminos` y `/privacidad`. `NEXT_PUBLIC_LANDING_URL` centraliza los enlaces a la landing. El login y el footer abren los legales en pestaña nueva; las URLs antiguas redirigen a la landing (o a `/partidos` si la variable no está configurada).
- **Providers por superficie:** `PermissionsProvider` y `SseProvider` se movieron del layout raíz al layout de `(admin)`. El layout raíz ya no consulta sesión, rol ni permisos; solo monta providers técnicos.
- **Código muerto eliminado:** `DiscoveryHero`, `DiscoveryHowItWorks`, `DiscoveryResults` y `DiscoveryFilters`, junto con el copy de marketing (`HERO`/`HOW_*`) y el footer duplicado en `discovery.constants`.
- **Config de ubicación:** los textos del selector de ubicación pasaron de `UI.HERO` a `UI.LOCATION`, que es lo que realmente representan.
- **Sitemap y redirects:** el sitemap solo lista `/partidos` y `/login`; los legales se resuelven en la landing.

**Verificación adicional:**

- Anónimo: `/terminos` y `/privacidad` → 307 `/partidos` (sin landing configurada).
- `/login` muestra los textos legales sin enlaces cuando `NEXT_PUBLIC_LANDING_URL` está vacía.
- ADMIN: `/admin` sigue renderizando el sidebar y la campana de notificaciones con los providers montados en el layout administrativo.
- `pnpm build` exitoso; `/terminos` y `/privacidad` ya no aparecen en el mapa de rutas.
- `pnpm test`: 67/67. `npx eslint src`: 0 errores, 18 warnings.

---

## 3. Estructura relevante nueva

```text
src/app/
├── (app)/
│   ├── layout.jsx
│   ├── page.jsx
│   ├── partidos/
│   │   ├── page.jsx
│   │   └── [id]/page.jsx
│   ├── mis-partidos/page.jsx
│   └── cuenta/page.jsx
├── (admin)/
│   └── admin/
│       └── page.jsx
├── login/page.jsx
└── api/
    └── geo/
        ├── search/route.js
        └── reverse/route.js

src/features/app-shell/
├── components/
│   ├── AppHeader.jsx
│   ├── AppFooter.jsx
│   └── AppBottomNav.jsx
└── config/app-shell.constants.js

src/features/auth/
├── components/
│   ├── LoginForm.jsx
│   └── LoginFields.jsx
├── config/auth.constants.js
├── hooks/use-auth-login.js
└── ...

src/features/discovery/
├── components/
│   ├── MyMatchesPageContainer.jsx
│   ├── MyMatchesView.jsx
│   └── ...
├── config/
├── hooks/
├── lib/
├── mappers/
├── repositories/
└── services/

src/features/matches/
├── components/MatchJoinButton.jsx
├── components/MatchDetailActions.jsx
├── repositories/match.enrollment.repository.js
└── services/match.integration.service.js

src/features/payments/
├── actions/match.payment.action.js
├── config/payment.constants.js
├── schemas/payment.schema.js
└── services/match.payment.service.js
```

---

## 4. Verificación actual

### Build

```bash
pnpm build
```

Resultado: **exitoso**, sin errores. La ruta `/login` se genera como dinámica.

### Tests

```bash
pnpm test
```

Resultado: **67 tests aprobados / 67**.

Suites:

- Rate limiter.
- Auth mapper.
- Permission mapper.
- Safe action.
- Jerarquía.
- Fechas/timezone.
- Geo/distancia.
- Validación de partidos.
- Validación de métodos de pago.

### Lint

```bash
npx eslint src
```

Resultado: **0 errores, 18 warnings**.

Los warnings restantes son principalmente `<img>` en lugar de `next/image` y avisos menores de hooks/permisos.

---

## 5. Pruebas manuales realizadas

Con Playwright + Chrome y Brave:

- Home público en móvil (390×844) y escritorio.
- “Mis partidos” con jugador demo: cuatro inscripciones próximas, sin partidos pasados.
- Apertura del detalle desde “Mis partidos” y disponibilidad de cancelación.
- Inicio público: módulo de bienvenida con ubicación integrada, módulo de accesos y mosaico de canchas, verificado en escritorio con tema oscuro.
- Etapa “Elegir partido”: módulo superior con ubicación y deportes, chips de filtros activos, encabezado de resultados con selector Lista/Mapa, y revisión en móvil (390×844, 375×812) y escritorio (1440 px).
- Filtros de la etapa de partidos: apertura del panel, selección de día, chip activo, limpieza y estado vacío.
- Vista de mapa de la etapa de partidos en móvil.
- Preview del partido en drawer móvil.
- Checkout BDT de punta a punta:
  - Transacción `PENDING` creada.
  - Inscripción `CONFIRMED` con `PAY_PER_MATCH`.
  - Referencia generada y pantalla de resultado.
- Confirmación de staff sin pago (`STAFF_BYPASS`).
- Login de jugador → redirige a `/`.
- Login de admin → redirige a `/admin`.
- Login móvil (390×844 y 375×667): barra superior, logo, formulario, error de credenciales y CTA.
- Login en tablet (820×1180) y laptop (1024×900): una columna centrada y split de escritorio respectivamente.
- Login de escritorio (1440×1000): panel de marca + formulario.
- Panel administrativo en tema oscuro.
- Edición de partido desde el admin.
- Guardado de partido sin desfase horario.
- PDF/Excel de usuarios.
- Proxy público y rutas protegidas.
- Los datos creados durante las pruebas de pago se eliminaron al finalizar.

---

## 6. Credenciales demo

| Rol | Correo | Contraseña |
|-----|--------|------------|
| ADMIN | `admin@caimanera.app` | `admin123` |
| PLAYER | `carlos.perez@caimanera.app` | `caimanera123` |
| PLAYER | `maria.rodriguez@caimanera.app` | `caimanera123` |
| PLAYER | `luis.gomez@caimanera.app` | `caimanera123` |
| COURT_MANAGER | `ana.torres@caimanera.app` | `caimanera123` |
| COURT_MANAGER | `pedro.rivas@caimanera.app` | `caimanera123` |

> Cambiar antes de exponer el sistema a Internet.

---

## 7. Pendientes y próximos pasos

### 7.1 Simplificación de la vista pública (completada)

La vista pública quedó en dos etapas:

- **Inicio:** módulo de bienvenida con saludo y ubicación, tarjeta de accesos y mosaico de canchas.
- **Elegir partido:** módulo superior con ubicación y deportes, filtros en panel, chips activos, contador y selector Lista/Mapa.

Se eliminaron de la pantalla principal las estadísticas, promociones y secciones redundantes. El mapa quedó como opción secundaria dentro de la etapa de selección. Inscribirse ahora toma: partido → preview → método de pago → confirmar.

### 7.2 Otros pendientes funcionales

- Historial de partidos pasados dentro de “Mis partidos” (hoy solo se muestran los próximos).
- Conectar el webhook real de BDT.
- Conciliación de transacciones `PENDING` en el panel administrativo.
- Cobro al promover un jugador desde lista de espera.
- Página “Mis pases” para jugadores.
- Flujo de compra/activación de pases.
- Módulo de transacciones.
- Notificaciones específicas de partidos.
- Mejorar perfil de jugador con nivel, confiabilidad y ubicación.
- Optimizar imágenes con `next/image`.
- Revisar módulos heredados que aún no forman parte de Caimanera.
- Pulir textos y estados vacíos restantes.

### 7.3 “Mis partidos” (completado)

Objetivo: que un jugador vea sus partidos sin entrar a `/admin`.

Implementado:
- Página `/mis-partidos` en el shell público, protegida por sesión y excluida en `robots.txt`.
- Consulta de inscripciones del jugador con `scheduledAt >= now`; excluye partidos pasados, completados y cancelados.
- Entrada en la barra inferior pública (Inicio, Partidos, Mis partidos, Perfil), en el header de escritorio y en el pie.
- Tarjetas reutilizadas del descubrimiento, con estado **Confirmado** o **En espera**.
- Al tocar una tarjeta: preview del partido, estado de inscripción y cancelación con el mismo checkout.
- Estado vacío con CTA para buscar partido.
- Sin acceder al panel administrativo.

Pendiente para una siguiente iteración: historial de partidos pasados.

### 7.4 Login móvil (completado)

Objetivo: que el acceso se sienta como una pantalla de app y no como un formulario web genérico.

Implementado:
- Shell propio de `/login`, fuera del header/footer público.
- Barra superior móvil con volver y marca.
- Logo destacado, formulario en tarjeta y CTA a ancho completo.
- Campos de 48 px, íconos, mostrar/ocultar contraseña y estados de carga/error.
- Safe areas y `min-h-dvh` para móviles.
- Split de marca + formulario desde `lg`; una sola columna en móvil y tablet.
- Redirección por rol y soporte de `?next=` sin cambios.

Pendiente para una siguiente iteración: recuperación de contraseña y registro público, si se habilitan.

---

## 8. Riesgos y consideraciones

- **Geocodificación:** depende de Nominatim; si falla, la app usa zonas y canchas locales como respaldo.
- **Mapa:** requiere conexión para cargar tiles de OpenStreetMap.
- **Fotos demo:** algunas usan `picsum.photos`; en producción se recomienda subir fotos propias.
- **Uploads locales:** se guardan en `public/uploads`; en un servidor con múltiples instancias se recomienda almacenamiento externo.
- **Suscripciones:** se consumen créditos, pero no hay compra autónoma de pases ni pasarela real conectada.
- **Pagos:** el checkout crea transacciones `PENDING`; BDT, pago móvil, Binance y tarjeta todavía no tienen webhook ni conciliación administrativa.
- **Lista de espera:** al promover a un jugador no se genera cobro; la regla debe definirse antes de producción.
- **Sesión:** se valida contra base de datos, pero el proxy solo verifica la firma del JWT; las páginas y acciones hacen la validación completa.

---

## 9. Comandos útiles

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Producción
pnpm start

# Tests
pnpm test

# Lint
pnpm lint

# Seeders
node prisma/seed
node prisma/seed --only=20260915095000_caimanera-demo-users
node prisma/seed --only=20261025000000_caimanera-public-launch
node prisma/seed --only=20260915104819_caimanera-demo-data
```

---

## 10. Conclusión

El sistema está en un estado **estable y demostrable**. La experiencia pública ya está simplificada, tiene login móvil, preview y checkout, y el panel administrativo está conectado con tema oscuro y reglas de inscripción transaccionales.

La sección **“Mis partidos”** ya está disponible en el shell público: el jugador ve sus próximas inscripciones y puede abrir el detalle o cancelar sin pasar por `/admin`. El acceso a la cuenta también quedó adaptado a móvil, con una pantalla consistente con el resto de la app. La etapa **“Elegir partido”** quedó alineada con los módulos del inicio: ubicación compartida, deportes visibles, filtros resumidos y tarjetas con el mismo lenguaje visual. Queda como siguiente mejora agregar el historial de partidos pasados.

El foco técnico inmediato es conectar el webhook real de BDT y agregar la conciliación de transacciones `PENDING`.
