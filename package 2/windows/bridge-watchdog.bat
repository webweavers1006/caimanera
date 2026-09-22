@echo off
rem ============================================================
rem  SAIME Fingerprint Bridge - Watchdog
rem  Keeps bridge.py alive: restarts it whenever it exits.
rem  Log: bridge.log (same folder as this script).
rem ============================================================

rem Single-instance guard: if another watchdog is already looping, quit.
powershell -NoProfile -Command "exit ((Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'bridge-watchdog\.bat' }).Count -gt 1)"
if %errorlevel% neq 0 exit /b 0

set "PY="
where pythonw >nul 2>&1 && set "PY=pythonw"
if not defined PY where python >nul 2>&1 && set "PY=python"
if not defined PY where py >nul 2>&1 && set "PY=py"
if not defined PY (
    echo [WATCHDOG] Python not found in PATH. > "%~dp0bridge.log"
    exit /b 1
)

if not exist "%~dp0bridge.py" (
    echo [WATCHDOG] bridge.py not found in %~dp0 > "%~dp0bridge.log"
    exit /b 1
)

echo [WATCHDOG] Starting bridge with %PY% ... >> "%~dp0bridge.log"

:loop
"%PY%" "%~dp0bridge.py" >> "%~dp0bridge.log" 2>&1
echo [WATCHDOG] bridge exited - restarting in 3s ... >> "%~dp0bridge.log"
timeout /t 3 /nobreak >nul
goto loop
