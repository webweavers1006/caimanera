# Vendor Topaz SigWeb

> La tableta de firma **Topaz T-LBK462-HSB-R** (SignatureGem LCD 4x3) se integra
> vía **SigWeb**: el navegador habla con el servicio local **SigPlus ExtL**
> instalado en el equipo donde está conectada la tableta.

**Estado**: `SigWebTablet.js` (v1.0.4.0, oficial de Topaz) **ya está incluido**
en esta carpeta. Fue descargado de https://www.sigplusweb.com/SigWebTablet.js
enlace publicado en https://www.topazsystems.com/sdks/sigweb.html.

## 1. Instalar el servicio SigWeb en el equipo del funcionario (Windows)

1. Descargar el instalador oficial:
   **https://www.topazsystems.com/software/sigweb.exe** (v1.7.3.0, dic 2025).
2. Ejecutarlo en el equipo del funcionario. Instala:
   - Driver de la tableta.
   - Servicio local `SigPlusExtl` (arranca automáticamente con Windows).
3. Conectar la tableta por USB y verificar con la utilidad
   **Topaz Tablet Test**:
   https://www.topazsystems.com/software/SigWeb_Test_Utility.exe
4. Mantener el servicio actualizado con el instalador de certificados:
   https://topazsystems.com/software/sigwebcertinstaller.exe (ejecutar como admin).

## 2. Cómo se comunica la app con la tableta

- La librería consulta `http://tablet.sigwebtablet.com:47289/SigWeb/`
  (HTTP) o `:47290` (HTTPS). Ese hostname resuelve a 127.0.0.1, por lo que
  **el navegador y la tableta deben estar en el mismo equipo**.
- **Chrome 142+ y Edge 143+** muestran un aviso de *Local Network Access*:
  hay que elegir **Allow** la primera vez.
  Guía oficial: https://www.topazsystems.com/software/SigWeb_Local_Network_Access_Guide.pdf

## 3. Navegadores soportados

- Windows 10 o posterior: Chrome, Edge, Firefox, Opera.
- La firma capturada se envía al servidor como PNG base64.

## 4. Detalles técnicos del API (v1.0.4.0)

- La librería expone **funciones globales** (`GetSigImageB64`,
  `TabletConnectQuery`, `SetTabletState`, ...), NO un objeto
  `window.SigWebTablet`. El loader del feature las envuelve
  (`src/features/signature-pad/lib/sigweb-loader.js`).
- `TabletConnectQuery()` devuelve **texto** `"0"`/`"1"`.
- `GetSigImageB64(callback)` devuelve PNG base64 sin prefijo.
- `GetSigImage(ctx)` espera un **contexto 2D de canvas**, no un `<img>`.
- `IsSigWebInstalled()` detecta si el servicio local responde.
