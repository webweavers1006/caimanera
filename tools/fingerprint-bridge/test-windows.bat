@echo off
setlocal enabledelayedexpansion
echo ============================================================
echo   SAIME Fingerprint Bridge — Windows Test Suite
echo ============================================================
echo.
echo   Fecha: %DATE% %TIME%
echo   Equipo: %COMPUTERNAME%
echo.

set "PASS=0"
set "FAIL=0"
set "SKIP=0"

:: ── Helper: test runner ──────────────────────────────
goto :main

:ok
set /a PASS+=1
echo    [OK] %~1
exit /b 0

:bad
set /a FAIL+=1
echo    [FAIL] %~1
exit /b 0

:skip
set /a SKIP+=1
echo    [SKIP] %~1
exit /b 0

:main

:: ─────────────────────────────────────────────────────
:: Test 1: Architecture check
:: ─────────────────────────────────────────────────────
echo [1] System architecture
echo ----------------------------------------
echo    OS: %OS%
for /f "tokens=2 delims=:" %%a in ('systeminfo ^| find "System Type"') do echo    Type:%%a
for /f "tokens=2 delims=:" %%a in ('systeminfo ^| find "Processor" ^| find /v "s"') do echo    CPU:%%a
echo.

:: ─────────────────────────────────────────────────────
:: Test 2: Python version
:: ─────────────────────────────────────────────────────
echo [2] Python
echo ----------------------------------------
set "PYTHON="
python --version >nul 2>&1 && set PYTHON=python
if "%PYTHON%"=="" python3 --version >nul 2>&1 && set PYTHON=python3
if "%PYTHON%"=="" py --version >nul 2>&1 && set PYTHON=py

if "%PYTHON%"=="" (
    call :bad "Python not found"
    goto :test3
)

for /f "tokens=*" %%a in ('%PYTHON% --version 2^>^&1') do echo    %%a
for /f "tokens=*" %%a in ('%PYTHON% -c "import platform; print(platform.architecture()[0])" 2^>^&1') do echo    Arch: %%a
call :ok "Python: %PYTHON%"

:: Check required pip packages
echo    Checking packages...
%PYTHON% -c "import websockets" 2>nul && call :ok "websockets" || call :bad "websockets NOT installed (run: pip install websockets)"
%PYTHON% -c "import asyncio" 2>nul && call :ok "asyncio" || call :bad "asyncio NOT available"
echo.

:test3

:: ─────────────────────────────────────────────────────
:: Test 3: Native binary (futronic-capture.exe)
:: ─────────────────────────────────────────────────────
echo [3] Native capture binary
echo ----------------------------------------
set "BRIDGE_DIR=%~dp0"
set "EXE=%BRIDGE_DIR%futronic-capture.exe"
set "DLL=%BRIDGE_DIR%ftrScanAPI.dll"

if not exist "%EXE%" (
    call :bad "futronic-capture.exe NOT found at %EXE%"
    goto :test4
)
echo    Binary: %EXE%
for %%a in ("%EXE%") do echo    Size: %%~za bytes
call :ok "futronic-capture.exe present"

:: Check DLL next to exe
if exist "%DLL%" (
    echo    DLL: %DLL%
    for %%a in ("%DLL%") do echo    Size: %%~za bytes
    call :ok "ftrScanAPI.dll next to .exe"
) else (
    call :bad "ftrScanAPI.dll NOT next to .exe (Windows won't find it)"
)

:: Try to run the .exe — should fail with "ERROR: open" (no scanner) but NOT "missing DLL"
echo    Running futronic-capture.exe (expecting ERROR: open)...
for /f "tokens=*" %%a in ('"%EXE%" 2^>^&1') do set "CAP_OUT=%%a"
echo    Output: !CAP_OUT!

echo !CAP_OUT! | findstr /i "ERROR" >nul
if !errorlevel! equ 0 (
    echo !CAP_OUT! | findstr /i "DLL\|missing\|not found\|0xc0000135\|0xc000007b" >nul
    if !errorlevel! equ 0 (
        call :bad "DLL error — Windows cannot find the Futronic library"
    ) else (
        call :ok "Binary runs (expected error: no scanner connected)"
    )
) else (
    call :skip "Unexpected output — may need scanner connected"
)
echo.

:test4

:: ─────────────────────────────────────────────────────
:: Test 4: WebSocket port availability
:: ─────────────────────────────────────────────────────
echo [4] Port 3002 availability
echo ----------------------------------------
netstat -ano | findstr ":3002" >nul
if !errorlevel! equ 0 (
    echo   [WARN] Port 3002 is IN USE — another process may be running
    netstat -ano | findstr ":3002"
    call :skip "Port 3002 already in use"
) else (
    call :ok "Port 3002 is free"
)
echo.

:: ─────────────────────────────────────────────────────
:: Test 5: Bridge startup test
:: ─────────────────────────────────────────────────────
echo [5] Bridge startup test (5-second smoke test)
echo ----------------------------------------
if "%PYTHON%"=="" (
    call :skip "No Python — cannot test bridge"
    goto :test6
)
if not exist "%BRIDGE_DIR%bridge.py" (
    call :bad "bridge.py NOT found at %BRIDGE_DIR%"
    goto :test6
)

echo    Starting bridge in background for 5 seconds...
start "SAIME-Bridge-Test" /MIN %PYTHON% "%BRIDGE_DIR%bridge.py"
:: Wait for startup
timeout /t 4 /nobreak >nul

:: Check if it's running
netstat -ano | findstr ":3002.*LISTENING" >nul
if !errorlevel! equ 0 (
    call :ok "Bridge is listening on port 3002"
) else (
    call :bad "Bridge did NOT start listening on port 3002"
)

:: Check for crash log
if exist "%BRIDGE_DIR%bridge.log" (
    echo    Last 3 lines of bridge.log:
    for /f "tokens=*" %%a in ('type "%BRIDGE_DIR%bridge.log" 2^>nul ^| findstr /v "^$"') do echo       %%a
)

:: Kill the test bridge
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002.*LISTENING"') do (
    echo    Stopping test bridge (PID %%a)...
    taskkill /PID %%a /F >nul 2>&1
)
echo.

:test6

:: ─────────────────────────────────────────────────────
:: Test 6: TLS certificate check
:: ─────────────────────────────────────────────────────
echo [6] TLS Certificate
echo ----------------------------------------
set "CERT_DIR=%BRIDGE_DIR%certs"
if exist "%CERT_DIR%\bridge.crt" (
    call :ok "bridge.crt present"
) else (
    call :skip "No TLS certificate (bridge will use ws://)"
)
if exist "%CERT_DIR%\bridge.key" (
    call :ok "bridge.key present"
)
echo.

:: ─────────────────────────────────────────────────────
:: Test 7: Environment
:: ─────────────────────────────────────────────────────
echo [7] Environment
echo ----------------------------------------
if exist "%BRIDGE_DIR%.env.bridge" (
    echo    .env.bridge found:
    type "%BRIDGE_DIR%.env.bridge"
    call :ok ".env.bridge configured"
) else (
    call :skip "No .env.bridge (all origins allowed)"
)

:: Check if bridge is installed as a startup service
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\saime-bridge.vbs" (
    call :ok "Auto-start .vbs present"
) else (
    echo    Auto-start .vbs NOT found in Startup folder
    echo    Run install.bat to set up auto-start on login.
)

:: Check if bridge is installed via install.bat
if exist "%APPDATA%\SAIME\FingerprintBridge\bridge.py" (
    echo    Installed at: %APPDATA%\SAIME\FingerprintBridge\
    call :ok "FingerprintBridge installed via install.bat"
)
echo.

:: ─────────────────────────────────────────────────────
:: Summary
:: ─────────────────────────────────────────────────────
echo ============================================================
echo   RESULTS SUMMARY
echo ============================================================
echo   [OK] Passed:  %PASS%
echo   [FAIL] Failed:  %FAIL%
echo   [SKIP] Skipped: %SKIP%
echo.
if %FAIL% gtr 0 (
    echo   [WARN] Some tests failed. Review the items above.
    echo       Common fixes:
    echo       - Run install.bat to set up from scratch
    echo       - Install Python 3.11+ from https://python.org
    echo       - Run: pip install websockets
    echo       - Make sure ftrScanAPI.dll is next to futronic-capture.exe
) else (
    echo   [OK] All critical tests passed!
    echo       The bridge is ready to connect scanners.
    echo       Start it permanently by running install.bat
)
echo ============================================================

endlocal
pause
