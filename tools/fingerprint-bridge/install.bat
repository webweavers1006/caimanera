@echo off
setlocal enabledelayedexpansion
echo ============================================
echo   SAIME Fingerprint Bridge - Installer
echo ============================================
echo.

:: ── Parse arguments ───────────────────────────
set ORIGIN=
:parse
if "%~1"=="" goto :parsedone
if "%~1"=="--origin" (
    set ORIGIN=%~2
    shift
    shift
    goto :parse
)
shift
goto :parse
:parsedone

:: ── Install directory ─────────────────────────
set "INSTALL_DIR=%APPDATA%\SAIME\FingerprintBridge"
:: Shared files are in the parent directory
set "SHARED_DIR=%~dp0.."

:: ── Production origin ─────────────────────────
if "%ORIGIN%"=="" (
    if exist "%INSTALL_DIR%\.env.bridge" (
        for /f "tokens=2 delims==" %%a in ('findstr BRIDGE_ALLOWED_ORIGINS "%INSTALL_DIR%\.env.bridge" 2^>nul') do set ORIGIN=%%a
    )
)
if "%ORIGIN%"=="" (
    echo ADVERTENCIA: No se especifico el dominio de produccion.
    echo El puente aceptara conexiones de cualquier origen.
    echo Para restringir: install.bat --origin=https://siac.saime.gob.ve
    echo.
) else (
    echo Origen permitido: %ORIGIN%
    if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
    set "ENV_FILE=%INSTALL_DIR%\.env.bridge"
    if exist "%ENV_FILE%" (
        findstr /V /I /B /C:"BRIDGE_ALLOWED_ORIGINS=" "%ENV_FILE%" > "%ENV_FILE%.tmp"
        echo BRIDGE_ALLOWED_ORIGINS=%ORIGIN%>> "%ENV_FILE%.tmp"
        move /Y "%ENV_FILE%.tmp" "%ENV_FILE%" >nul
    ) else (
        echo BRIDGE_ALLOWED_ORIGINS=%ORIGIN%> "%ENV_FILE%"
    )
    echo    [OK] .env.bridge actualizado ^(preserva FTR_DOSE y otras claves^)
)

:: ── Check Python (32-bit required for scanner DLLs) ──
set PYTHON_CMD=
python --version >nul 2>&1 && set PYTHON_CMD=python
if "%PYTHON_CMD%"=="" python3 --version >nul 2>&1 && set PYTHON_CMD=python3
if "%PYTHON_CMD%"=="" py --version >nul 2>&1 && set PYTHON_CMD=py

if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python not found.
    echo.
    echo    Trying to install via winget...
    winget install -e --id Python.Python.3.11 --silent >nul 2>&1
    if %errorlevel% equ 0 (
        echo    [OK] Python 3.11 installed. Please restart this script.
    ) else (
        echo    [ERROR] Could not auto-install. Install manually:
        echo       https://python.org - Download Python 3.11+
        echo       During install, check "Add Python to PATH"
    )
    pause
    exit /b 1
)

echo [OK] Python found:
%PYTHON_CMD% --version

:: ── Stop previous bridge (frees ports and locked files) ──
echo.
echo [STOP] Stopping previous bridge (if running)...
taskkill /F /IM futronic-capture.exe >nul 2>&1
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^pythonw?\.exe$' -and $_.CommandLine -match 'bridge\.py' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>&1

:: ── Install to AppData ─────────────────────────
echo.
echo [DIR] Installing to %INSTALL_DIR%...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
xcopy /E /Y /Q "%~dp0*" "%INSTALL_DIR%\" >nul

:: ── Copy shared files ─────────────────────────
echo [COPY] Copying shared files...
if exist "%SHARED_DIR%\bridge.py" (
    copy /Y "%SHARED_DIR%\bridge.py" "%INSTALL_DIR%\" >nul
    copy /Y "%SHARED_DIR%\futronic_api.py" "%INSTALL_DIR%\" >nul
    copy /Y "%SHARED_DIR%\finger_crop.py" "%INSTALL_DIR%\" >nul
    copy /Y "%SHARED_DIR%\requirements.txt" "%INSTALL_DIR%\" >nul
    echo    [OK] bridge.py, futronic_api.py, finger_crop.py, requirements.txt
)
if exist "%SHARED_DIR%\generate-tls.py" (
    copy /Y "%SHARED_DIR%\generate-tls.py" "%INSTALL_DIR%\" >nul
    echo    [OK] generate-tls.py
)
if exist "%~dp0generate-tls.py" (
    copy /Y "%~dp0generate-tls.py" "%INSTALL_DIR%\" >nul
)

:: ── Python dependencies ────────────────────────
echo.
echo [PKG] Installing dependencies...
cd /d "%INSTALL_DIR%"
%PYTHON_CMD% -m pip install -r "%INSTALL_DIR%\requirements.txt"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

:: ── TLS certificate ────────────────────────────
echo.
echo [TLS] Setting up TLS certificate for wss://...
set "CERT_DIR=%INSTALL_DIR%\certs"
if not exist "%CERT_DIR%" mkdir "%CERT_DIR%"
set "CERT_FILE=%CERT_DIR%\bridge.crt"
set "KEY_FILE=%CERT_DIR%\bridge.key"

if not exist "%CERT_FILE%" (
    :: Install cryptography (needed by generate-tls.py)
    echo    [PKG] Installing cryptography...
    %PYTHON_CMD% -m pip install cryptography
    if !errorlevel! neq 0 (
        echo    [WARN] No se pudo instalar cryptography ^(sin internet?^).
        echo           Sin el certificado, las paginas HTTPS no podran
        echo           conectar con wss://. Reintente install.bat con red.
    )

    :: Generate cert + private key (PEM) via Python
    echo    [TLS] Generating certificate + private key...
    %PYTHON_CMD% "%INSTALL_DIR%\generate-tls.py" --cert-dir "%CERT_DIR%"
    if !errorlevel! neq 0 (
        echo    [WARN] Could not generate TLS cert. Bridge will use ws://
    )
)

:: Verify BOTH files exist (cert without key = TLS off)
if exist "%CERT_FILE%" if exist "%KEY_FILE%" (
    :: Trust the certificate so browsers accept wss://
    powershell -NoProfile -Command "Import-Certificate -FilePath '%CERT_FILE%' -CertStoreLocation 'Cert:\CurrentUser\Root' | Out-Null" >nul 2>&1
    :: Verify the import actually landed in the user's root store
    set "CERT_TRUSTED=0"
    powershell -NoProfile -Command "$t=(New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 -ArgumentList '%CERT_FILE%').Thumbprint; if (Test-Path ('Cert:\CurrentUser\Root\' + $t)) { exit 0 } else { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 set "CERT_TRUSTED=1"
    if "!CERT_TRUSTED!"=="1" (
        echo    [OK] TLS certificate + key ready, trusted in Windows store
    ) else (
        echo    [WARN] El certificado NO quedo confiable en el almacen raiz.
        echo           Los navegadores rechazaran wss:// en paginas HTTPS.
        echo           Importalo a mano: doble clic en bridge.crt -^>
        echo           "Instalar certificado" -^> "Usuario actual" -^>
        echo           "Entidades de certificacion raiz de confianza".
        echo           Nota: Firefox usa su propio almacen, importalo ahi tambien.
    )
) else (
    echo    [WARN] TLS incomplete (missing bridge.crt or bridge.key)
    echo    [INFO] Bridge will run on ws:// — browsers on HTTPS pages need wss://
)

:: ── Copy pre-compiled native capture binary ──────
echo.
echo [BUILD] Installing native capture binary...
set "NATIVE_DIR=%~dp0native\windows"
set "EXE_SRC=%~dp0futronic-capture.exe"
set "EXE_DST=%INSTALL_DIR%\futronic-capture.exe"
set "DLL_SRC=%~dp0ftrScanAPI.dll"

:: Try the exe next to install.bat first, then native\windows\
if not exist "%EXE_SRC%" set "EXE_SRC=%NATIVE_DIR%\futronic-capture.exe"

if exist "%EXE_SRC%" (
    copy /Y "%EXE_SRC%" "%EXE_DST%" >nul
    echo    [OK] futronic-capture.exe installed ^(pre-compiled^)
) else (
    echo    [WARN] futronic-capture.exe not found
    echo    [INFO] The bridge will attempt to use it from the source directory.
)

:: Copy DLL next to the .exe so Windows can find it at runtime
if not exist "%DLL_SRC%" set "DLL_SRC=%NATIVE_DIR%\ftrScanAPI.dll"
if exist "%DLL_SRC%" (
    copy /Y "%DLL_SRC%" "%INSTALL_DIR%\" >nul
    echo    [OK] ftrScanAPI.dll copied next to .exe
) else (
    echo    [WARN] ftrScanAPI.dll not found
)

:: ── Auto-start on login: HKCU Run key + Startup folder (dual) ──
echo [AUTOSTART] Registering auto-start...
set "VBS_PATH=%INSTALL_DIR%\bridge-watchdog.vbs"
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "SAIMEBridge" /t REG_SZ /d "wscript.exe \"%VBS_PATH%\"" /f >nul
if !errorlevel! equ 0 (
    echo    [OK] Run key registered ^(auto-start on login^)
) else (
    echo    [WARN] No se pudo registrar en el registro.
)

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "VBS=%STARTUP%\saime-bridge.vbs"
echo Set WshShell = CreateObject("WScript.Shell") > "%VBS%"
echo p = WshShell.ExpandEnvironmentStrings("%%APPDATA%%\SAIME\FingerprintBridge\bridge-watchdog.bat") >> "%VBS%"
echo WshShell.Run "cmd.exe /c """ ^& p ^& """", 0, False >> "%VBS%"
echo    [OK] Startup shortcut created ^(backup^)

:: ── Start the bridge now (watchdog keeps it alive) ──────────
echo.
echo [RUN] Starting bridge now...
start "" wscript.exe "%INSTALL_DIR%\bridge-watchdog.vbs"

:: ── Verify the bridge actually came up ───────────────────────
echo [VERIFY] Waiting 6 seconds to verify the bridge is listening...
timeout /t 6 /nobreak >nul

set "LISTENING=0"
netstat -ano | findstr "LISTENING" | findstr ":3002 :3003" >nul
if !errorlevel! equ 0 set "LISTENING=1"

if "!LISTENING!"=="1" (
    echo    [OK] El puente esta escuchando en 127.0.0.1:3002/3003
) else (
    echo    [WARN] El puente aun no escucha. Reintento directo...
    start "" /MIN "%INSTALL_DIR%\bridge-watchdog.bat"
    timeout /t 6 /nobreak >nul
    netstat -ano | findstr "LISTENING" | findstr ":3002 :3003" >nul
    if !errorlevel! equ 0 (
        echo    [OK] El puente esta escuchando en 127.0.0.1:3002/3003
    ) else (
        echo    [ERROR] El puente NO arranco automaticamente.
        echo    Ultimas lineas de %INSTALL_DIR%\bridge.log:
        for /f "usebackq delims=" %%L in (`powershell -NoProfile -Command "Get-Content '%INSTALL_DIR%\bridge.log' -Tail 10" 2^>nul`) do echo       %%L
        echo.
        echo    Si el log esta vacio, el watchdog no encontro Python util:
        echo    - Instala Python 3.11 de https://python.org y marca
        echo      "Add Python to PATH", luego re-ejecuta install.bat.
        echo    Prueba manual: %PYTHON_CMD% "%INSTALL_DIR%\bridge.py"
    )
)

echo.
echo ============================================
echo   [OK] Installation complete!
echo.
echo   El puente se inicia solo en cada login
echo   ^(registro Run + carpeta Inicio^) y se
echo   reinicia automaticamente si se cae.
echo.
echo   Log: %INSTALL_DIR%\bridge.log
echo ============================================
pause
