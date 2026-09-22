# Fingerprint Bridge — Futronic Scanner

Servidor WebSocket local que conecta el escáner de huellas Futronic con el sistema SAIME.

## Arquitectura (3 capas)

```
Navegador (Next.js)  ←WebSocket→  Python Bridge (bridge.py)  ←subprocess→  C++ Binary (futronic-capture)
                                                                              ↓
                                                                     Futronic SDK (.dylib/.dll)
```

- **bridge.py**: Servidor WebSocket asyncio. Recibe comandos JSON, spawns el binario C++.
  Sirve `ws://` en el puerto 3003 y `wss://` en el puerto 3002 (cuando hay certificados TLS).
- **futronic-capture**: Binario nativo que abre el dispositivo, captura/stream, y devuelve los datos crudos.
- **futronic_api.py**: Wrappers ctypes para diagnóstico (`open_device`, `close_device`, `get_status`). La captura real va directa por el binario.

## Requisitos

- Python 3.11+
- Escáner Futronic conectado por USB
- Windows: el binario `futronic-capture.exe` y `ftrScanAPI.dll` vienen pre-compilados
- macOS: el binario `futronic-capture` se compila durante `install.sh` (requiere Xcode CLI)

## Instalación

### Windows
```cmd
install.bat
```

### macOS / Linux
```bash
chmod +x install.sh
./install.sh
```

## Uso manual (desarrollo)

```bash
pip install -r requirements.txt
python bridge.py
# → ws://127.0.0.1:3003  (siempre disponible — páginas HTTP / desarrollo)
# → wss://127.0.0.1:3002 (si hay certificados TLS — páginas HTTPS / producción)
# → ws://127.0.0.1:3002  (si NO hay certificados — compatibilidad)
```

## Comandos WebSocket

| Comando | Descripción |
|---|---|
| `{"action":"status"}` | Estado del bridge y escáner |
| `{"action":"open"}` | Abrir escáner (diagnóstico) |
| `{"action":"close"}` | Cerrar escáner |
| `{"action":"capture"}` | Capturar imagen de huella |
| `{"action":"live_start"}` | Iniciar stream de vista previa |
| `{"action":"live_stop"}` | Detener stream |

## Respuestas

```json
{"status":"ok", "image":"ffd8...", "size":153600, "width":320, "height":480}
{"status":"error", "msg":"no finger detected"}
```

## Formato de frames (stdout del binario nativo)

El binario emite cada imagen con un marcador para que el bridge pueda
re-sincronizar aunque el SDK inyecte bytes extra en stdout:

```
[FRD1][uint16_le width][uint16_le height][uint32_le size][raw bytes]
```

- SDK Futronic: usar la versión reciente (13.12+) — la 13.4 escribe bytes
  basura en stdout y corrompe el framing.
- En Windows, todas las funciones del SDK son `__stdcall` (ver `FTR_API`
  en `futronic-capture.cpp`).
- El SDK oficial de Futronic (ejemplo `ftrScanApiEx_v4.5`, disponible en
  futronic-tech.com) incluye `LiveFinger2.dll` (vista previa renderizada
  por el SDK) — alternativa a explorar para mejorar la calidad visual del
  preview. No está incluido en este repo.
- **Dosis de captura configurable**: variable `FTR_DOSE` en `.env.bridge` o
  el entorno. Controla la dosis de `ftrScanGetImage` (captura clásica de un
  solo frame, la misma vía que usaba el PIAC Desktop): `1` = más oscura,
  `7` = más clara; por defecto `2`. En Windows se usa `ftrScanGetImage` con
  dosis fija (GetFrame devuelve ruido del sensor); en macOS se usa
  `ftrScanGetFrame` con los parámetros por defecto del dispositivo.
- **`ftrScanGetImage2` descartado**: la `ftrScanAPI.dll` del paquete no lo
  exporta (el exe fallaría al cargar con "entry point not found") y su
  captura adaptativa producía huellas dobles/sobreexpuestas en el FS88H.
  Tras detectar el dedo, la captura espera 300 ms para que el dedo se
  asiente y no salga "doble" (el sensor leía con el dedo en movimiento).

## Soporte FS64 (tenprint livescan)

Además del FS88H (single-finger, 480×320), el puente soporta el FS64
(tenprint, frame 1600×1500). El dispositivo se detecta automáticamente por
el tamaño del frame (módulo `finger_crop.py`) y se post-procesa:

- **Vista previa en vivo**: el frame completo se reduce a 480 px de ancho
  (filtro LANCZOS) antes de enviarse, con dimensiones constantes — el
  frontend no cambia. (La app puede prescindir del live: ver
  `LIVE_PREVIEW_ENABLED`.)
- **Captura final**: el frame completo se envía **sin modificar**, idéntico
  a la salida de `futronic-capture.exe --dose-scan` (sin recortes ni ajustes
  de contraste). El bridge lo marca con `"raw": true` y el navegador lo
  muestra tal cual.
- **Preview de alta calidad (`preview`)**: junto con la captura completa,
  el bridge envía un `preview` LANCZOS de ~640 px de ancho (recortado a la
  zona del dedo) para que el navegador lo muestre 1:1. El navegador no
  puede reducir 1600 px de surcos a 500 DPI en un solo paso sin producir
  rayas/moiré; `preview` es solo para mostrar — la imagen almacenada sigue
  siendo el frame completo (`image`).
- **Espera de captura lista (`FTR_READY_GATE`)**: desactivada por defecto.
  Probado en campo con ambos dispositivos (FS88H y FS64): los drivers de
  Windows alternan entre `move`/`ignore` y nunca reportan `FTR_CAPTURE_READY`
  (además, el polling degrada la captura del FS88H). Sin la espera, la
  captura dispara justo después del asentamiento de 800 ms — igual que
  `--dose-scan`. Si algún día un driver sí reporta READY, activar con
  `FTR_READY_GATE=all` (o `1`) en `.env.bridge`; timeout con
  `FTR_READY_TIMEOUT_MS` (por defecto 12000 ms).
- **Transferencia por archivo (`--out`)**: la captura individual ya NO viaja
  por stdout. El SDK inyecta ~25 bytes de basura en stdout en Windows, que
  desplazaban cada fila de la imagen y producían la "doble huella". Ahora el
  binario escribe el BMP a un archivo temporal y el puente lo lee directo —
  byte-exacto e inmune a inyecciones. El stream en vivo sigue por stdout con
  doble marcador FRD1 (cabecera + inicio de datos) para re-sincronizar.
- **Puerta de estabilidad (FS88H, opcional)**: desactivada por defecto. El
  escaneo simple del FS88H es confiable y los escaneos consecutivos degradan
  su salida. Si una estación muestra huellas fantasma por movimiento, activar
  con `FTR_STABILITY=1` en `.env.bridge` (captura frames consecutivos y solo
  acepta cuando son casi idénticos; el log muestra `STABLE: attempt=N mad=X`).
- El FS88H y cualquier dispositivo pequeño usan el mismo camino (frames
  nativos, sin `preview`): el navegador muestra la captura cruda recortada
  al dedo, sin estiramiento de contraste — visualmente idéntica a la
  captura del terminal.
- Requiere `Pillow` (ya en `requirements.txt`). Si no está instalado, los
  frames grandes se envían completos (sin regresión, solo más tráfico).
- **Calibración FS64**: ejecutar `futronic-capture.exe --dose-scan` en la
  estación y fijar la dosis elegida con `FTR_DOSE_FS64=N` en `.env.bridge`
  (toma precedencia sobre `FTR_DOSE` en frames grandes). Si la estación
  también tiene FS88H, calibrar cada uno por separado: `FTR_DOSE` aplica al
  FS88H.

### Diagnóstico de paridad: captura web vs dose-scan

Para verificar byte a byte que la captura del sistema es idéntica a la
prueba de dosis (mismo dispositivo, misma DLL, misma dosis):

1. Captura única del binario: `futronic-capture.exe` ahora también guarda
   `capture-raw.bmp` junto al exe.
2. Con `FTR_SAVE_CAPTURE=1` en `.env.bridge` (y puente reiniciado), cada
   captura web guarda `capture-bridge.bmp` con los bytes exactos que el
   puente recibe del binario.
3. Comparar en la PC del punto:
   ```cmd
   fc /b capture-raw.bmp dose-scan\dose-2.bmp
   fc /b capture-bridge.bmp capture-raw.bmp
   ```
   - `capture-raw.bmp` ≠ `dose-N.bmp` → la diferencia entra en el binario
     (revisar dosis: `bridge.log` muestra `GetImage OK (dose N)`).
   - `capture-bridge.bmp` ≠ `capture-raw.bmp` → la diferencia entra en el
     puente (bug de parsing).
   - Los tres idénticos → la diferencia es solo visualización del navegador
     (app web desactualizada o escalado CSS).

## Plataformas

| OS | Librería nativa | Captura | Matching |
|---|---|---|---|
| macOS | `native/macos/libScanAPI.dylib` | Binario C++ | Server-side (NBIS) |
| Windows | `native/windows/ftrScanAPI.dll` | Binario C++ pre-compilado | Server-side (NBIS) |
| Linux | `native/linux/libScanAPI.so` | Binario C++ | Server-side (NBIS) |

## Build del binario nativo

```bash
# macOS (nativo)
g++ -std=c++17 -O2 -Wall -o futronic-capture futronic-capture.cpp \
    native/macos/libScanAPI.dylib -Wl,-rpath,"@loader_path/native/macos"
```

```powershell
# Windows — usa build-windows.ps1 (toolchain winlibs i686 posix)
.\build-windows.ps1
# Equivale a:
i686-w64-mingw32-g++ -std=c++17 -O2 -mstackrealign -static -static-libgcc -static-libstdc++ \
    -o native/windows/futronic-capture.exe futronic-capture.cpp \
    native/windows/ftrScanAPI.dll
```

> **Importante**: usar `-static` — el binario queda autocontenido y no requiere
> `libwinpthread-1.dll` ni `libgcc_s_dw2-1.dll` en la máquina destino.

### Diagnóstico de dosis (Windows)

Cuando la imagen en Windows no se ve como en macOS (quemada, oscura o
"doble"), ejecuta el binario en modo diagnóstico:

```cmd
futronic-capture.exe --dose-scan
```

Captura una imagen por cada dosis (1-7), esperando 800 ms a que el dedo se
asiente en cada una, y guarda los resultados como BMP en
`dose-scan\dose-N.bmp`. Abre las 7 imágenes, elige la que más se parezca a
la captura de macOS y fija esa dosis con `FTR_DOSE=N` en `.env.bridge`.

## Build del paquete de distribución

```bash
./make-dist.sh
# → dist/saime-fingerprint-bridge.zip
# → public/downloads/saime-fingerprint-bridge.zip
```
