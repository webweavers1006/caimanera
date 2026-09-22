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
    echo BRIDGE_ALLOWED_ORIGINS=%ORIGIN%> "%INSTALL_DIR%\.env.bridge"
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
    copy /Y "%SHARED_DIR%\requirements.txt" "%INSTALL_DIR%\" >nul
    echo    [OK] bridge.py, futronic_api.py, requirements.txt
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
    %PYTHON_CMD% -m pip install cryptography --quiet 2>nul

    :: Generate cert + private key (PEM) via Python
    echo    [TLS] Generating certificate + private key...
    %PYTHON_CMD% "%INSTALL_DIR%\generate-tls.py" --cert-dir "%CERT_DIR%"
    if %errorlevel% neq 0 (
        echo    [WARN] Could not generate TLS cert. Bridge will use ws://
    )
)

:: Verify BOTH files exist (cert without key = TLS off)
if exist "%CERT_FILE%" if exist "%KEY_FILE%" (
    :: Trust the certificate so browsers accept wss://
    powershell -Command ^
        "Import-Certificate -FilePath '%CERT_FILE%' -CertStoreLocation 'Cert:\CurrentUser\Root' | Out-Null" >nul 2>&1
    echo    [OK] TLS certificate + key ready, trusted in Windows store
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

:: ── Startup watchdog (auto-start on login + auto-restart) ──
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "VBS=%STARTUP%\saime-bridge.vbs"
echo Set WshShell = CreateObject("WScript.Shell") > "%VBS%"
echo p = WshShell.ExpandEnvironmentStrings("%%APPDATA%%\SAIME\FingerprintBridge\bridge-watchdog.bat") >> "%VBS%"
echo WshShell.Run "cmd.exe /c """ ^& p ^& """", 0, False >> "%VBS%"
echo.
echo [OK] Startup watchdog created ^(auto-start on login + auto-restart^)

:: ── Start the bridge now (watchdog keeps it alive) ──────────
echo.
echo [RUN] Starting bridge now...
start "" wscript.exe "%INSTALL_DIR%\bridge-watchdog.vbs"

echo.
echo ============================================
echo   [OK] Installation complete!
echo.
echo   The bridge is starting now in the
   background and restarts automatically
   if it ever stops.
echo.
echo   Log: %INSTALL_DIR%\bridge.log
echo.
echo   It also starts automatically on every
   login to Windows.
echo ============================================
pause
