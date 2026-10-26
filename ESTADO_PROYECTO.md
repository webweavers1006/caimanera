# Estado del proyecto — Caimanera

> **Fecha de corte:** 26 de octubre de 2026  
> **Resumen:** app y admin separados; bloques 1, 1.5, 2, 3 y 4 completados. El inicio es público, las pantallas de juego requieren sesión y el jugador ya tiene pases y pagos propios. `discovery` ya no existe: `booking`, `location` y `player` viven en sus propios features.  
> **Última verificación:** 26 oct 2026 · build OK · tests 75/75 · lint 0 errores / 20 warnings  
> **Rama activa:** `feat/separacion-app-admin`  
> **Estado general:** funcional, compilando, con tests en verde y con la superficie del jugador separada del panel administrativo.  
> **Fase actual:** separación funcional app / admin completada (bloques 1, 1.5, 2, 3 y 4).  
> **Siguiente foco:** pendientes de dominio y producto (webhook BDT, conciliación automática, cobro al promover lista de espera y notificaciones de partido) — sección 7.2.  
> **Commits de referencia:** `3b5ee56` (checkpoint), `13e5122` (bloque 1), `0582e45` (bloque 1.5), `a734c59` (docs), `d28c385` (bloque 2), `481b471` (bloque 3), `710b8d7` (historial); pases y pagos en el commit actual.

---

## 0. Cómo continuar en una nueva sesión

1. **Rama:** `git switch feat/separacion-app-admin`. El bloque 2 está commiteado en `d28c385`; el bloque 3 en `481b471`; el historial en `710b8d7`; pases y pagos en el commit actual.
2. **Variables:** configurar `NEXT_PUBLIC_LANDING_URL` en `.env` (ver `.env.example`). Sin ella, los legales se muestran como texto y las URLs viejas `/terminos` y `/privacidad` redirigen a `/`.
3. **Entorno:** `pnpm install` si hace falta y `pnpm dev`. El script usa el puerto 3001; si ya hay otro dev server de Next en el repo, Next se niega a arrancar (en esta máquina también apareció uno en 3000).
4. **Leer primero:** secciones 2.15 (bloque 1), 2.16 (bloque 1.5), 2.17 (bloque 2), 2.18 (bloque 3), 2.19 (historial), 2.20 (pases, pagos y acceso), 3 (estructura), 7.1 (bloque 2 completado), 7.2 (siguientes pasos) y 8 (riesgos).
5. **Empezar por:** sección 7.2, “Siguientes pasos funcionales”. La separación de superficies está cerrada; el trabajo nuevo es de dominio y producto.

### Decisiones de producto ya cerradas

- **Entrada según sesión:** anónimo → `/` (inicio público con mosaico); jugador → `/` personalizado; staff → `/admin`.
- **Pantallas de juego con sesión:** `/partidos`, `/partidos/[id]`, `/canchas`, `/canchas/[id]` y `/mis-partidos` piden login y respetan `?next=`.
- **Staff fuera de la app:** cualquier ruta de jugador abierta por `ADMIN` o `COURT_MANAGER` redirige a `/admin`.
- **Canchas es módulo real:** `/canchas` y `/canchas/[id]` ya existen.
- **Legales en la landing:** la app solo enlaza; no vuelven a vivir en este proyecto.
- **Links legales:** pestaña nueva (`target="_blank"` + `rel="noopener noreferrer"`).
- **Pases y pagos del jugador:** viven en `/cuenta/pases` y `/cuenta/pagos`, accesibles desde el hub de `/cuenta`.
- **Compra de pase:** crea `Transaction` tipo `SUBSCRIPTION_PURCHASE` en `PENDING`; el admin la confirma en `/admin/pagos` y allí se activa o renueva el pase.

### Comportamientos resueltos en el bloque 2

- `/` es solo inicio: no hay `stage` ni buscador embebido.
- `/partidos` es el único buscador y sus filtros viven en la URL.
- Las tarjetas y el mapa del buscador abren un preview; desde ahí un botón lleva a `/partidos/[id]`. El drawer también se usa en “Mis partidos” y como checkout del detalle.
- “Canchas” navega a `/canchas`; ya no existen anchors `/#canchas` ni `/#partidos`.
- `?partido=` se redirige al detalle canónico.
- `booking` y `location` ya viven fuera de `discovery` (bloque 3, sección 2.18).

---

## 1. Resumen ejecutivo

El sistema pasó de ser un panel administrativo genérico a una plataforma con dos experiencias claras:

1. **App del jugador** para descubrir partidos y canchas, inscribirse, pagar y gestionar su cuenta.
2. **Panel administrativo** para gestionar canchas, partidos, inscripciones, pases y usuarios.

La separación entre ambas superficies ya está cerrada:

- Route groups `(app)` y `(admin)` con shells independientes.
- Proxy que distingue rutas abiertas, de jugador y de admin.
- Un visitante anónimo ve `/` (inicio público); `/partidos` y `/canchas` piden login; el staff aterriza en `/admin`.
- Los jugadores no pueden entrar al layout administrativo y el staff no navega la app del jugador.
- El perfil del jugador vive en `/cuenta`, no en `/admin/perfil`.
- Los pases y pagos del jugador viven en `/cuenta/pases` y `/cuenta/pagos`.
- La landing es dueña de los textos legales.

La app ya permite:

- Elegir ubicación por GPS, dirección o cancha.
- Buscar partidos desde un inicio simplificado en tres accesos.
- Filtrar por deporte, día, distancia y orden desde un panel.
- Ver un mapa de las canchas con partidos disponibles.
- Ver un preview del partido antes de confirmar.
- Inscribirse, entrar a lista de espera o cancelar.
- Iniciar el pago con BDT, pago móvil/transferencia, Binance o tarjeta (transacción `PENDING`).
- Usar créditos de un pase activo.
- Ver el detalle público del partido sin exponer datos personales.
- Consultar sus próximos partidos, ver el historial de los jugados y cancelar desde “Mis partidos”, sin entrar al panel administrativo.
- Comprar o renovar un pase, consultar sus pases activos y ver el historial de pagos.
- Iniciar sesión desde una pantalla de acceso adaptada a móvil y al tema oscuro de la app.
- Usar un tema oscuro global, también en el panel administrativo.

El panel administrativo ya permite:

- Editar y eliminar partidos desde la lista y desde el detalle.
- Gestionar canchas, fotos e inscripciones.
- Ver un dashboard con próximos partidos y accesos rápidos.
- Gestionar planes de pases.
- Revisar transacciones y confirmar pagos pendientes; al confirmar una compra de pase, este se activa o renueva.
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
| `/` | Público | Inicio público; el jugador con sesión ve su inicio personalizado |
| `/partidos` | Sesión | Búsqueda, filtros y mapa |
| `/partidos/[id]` | Sesión | Detalle e inscripción |
| `/canchas` | Sesión | Listado de canchas |
| `/canchas/[id]` | Sesión | Detalle de cancha |
| `/mis-partidos` | Sesión | Agenda e historial del jugador |
| `/cuenta` | Sesión | Hub de cuenta del jugador |
| `/cuenta/pases` | Sesión | Pases activos, compra/renovación e historial |
| `/cuenta/pagos` | Sesión | Historial de pagos |
| `/admin` | Sesión + permiso | Dashboard administrativo |
| `/admin/partidos` | Sesión + permiso | Gestión de partidos |
| `/admin/canchas` | Sesión + permiso | Gestión de canchas |
| `/admin/participantes` | Sesión + permiso | Gestión de inscripciones |
| `/admin/suscripciones` | Sesión + permiso | Catálogo de pases |
| `/admin/pagos` | Sesión + permiso | Transacciones y confirmación de pagos |
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
- El staff nunca navega la app del jugador: cualquier intento lo redirige a `/admin`.

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

> Histórico: las pantallas descritas aquí fueron reorganizadas en el bloque 2 (2.17). Se conserva como referencia de la primera iteración móvil.

La experiencia pública se rediseñó con enfoque mobile-first y tema oscuro global:

- **Etapa 1 — Inicio simplificado (módulos):**
  - Módulo de bienvenida con saludo, título y selector de ubicación integrado.
  - Módulo de accesos: buscar partido, canchas y mapa.
  - Mosaico de tres canchas cercanas.
  - Detalle histórico en 2.13.
- **Etapa 2 — Elegir partido:**
  - Módulo superior con título, ubicación y tabs por deporte.
  - Búsqueda, día, distancia y orden dentro de un panel de filtros.
  - Chips de filtros activos, contador de resultados y selector Lista/Mapa.
  - Detalle histórico en 2.14.
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

> Histórico: reemplazado por el inicio del bloque 2 (2.17). Los archivos `DiscoveryHome.jsx` y `DiscoveryView.jsx` ya no existen.

Se unificó la cabecera del inicio con el lenguaje de módulos del resto de la app:

- **Módulo de bienvenida:** saludo, título y subtítulo dentro de una tarjeta redondeada con borde, fondo y radios del tema.
- **Ubicación integrada:** el selector dejó de ser un bloque suelto; ahora vive dentro del módulo de bienvenida, a la derecha en escritorio y apilado en móvil.
- **Módulo de accesos:** “¿Qué quieres hacer?” pasó a una tarjeta con subtítulo y los tres accesos (buscar partido, canchas y mapa) sobre fondos y bordes consistentes.
- **Copy centralizado:** los textos del inicio se movieron a `DISCOVERY_CONFIG.UI.HOME` en `src/features/discovery/config/discovery.constants.js`.
- **Archivos:** `src/features/discovery/components/DiscoveryHome.jsx` y `src/features/discovery/config/discovery.constants.js`.
- **Verificación:** ESLint sin errores, test de discovery en verde y revisión visual en escritorio con el tema oscuro.

### 2.14 Etapa “Elegir partido” reorganizada (26 de octubre de 2026)

> Histórico: reemplazada por `/partidos` en el bloque 2 (2.17). `DiscoveryMatchesStage.jsx` y `DiscoveryView.jsx` ya no existen.

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

> **Histórico:** la regla de acceso de esta sección cambió en el bloque 4 (2.20). Hoy `/` es público y `/partidos` y `/canchas` requieren sesión.

Se inició la separación fuerte entre la app del jugador y el panel administrativo. Este bloque no rediseña pantallas: establece rutas, shell y límites de acceso.

**Decisiones de producto:**

- La entrada depende de la sesión: visitante anónimo → `/partidos`; jugador → `/`; staff → `/admin`.
- “Canchas” quedó como módulo real con `/canchas` y `/canchas/[id]` (completado en el bloque 2, 2.17).
- Los textos legales se moverán a la landing; la app solo enlazará a ellos.

**Cambios realizados:**

- **Route groups renombrados:** `(public)` → `(app)` y `(root)` → `(admin)`. Las URLs no cambian.
- **Rutas por superficie:** `ROUTES.PUBLIC` (solo `/partidos`) y `ROUTES.PLAYER` (`/`, `/mis-partidos`, `/cuenta`). Los legales se movieron a la landing en el bloque 1.5.
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

**Completado en el bloque 2 (2.17):** `/canchas`, filtros de búsqueda en la URL y `/` sin buscador embebido. **Pendiente para el bloque 3:** extraer `booking` y `location`.

### 2.16 Cierre de infraestructura del bloque 1 (26 de octubre de 2026)

Se cerraron los pendientes que no requerían rediseñar pantallas:

- **Legales fuera de la app:** se eliminaron `/terminos` y `/privacidad`. `NEXT_PUBLIC_LANDING_URL` centraliza los enlaces a la landing. El login y el footer abren los legales en pestaña nueva; las URLs antiguas redirigen a la landing (o a `/` si la variable no está configurada).
- **Providers por superficie:** `PermissionsProvider` y `SseProvider` se movieron del layout raíz al layout de `(admin)`. El layout raíz ya no consulta sesión, rol ni permisos; solo monta providers técnicos.
- **Código muerto eliminado:** `DiscoveryHero`, `DiscoveryHowItWorks`, `DiscoveryResults` y `DiscoveryFilters`, junto con el copy de marketing (`HERO`/`HOW_*`) y el footer duplicado en `discovery.constants`.
- **Config de ubicación:** los textos del selector de ubicación pasaron de `UI.HERO` a `UI.LOCATION`, que es lo que realmente representan.
- **Sitemap y redirects:** el sitemap solo lista `/` y `/login`; los legales se resuelven en la landing.

**Verificación adicional:**

- Anónimo: `/terminos` y `/privacidad` → 307 `/partidos` (sin landing configurada).
- `/login` muestra los textos legales sin enlaces cuando `NEXT_PUBLIC_LANDING_URL` está vacía.
- ADMIN: `/admin` sigue renderizando el sidebar y la campana de notificaciones con los providers montados en el layout administrativo.
- `pnpm build` exitoso; `/terminos` y `/privacidad` ya no aparecen en el mapa de rutas.
- `pnpm test`: 67/67. `npx eslint src`: 0 errores, 18 warnings.

### 2.17 Separación app / admin — bloque 2 (26 de octubre de 2026)

Se separaron las pantallas en módulos independientes. `/` dejó de ser un contenedor de búsqueda, `/partidos` pasó a ser el único buscador y “Canchas” estrenó rutas propias.

**Features nuevos:**

- `home`: inicio del jugador con próximo partido, resumen de agenda y accesos.
- `match-search`: buscador con filtros en URL, lista/mapa y tarjetas canónicas.
- `match-detail`: detalle público con checkout.
- `venues`: listado y detalle de canchas con sus próximos partidos.

**Cambios principales:**

- **`/` solo inicio:**
  - Saludo, ubicación, accesos y mosaico de canchas.
  - “Tu próximo partido” con estado Confirmado / En espera y CTA al detalle.
  - Resumen de hasta dos partidos siguientes y enlace a `/mis-partidos`.
  - Estado vacío con CTA a `/partidos`.
  - Accesos: Buscar → `/partidos`, Canchas → `/canchas`, Mapa → `/partidos?vista=mapa`.
- **`/partidos` solo búsqueda:**
  - Filtros en la URL: `deporte`, `dia`, `radio`, `orden`, `vista`, `lat`, `lng`, `cancha` y `q` para texto libre.
  - La búsqueda sobrevive recarga, atrás/adelante y se puede compartir.
  - Lista y mapa son dos vistas de la misma búsqueda.
  - Las tarjetas y los popups del mapa abren un preview rápido (drawer).
  - El preview incluye “Ver información completa”, que navega a `/partidos/[id]`.
  - Chips de filtros activos, contador y limpieza.
- **Detalle canónico:**
  - `/partidos/[id]` es el único destino de un partido.
  - `?partido=` redirige al detalle (incluido `/?partido=`).
  - La navegación principal del buscador ya no salta directo al detalle: pasa por el preview.
  - El drawer también se usa para gestionar en `/mis-partidos` y como checkout en el detalle.
- **`/canchas` y `/canchas/[id]`:**
  - Nuevo feature `venues` con lectura propia sobre un repositorio público compartido.
  - Listado con foto, deporte, dirección, distancia y partidos próximos.
  - Detalle con datos de la cancha, mapa y próximos partidos con CTA.
  - Header, footer, inicio y sitemap apuntan a `/canchas`.
- **Limpieza:**
  - Eliminados `DiscoveryView`, `DiscoveryHome`, `DiscoveryMatchesStage`, `DiscoveryVenues`, `DiscoveryPageContainer`, `PublicMatchDetailPageContainer` y `PublicMatchDetailView`.
  - Eliminados los anchors `/#partidos`, `/#canchas` y `/#como-funciona` como navegación.
  - Nuevo repositorio/mapper compartido `public-catalog` para que cada feature tenga su propio servicio de lectura.

**Verificación:**

- `pnpm build` exitoso con `/`, `/partidos`, `/partidos/[id]`, `/canchas`, `/canchas/[id]`, `/mis-partidos`, `/cuenta`, `/admin/*` y `/login`.
- `pnpm test`: 67/67.
- `npx eslint src`: 0 errores, 19 warnings (los nuevos son `<img>`).
- HTTP:
  - Anónimo: `/` → 307 `/partidos`; `/partidos` y `/canchas` → 200.
  - `?partido=` → 307 al detalle canónico.
  - IDs inválidos en `/partidos/[id]` y `/canchas/[id]` → 404.
  - ADMIN: `/` → 307 `/admin`.
- Navegador real:
  - Tarjeta → preview en drawer; “Ver información completa” → `/partidos/[id]`.
  - Popup del mapa → preview; el mismo CTA lleva al detalle.
  - Filtro `deporte=Fútbol 7` persiste tras recarga.
  - `vista=mapa` renderiza Leaflet y conserva los filtros.
  - `/canchas/[id]` muestra 2 partidos próximos y enlace filtrado a `/partidos?cancha=...`.
  - Selección de zona actualiza `lat`, `lng` y `ubicacion` en la URL.
- Revisión visual: escritorio 1440 px y móvil 390×844 en `/partidos` y `/canchas`. Falta la pasada a 375×812 y el detalle de cancha en móvil.

---

### 2.18 Separación app / admin — bloque 3 (26 de octubre de 2026)

Se eliminó `discovery`: ya no queda ninguna pieza compartida ahí. Las superficies públicas quedaron repartidas por responsabilidad.

**Features nuevos:**

- `location`: selector de ubicación, geocoder de Nominatim, utilidades geo y persistencia en `localStorage`.
- `booking`: preview + checkout (`MatchCheckoutSheet`) y las capacidades de reserva de la sesión.
- `player`: “Mis partidos” (`/mis-partidos`) con su propio servicio de lectura.

**Movimientos:**

- `DiscoveryMatchCard` → `shared/components/matches/PublicMatchCard.jsx`.
- `DiscoveryMap` y `DiscoveryMapWrapper` → `shared/components/matches/MatchesMap.jsx` y `MatchesMapWrapper.jsx`.
- `DiscoveryFilterSheet` → `match-search/components/MatchSearchFiltersSheet.jsx`.
- `DiscoveryEmpty` → `match-search/components/MatchSearchEmpty.jsx`.
- `LocationPickerDialog` y `DiscoveryLocationButton` → `location/components/` (`LocationButton`).
- `MatchCheckoutSheet` → `booking/components/`.
- `MyMatchesPageContainer`, `MyMatchesView` y `fetchMyUpcomingMatches` → `player/`.
- El test de distancias pasó a `src/__tests__/location-geo.test.js`.

**Copia y configuración repartida:**

- `shared/config/match-ui.constants.js` (`MATCH_UI`): tarjeta, mapa y CTA del checkout.
- `shared/lib/sport.js`: `getSportEmoji`.
- `location/config/location.constants.js`: storage, zonas y copia del selector.
- `match-search/config/match-search.constants.js`: radio, día, orden, vista y filtros.
- `home/config/home.constants.js`, `venues/config/venue.constants.js` y `player/config/player.constants.js`.
- Las rutas usan `ROUTES` de `shared`; se eliminó el duplicado `DISCOVERY_CONFIG.PATHS`.

**Autorización:**

- `MatchDetailPageContainer` ya no consulta permisos.
- `getBookingCapabilities(session)` en `booking/services/booking.authorization.service.js` decide `canStaffConfirm`; el bypass de staff es ahora una capacidad de `booking`.

**Decisión:** `/cuenta` sigue usando `features/profile` porque el perfil es compartido con `/admin/perfil`; `player` posee la agenda y puede absorber la cuenta cuando el perfil se separe.

**Verificación:**

- `pnpm build` exitoso con las mismas rutas.
- `pnpm test`: 67/67.
- `npx eslint src`: 0 errores, 19 warnings (solo `<img>` y hooks heredados).
- Smoke HTTP con `next start`: `/partidos` y `/canchas` → 200; `/mis-partidos` sin sesión → 307; ID inválido → 404.

---

### 2.19 Historial de partidos pasados (26 de octubre de 2026)

“Mis partidos” dejó de mostrar solo la agenda próxima.

- Dos pestañas: **Próximos** e **Historial**, con contador por pestaña.
- `findMyPastMatches` lee hasta 50 partidos pasados del jugador, más reciente primero y sin cancelados.
- `fetchMyMatches` devuelve `{ upcoming, past }` con ambas consultas en paralelo.
- Si el jugador no tiene próximos pero sí historial, la vista abre directamente en Historial.
- El historial es de solo lectura: la tarjeta enlaza a `/partidos/[id]`, sin checkout ni cancelación.
- La tarjeta pública distingue “Jugado” (pasado con inscripción) de “Finalizado” y usa un tono neutro; ya no muestra “Confirmado” en partidos cerrados.
- Se añadió `public-catalog.mapper.test.js` para el estado público de partidos pasados.
- Verificación: build OK, **70/70 tests**, lint 0 errores / 19 warnings; con sesión PLAYER `/mis-partidos` → 200 y renderiza la pestaña Historial (1 partido pasado en los datos demo).

### 2.20 Separación funcional, pases y pagos (26 de octubre de 2026)

Se cerró la separación de producto: el inicio es público, las pantallas de juego piden sesión y el jugador tiene su propio espacio de pases y pagos. El panel administrativo conserva la gestión y la conciliación.

**Acceso y superficies:**

- `/` dejó de exigir sesión. Un visitante ve bienvenida, ubicación, accesos y mosaico de canchas; las secciones personales se ocultan.
- Los accesos del inicio, las canchas del mosaico, el header, el footer y la barra inferior usan `?next=` para pedir login y volver a la ruta solicitada.
- `/partidos`, `/partidos/[id]`, `/canchas`, `/canchas/[id]` y `/mis-partidos` quedaron detrás de sesión.
- `ADMIN` y `COURT_MANAGER` son redirigidos a `/admin` desde cualquier ruta de jugador.
- Se retiraron “Descubrir” del sidebar, “Ver app pública” del dashboard y el acceso público de la barra móvil del admin.
- `robots.txt` bloquea las rutas de juego y cuenta; el sitemap solo publica `/` y `/login`.

**Cuenta, pases y pagos:**

- `/cuenta` es un hub con resumen del pase activo, acceso a “Mi pase”, “Mis pagos” y el perfil.
- `/cuenta/pases` muestra todos los pases activos, el catálogo de planes, la compra/renovación y el historial.
- La compra crea una `Transaction` con tipo `SUBSCRIPTION_PURCHASE`, método externo y estado `PENDING`. No activa el pase por sí sola.
- `/cuenta/pagos` muestra el historial del jugador con concepto, monto, método, estado, fecha y referencia.
- `/admin/pagos` lista las transacciones y permite confirmar los pagos pendientes con permiso `transactions:update`.

**Activación de pases:**

- Al confirmar una compra, el repositorio de transacciones activa o renueva el `UserSubscription` en la misma transacción de base de datos.
- Si ya existe un pase activo del mismo plan, suma los partidos y extiende la fecha; si no, crea uno nuevo.
- La duración se toma de `SUBSCRIPTION_CONFIG.DURATION_DAYS` (`BASIC_PASS` y `PRO_MONTHLY` → 30 días, `VIP_ANNUAL` → 365) y se guarda en `metadata.durationDays` al iniciar la compra.
- La confirmación también guarda `confirmedAt` y `confirmedBy` en `metadata`.

**Base de datos y permisos:**

- Migración `20261027090000_add_subscription_purchase`: agrega `SUBSCRIPTION_PURCHASE` a `PaymentType`.
- Permiso nuevo `subscriptions:purchase`, asignado a `PLAYER` y `ADMIN` por el seeder `20261027090000_caimanera-player-passes`.
- El mismo seeder crea una compra pendiente de ejemplo para María con el `Pase Básico`.

**Features nuevos o ampliados:**

- `transactions`: lectura paginada, mapper, columnas, tabla y confirmación de pagos.
- `subscriptions`: lectura de pases del jugador, compra pendiente, mapper de pases y componentes de `/cuenta/pases`.
- `payments`: historial de pagos del jugador.
- `player`: hub de cuenta.
- `home`: modo invitado.
- `routes`: `PLAYER.PASSES`, `PLAYER.PAYMENTS` y `PLAYMATCH.TRANSACTIONS`.

**Verificación:**

- `pnpm build` exitoso con `/`, `/partidos`, `/canchas`, `/mis-partidos`, `/cuenta`, `/cuenta/pases`, `/cuenta/pagos`, `/admin/pagos` y el resto del panel.
- `pnpm test`: 75/75.
- `npx eslint src`: 0 errores, 20 warnings (solo `<img>` y un warning heredado).
- Smoke HTTP anónimo: `/` → 200; `/partidos`, `/canchas` y `/cuenta/pases` → 307 a login con `next`.
- Smoke HTTP PLAYER: `/`, `/partidos`, `/canchas`, `/cuenta`, `/cuenta/pases`, `/cuenta/pagos`, `/mis-partidos` → 200; `/admin` → 307 a `/`.
- Smoke HTTP ADMIN: `/partidos`, `/canchas`, `/` y `/cuenta` → 307 a `/admin`.
- Navegador real: compra de pase desde `/cuenta/pases` → transacción pendiente visible en `/cuenta/pagos` y `/admin/pagos`; confirmación en admin → pase activo en la base de datos y estado `Completado`.

---

## 3. Estructura relevante nueva

```text
src/app/
├── (app)/
│   ├── layout.jsx
│   ├── page.jsx                 # inicio del jugador
│   ├── partidos/
│   │   ├── page.jsx             # buscador
│   │   └── [id]/page.jsx        # detalle canónico
│   ├── canchas/
│   │   ├── page.jsx             # listado de canchas
│   │   └── [id]/page.jsx        # detalle de cancha
│   ├── mis-partidos/page.jsx
│   ├── cuenta/
│   │   ├── page.jsx             # hub de cuenta
│   │   ├── pases/page.jsx       # mi pase + compra/renovación
│   │   └── pagos/page.jsx       # historial de pagos
├── (admin)/
│   └── admin/
│       ├── page.jsx
│       └── pagos/page.jsx       # transacciones + confirmación
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

src/features/home/
├── components/
│   ├── HomePageContainer.jsx
│   └── HomeView.jsx
├── config/home.constants.js
└── services/home.read.service.js

src/features/match-search/
├── components/
│   ├── MatchSearchPageContainer.jsx
│   ├── MatchSearchView.jsx
│   ├── MatchSearchFiltersSheet.jsx
│   └── MatchSearchEmpty.jsx
├── config/match-search.constants.js
├── hooks/
│   ├── use-match-search-filters.js
│   └── use-match-search-location.js
└── services/match-search.read.service.js

src/features/match-detail/
├── components/
│   ├── MatchDetailPageContainer.jsx
│   └── MatchDetailView.jsx
└── services/match-detail.read.service.js

src/features/venues/
├── components/
│   ├── VenuesPageContainer.jsx
│   ├── VenuesView.jsx
│   ├── VenueDetailPageContainer.jsx
│   ├── VenueDetailView.jsx
│   └── VenueCard.jsx
├── config/venue.constants.js
└── services/venue.read.service.js

src/features/shared/
├── config/app/
│   ├── landing.config.js      # NEXT_PUBLIC_LANDING_URL + links legales
│   └── site.config.js
├── config/match-ui.constants.js
├── components/matches/
│   ├── PublicMatchCard.jsx
│   ├── MatchesMap.jsx
│   └── MatchesMapWrapper.jsx
├── lib/sport.js
├── mappers/public-catalog.mapper.js
└── repositories/public-catalog.read.repository.js

src/features/auth/
├── components/
│   ├── LoginForm.jsx
│   └── LoginFields.jsx
├── config/auth.constants.js
├── hooks/use-auth-login.js
└── ...

src/features/location/
├── components/
│   ├── LocationButton.jsx
│   └── LocationPickerDialog.jsx
├── config/location.constants.js   # storage, zonas, copia
├── hooks/use-location.js
└── lib/
    ├── geo.js                     # distancias, orden, centro
    └── geocoder.js                # Nominatim (solo servidor)

src/features/booking/
├── components/MatchCheckoutSheet.jsx   # preview + checkout
└── services/booking.authorization.service.js

src/features/player/
├── components/
│   ├── AccountHub.jsx
│   ├── MyMatchesPageContainer.jsx
│   └── MyMatchesView.jsx
├── config/player.constants.js
└── services/player.read.service.js

src/features/matches/
├── components/MatchJoinButton.jsx
├── components/MatchDetailActions.jsx
├── repositories/match.enrollment.repository.js
└── services/match.integration.service.js

src/features/subscriptions/
├── actions/player-subscription.purchase.action.js
├── components/player/
│   ├── PlayerPassPageContainer.jsx
│   ├── PlayerPassView.jsx
│   └── PassPurchaseDialog.jsx
├── config/subscription.constants.js
├── mappers/player-subscription.mapper.js
├── repositories/
│   ├── player-subscription.read.repository.js
│   └── player-subscription.write.repository.js
├── schemas/subscription.purchase.schema.js
└── services/
    ├── player-subscription.read.service.js
    └── player-subscription.write.service.js

src/features/payments/
├── actions/match.payment.action.js
├── components/player/
│   ├── PlayerPaymentsPageContainer.jsx
│   └── PlayerPaymentsView.jsx
├── config/payment.constants.js
├── mappers/player-payment.mapper.js
├── repositories/player-payments.read.repository.js
├── schemas/payment.schema.js
└── services/
    ├── match.payment.service.js
    └── player-payments.read.service.js

src/features/transactions/
├── actions/transaction.write.action.js
├── components/
│   ├── TransactionConfirmButton.jsx
│   ├── TransactionPageContainer.jsx
│   ├── TransactionTable.jsx
│   ├── TransactionTableView.jsx
│   └── TransactionToolbar.jsx
├── config/
│   ├── transaction.columns.jsx
│   └── transaction.constants.js
├── hooks/use-transaction-table-filters.js
├── mappers/transaction.mapper.js
├── repositories/
│   ├── transaction.read.repository.js
│   └── transaction.write.repository.js
└── services/
    ├── transaction.confirmation.service.js
    └── transaction.read.service.js
```

---

## 4. Verificación actual

> Verificado el 26 de octubre de 2026 sobre el working tree del bloque 4.

### Build

```bash
pnpm build
```

Resultado: **exitoso**, sin errores. `/login`, `/robots.txt` y `/sitemap.xml` se generan como estáticas; el resto es dinámico. `/terminos` y `/privacidad` ya no existen en el mapa de rutas.

### Tests

```bash
pnpm test
```

Resultado: **75 tests aprobados / 75**.

Suites:

- Rate limiter.
- Auth mapper.
- Permission mapper.
- Safe action.
- Jerarquía.
- Fechas/timezone.
- Geo/distancia (`location-geo`).
- Catálogo público (`public-catalog.mapper`).
- Pases del jugador (`player-subscription.mapper`).
- Transacciones (`transaction.mapper`).
- Validación de partidos.
- Validación de métodos de pago.

### Lint

```bash
npx eslint src
```

Resultado: **0 errores, 20 warnings**.

Los warnings restantes son principalmente `<img>` en lugar de `next/image` y avisos menores de hooks/permisos.

### HTTP con sesión real

Probado con cookies JWT firmadas contra la base local:

| Ruta | Anónimo | PLAYER | ADMIN |
|------|---------|--------|-------|
| `/` | 200 (inicio público) | 200 (inicio) | 307 `/admin` |
| `/partidos` | 307 login | 200 | 307 `/admin` |
| `/partidos/[id]` | 307 login | 200 | 307 `/admin` |
| `/canchas` | 307 login | 200 | 307 `/admin` |
| `/canchas/[id]` | 307 login | 200 | 307 `/admin` |
| `/mis-partidos` | 307 login | 200 | 307 `/admin` |
| `/cuenta` | 307 login | 200 | 307 `/admin` |
| `/cuenta/pases` | 307 login | 200 | 307 `/admin` |
| `/cuenta/pagos` | 307 login | 200 | 307 `/admin` |
| `/admin` | 307 login | 307 `/` | 200 |
| `/admin/perfil` | 307 login | 307 `/` | 200 |
| `/admin/pagos` | 307 login | 307 `/` | 200 |
| `/terminos` | 307 `/`* | 307 `/`* | 307 `/`* |

\* Sin `NEXT_PUBLIC_LANDING_URL`. Con la variable configurada, redirige a la landing.

También se verificó que `/admin` sigue renderizando sidebar y campana con los providers montados en el layout administrativo.

---

## 5. Pruebas manuales realizadas

Con Playwright + Chrome y Brave:

- Home público en móvil (390×844) y escritorio.
- “Mis partidos” con jugador demo: inscripciones próximas e historial (1 partido pasado), pestañas y contadores.
- Apertura del detalle desde “Mis partidos” y disponibilidad de cancelación.
- Historial de “Mis partidos”: la tarjeta pasada muestra “Jugado” y abre `/partidos/[id]` sin checkout.
- Inicio público: módulo de bienvenida con ubicación integrada, módulo de accesos y mosaico de canchas, verificado en escritorio con tema oscuro.
- Bloque 2:
  - `/` con jugador demo: saludo, ubicación, accesos, “Tu próximo partido” y resumen de agenda.
  - `/partidos` sin filtros y con `deporte=Fútbol 7`; la selección persiste tras recarga.
  - `vista=mapa` con Leaflet y filtros conservados.
  - Tarjeta de partido → preview en drawer; “Ver información completa” → `/partidos/[id]`.
  - Popup del mapa → mismo preview; el botón conserva la vista de mapa al volver.
  - `/canchas` y `/canchas/[id]` con distancia, mapa y partidos próximos.
  - Enlace “Ver todos los partidos de esta cancha” → `/partidos?cancha=...`.
  - `?partido=` → redirección al detalle canónico.
  - ADMIN: `/` → `/admin`.
- Bloque 4:
  - Anónimo: `/` muestra inicio público y mosaico; “Partidos” y “Canchas” llevan a login con `next`.
  - Anónimo: `/partidos`, `/canchas` y `/cuenta/pases` redirigen a login.
  - PLAYER: `/cuenta` muestra el hub; `/cuenta/pases` muestra pases activos, planes e historial.
  - Compra de pase: `Transaction` pendiente visible en `/cuenta/pagos` y `/admin/pagos`.
  - ADMIN: confirmación del pago → transacción `Completado` y pase activo en la base de datos.
  - ADMIN: `/`, `/partidos`, `/canchas` y `/cuenta` redirigen a `/admin`.
  - Sidebar admin sin “Descubrir”; dashboard con acceso a “Revisar pagos”.
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
- Bloque 4: compra de pase, confirmación administrativa y activación en base de datos.
- Los datos de pago creados en las pruebas anteriores se limpiaron; la prueba del bloque 4 dejó una compra confirmada de Carlos y el pase asociado en la base local (ver sección 6).

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

**Origen de los datos:**

- Jugadores y encargados: `prisma/seeds/20260915095000_caimanera-demo-users.seed.js` + `prisma/seed-data/20260915095000_caimanera-demo-users.json`.
- Admin: `prisma/seeds/20260701000002_auth.seed.js` + `prisma/seed-data/admin-user.json`. La contraseña se toma de `ADMIN_PASSWORD_HASH` o `ADMIN_DEFAULT_PASSWORD`; en local el hash corresponde a `admin123`.
- Partidos, canchas, inscripciones y suscripciones: `20260915104819_caimanera-demo-data`.
- Permiso de compra de pases y compra pendiente de María: `20261027090000_caimanera-player-passes`.

**Estado de la base local después de las pruebas:**

- María conserva una compra de “Pase Básico” en `PENDING`, útil para probar `/admin/pagos`.
- La prueba manual de compra dejó a Carlos con un pase Básico adicional y una compra confirmada. El seed no crea ese registro; si se quiere una demo limpia, hay que eliminarlo o recrear la base.

> Cambiar las credenciales antes de exponer el sistema a Internet.

---

## 7. Pendientes y próximos pasos

### 7.1 Bloque 2 — separación de pantallas (COMPLETADO)

Estado: implementado el 26 de octubre de 2026. Se mantiene el alcance original como referencia de lo entregado; el detalle de cambios está en 2.17. La regla de acceso cambió después: hoy `/` es público y las pantallas de juego piden sesión (ver 2.20).

Objetivo: que `/`, `/partidos` y `/canchas` sean módulos distintos, con sus propias rutas y features, y que el detalle del partido tenga una URL canónica.

#### 7.1.1 Alcance

1. **`/` solo inicio**
   - Eliminar `stage` y la posibilidad de abrir el buscador dentro de `/`.
   - Mantener: saludo, selector de ubicación, accesos y mosaico de canchas.
   - Agregar “Tu próximo partido” (el más cercano del jugador) con estado Confirmado / En espera y CTA al detalle.
   - Agregar un resumen de 2–3 “Mis próximos partidos” con link a `/mis-partidos`.
   - Estado vacío con CTA a `/partidos`.
   - Los accesos navegan: Buscar partido → `/partidos`; Canchas → `/canchas`; Mapa → `/partidos?vista=mapa`.

2. **`/partidos` solo búsqueda**
   - Mover los filtros a la URL: `deporte`, `dia`, `radio`, `orden`, `vista`, `lat`, `lng`, `cancha`.
   - La URL debe ser compartible y sobrevivir recarga/atrás.
   - Lista y mapa como vistas de la misma búsqueda.
   - Las tarjetas y los popups del mapa abren un preview con CTA a `/partidos/[id]`.
   - Estados vacíos con acción para limpiar filtros.

3. **Detalle canónico**
   - `/partidos/[id]` es el único destino de un partido.
   - Retirar el deep link `?partido=` (o redirigirlo al detalle).
   - La tarjeta de la lista no navega directo: abre el preview y desde ahí se accede al detalle.
   - El drawer es preview en el buscador y en “Mis partidos”, y checkout en el detalle.

4. **`/canchas` y `/canchas/[id]`**
   - Nuevo feature `venues` con read service/repositorio/mapper propios.
   - Listado: foto, deporte, dirección, distancia y partidos próximos.
   - Detalle: datos de la cancha + próximos partidos con CTA a cada partido.
   - Actualizar header, footer y acceso del inicio a `/canchas`.

5. **Limpieza**
   - Nada de marketing dentro de la app.
   - No dejar anchors `/#partidos`, `/#canchas` ni `/#como-funciona` como navegación principal.

#### 7.1.2 Features objetivo

```text
src/features/
├── app-shell/     ✅ existe
├── home/          ✅ inicio del jugador
├── match-search/  ✅ buscador + filtros + mapa
├── venues/        ✅ /canchas y /canchas/[id]
├── match-detail/  ✅ detalle público
├── booking/       ✅ checkout + capacidades de reserva (bloque 3)
├── player/        ✅ mis partidos (bloque 3); cuenta sigue en `profile`
├── location/      ✅ ubicación/geocoder (bloque 3)
└── auth/          ✅ existe
```

Regla: cada módulo tiene su propio read service; si dos necesitan los mismos selectores, se comparte un helper en `shared`, nunca se importa el repositorio de otro feature. En el bloque 2 ese helper quedó en `shared/repositories/public-catalog.read.repository.js` y `shared/mappers/public-catalog.mapper.js`.

#### 7.1.3 Rutas objetivo

| Ruta | Acceso | Contenido |
|------|--------|-----------|
| `/` | Sesión (jugador) | Inicio personal |
| `/partidos` | Público | Búsqueda con filtros en URL |
| `/partidos/[id]` | Público | Detalle + checkout |
| `/canchas` | Público | Listado de canchas |
| `/canchas/[id]` | Público | Detalle de cancha |
| `/mis-partidos` | Sesión | Agenda |
| `/cuenta` | Sesión | Perfil |

> **Nota actual (bloque 4):** `/` es público; `/partidos`, `/partidos/[id]`, `/canchas`, `/canchas/[id]`, `/mis-partidos` y `/cuenta` requieren sesión. La tabla anterior describe el alcance original del bloque 2.

#### 7.1.4 Criterios de aceptación

- Un anónimo ve `/` (inicio público); un jugador ve el inicio personalizado; el staff termina en `/admin`.
- Recargar o compartir una búsqueda conserva filtros y vista.
- Tarjeta y mapa abren un preview; el botón “Ver información completa” y el link directo llevan a `/partidos/[id]`.
- `/canchas/[id]` muestra cancha y próximos partidos sin pasar por el admin.
- No quedan links internos a `/#partidos`, `/#canchas` ni `/#como-funciona`.
- `pnpm build`, `pnpm test` y `npx eslint src` siguen en verde.
- Revisión visual en móvil (390×844 / 375×812) y escritorio (1440).

#### 7.1.5 Archivos que se tocarán

`src/app/(app)/page.jsx`, `src/app/(app)/partidos/**`, `src/app/(app)/canchas/**`, `src/features/discovery/**`, `src/features/app-shell/**`, `src/features/shared/config/navigation/**`, `src/features/matches/actions/match.enroll.action.js`, `src/features/payments/actions/match.payment.action.js`, `src/features/matches/components/MatchJoinButton.jsx`.

### 7.2 Siguientes pasos funcionales (SIGUIENTE)

**Estado:** bloques 1, 1.5, 2, 3 y 4 completados. La separación de superficies está cerrada; no quedan piezas compartidas en `discovery`.

**Deuda menor antes de release:**

- Completar la revisión visual pendiente a 375×812 en `/partidos`, `/canchas/[id]`, `/cuenta/pases` y `/cuenta/pagos`.
- Confirmar `NEXT_PUBLIC_LANDING_URL` en el entorno de producción.
- Decidir si `player` absorbe `/cuenta` (hoy el perfil es compartido con `/admin/perfil` desde `features/profile`).

**Pendientes de dominio y producto:**

- Conectar el webhook real de BDT.
- Automatizar la conciliación (hoy `/admin/pagos` permite confirmar a mano).
- Manejar reembolsos y rechazos de transacciones desde el admin.
- Cobro al promover un jugador desde lista de espera.
- Notificaciones específicas de partidos.
- Mejorar perfil de jugador con nivel, confiabilidad y ubicación.
- Optimizar imágenes con `next/image`.
- Revisar módulos heredados que aún no forman parte de Caimanera.
- Pulir textos y estados vacíos restantes.

### 7.3 “Mis partidos” (completado)

Objetivo: que un jugador vea sus partidos sin entrar a `/admin`.

Implementado:
- Página `/mis-partidos` en el shell público, protegida por sesión y excluida en `robots.txt`.
- Pestaña **Próximos** con `scheduledAt >= now`; excluye partidos pasados, completados y cancelados.
- Pestaña **Historial** con los últimos 50 partidos pasados, más reciente primero y sin cancelados.
- Entrada en la barra inferior pública (Inicio, Partidos, Mis partidos, Mi cuenta), en el header de escritorio y en el pie.
- Tarjeta pública compartida, con estado **Confirmado**, **En espera**, **Jugado** o **Finalizado**.
- En próximos: preview del partido, estado de inscripción y cancelación con el mismo checkout.
- En historial: solo lectura, con enlace al detalle canónico.
- Estado vacío por pestaña, con CTA para buscar partido.
- Sin acceder al panel administrativo.

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
- **Suscripciones:** el jugador ya puede comprar y renovar pases, pero la activación depende de la confirmación manual del admin; no hay pasarela real conectada. Un jugador puede tener varios pases activos y el checkout consume el que vence primero.
- **Pagos:** el checkout crea transacciones `PENDING`; `/admin/pagos` permite confirmarlas manualmente. BDT, pago móvil, Binance y tarjeta todavía no tienen webhook; faltan rechazos y reembolsos desde el panel.
- **Compras de pase pendientes:** se crean como transacciones `PENDING` sin reservar cupo ni bloquear otra compra. Si se hacen varias compras seguidas, el admin debe confirmar cada una.
- **Lista de espera:** al promover a un jugador no se genera cobro; la regla debe definirse antes de producción.
- **Sesión:** se valida contra base de datos, pero el proxy solo verifica la firma del JWT; las páginas y acciones hacen la validación completa. El redirect de staff usa el rol del JWT; el layout admin vuelve a validar contra la base.
- **Landing sin configurar:** si `NEXT_PUBLIC_LANDING_URL` está vacía, los legales se muestran como texto sin enlaces y `/terminos` y `/privacidad` redirigen a `/`. Configurarla antes de producción.
- **Piezas compartidas:** ya no hay acoplamientos en `discovery`. La tarjeta y el mapa públicos viven en `shared/components/matches`; `booking` y `location` tienen sus propios features. `profile` sigue siendo compartido entre `/cuenta` y `/admin/perfil`.
- **Búsqueda en cliente:** `/partidos` descarga hasta 200 partidos próximos y filtra en el navegador. Si el catálogo crece, mover filtros y paginación al servidor.
- **Ubicación persistida:** la búsqueda usa `lat`/`lng` de la URL y, si no existen, la última ubicación guardada en `localStorage`. Un enlace compartido sin `lat`/`lng` depende de la ubicación del visitante.

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
node prisma/seed --only=20261027090000_caimanera-player-passes

# Base de datos
pnpm prisma generate
pnpm prisma migrate deploy
```

---

## 10. Conclusión

El sistema está en un estado **estable, compilando y con tests en verde**. La separación funcional app / admin está cerrada: `/` es el inicio público, las pantallas de juego (`/partidos`, `/canchas`, `/mis-partidos`) requieren sesión, `/partidos/[id]` es el destino canónico y el staff vive en `/admin`.

Los bloques 1, 1.5, 2, 3 y 4 dejaron `home`, `match-search`, `match-detail`, `venues`, `booking`, `location`, `player`, `subscriptions` y `transactions` con sus propios servicios y responsabilidades. El jugador ya tiene hub de cuenta, pases y pagos; el admin confirma pagos y activa o renueva pases desde `/admin/pagos`.

Lo que queda es de dominio y producto: webhook real de BDT, conciliación automática, rechazos/reembolsos, cobro al promover desde lista de espera, notificaciones de partido y mejoras de perfil. El foco inmediato de pagos sigue siendo el webhook BDT y la conciliación automática.
