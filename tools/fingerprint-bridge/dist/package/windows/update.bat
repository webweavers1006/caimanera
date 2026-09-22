@echo off
setlocal enabledelayedexpansion
echo ============================================
echo   SAIME Fingerprint Bridge - Updater
echo   (agrega soporte FS64 / finger_crop.py)
echo ============================================
echo.

:: ── Install directory ─────────────────────────
set "INSTALL_DIR=%APPDATA%\SAIME\FingerprintBridge"
:: Shared files are in the parent directory
set "SHARED_DIR=%~dp0.."

:: ── Verify a previous installation exists ─────
if not exist "%INSTALL_DIR%\bridge.py" (
    echo [ERROR] No previous installation found in:
    echo         %INSTALL_DIR%
    echo         Run install.bat first.
    pause
    exit /b 1
)

:: ── Verify the package files are next to this updater ──
if not exist "%SHARED_DIR%\finger_crop.py" (
    echo [ERROR] finger_crop.py not found next to this updater.
    echo         Extract the full saime-fingerprint-bridge package
    echo         and run update.bat from package\windows\
    pause
    exit /b 1
)

:: ── Stop everything: watchdog first, then the bridge ──
echo [STOP] Stopping watchdog...
taskkill /F /IM wscript.exe >nul 2>&1
echo [STOP] Stopping bridge processes...
taskkill /F /IM futronic-capture.exe >nul 2>&1
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^pythonw?\.exe$' -and $_.CommandLine -match 'bridge\.py' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>&1
timeout /t 2 /nobreak >nul

:: ── Copy updated files (bridge.py + new finger_crop.py) ──
echo [COPY] Updating bridge files...
copy /Y "%SHARED_DIR%\bridge.py"         "%INSTALL_DIR%\" >nul
copy /Y "%SHARED_DIR%\futronic_api.py"   "%INSTALL_DIR%\" >nul
copy /Y "%SHARED_DIR%\finger_crop.py"    "%INSTALL_DIR%\" >nul
copy /Y "%SHARED_DIR%\requirements.txt"  "%INSTALL_DIR%\" >nul
echo    [OK] bridge.py, futronic_api.py, finger_crop.py, requirements.txt

:: ── Check Python (same detection as install.bat) ──
set PYTHON_CMD=
python --version >nul 2>&1 && set PYTHON_CMD=python
if "%PYTHON_CMD%"=="" python3 --version >nul 2>&1 && set PYTHON_CMD=python3
if "%PYTHON_CMD%"=="" py --version >nul 2>&1 && set PYTHON_CMD=py

if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python not found.
    pause
    exit /b 1
)

echo [OK] Python found:
%PYTHON_CMD% --version

:: ── Install/update dependencies (adds Pillow) ──
echo.
echo [PKG] Installing dependencies...
cd /d "%INSTALL_DIR%"
%PYTHON_CMD% -m pip install -r "%INSTALL_DIR%\requirements.txt"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

:: ── Restart the bridge (watchdog keeps it alive) ──
echo.
echo [RUN] Restarting bridge...
start "" wscript.exe "%INSTALL_DIR%\bridge-watchdog.vbs"

echo.
echo ============================================
echo   [OK] Bridge updated.
echo.
echo   NOT modified:
echo     - TLS certificates
echo     - Origin config ^(.env.bridge^)
echo     - Startup shortcut
echo.
echo   Log: %INSTALL_DIR%\bridge.log
echo ============================================
pause
