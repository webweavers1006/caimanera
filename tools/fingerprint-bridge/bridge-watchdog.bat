@echo off
setlocal enabledelayedexpansion
rem ============================================================
rem  SAIME Fingerprint Bridge - Watchdog
rem  Keeps bridge.py alive: restarts it whenever it exits.
rem  Log: bridge.log (same folder as this script).
rem ============================================================

set "LOG=%~dp0bridge.log"

rem ── Single-instance guard ────────────────────────────────────
rem Exit only when another watchdog cmd is POSITIVELY detected.
rem PowerShell failures are tolerated (better two watchdogs than none).
set "WATCHDOGS="
for /f %%c in ('powershell -NoProfile -Command "try { (Get-CimInstance Win32_Process ^| Where-Object CommandLine -match \"bridge-watchdog\.bat\").Count } catch { 0 }" 2^>nul') do set "WATCHDOGS=%%c"
if defined WATCHDOGS (
    if !WATCHDOGS! gtr 1 (
        echo [WATCHDOG] %date% %time% Another instance already running - exiting. >> "%LOG%"
        exit /b 0
    )
)

rem ── Find a REAL, working Python ──────────────────────────────
rem Validate each candidate with -c print(1): Microsoft Store alias
rem stubs (pythonw.exe in WindowsApps) fail this test and are skipped.
set "PY="
for %%P in (pythonw.exe python.exe py.exe) do (
    if not defined PY (
        for /f "delims=" %%F in ('where %%P 2^>nul') do (
            if not defined PY (
                "%%F" -c "print(1)" >nul 2>&1
                if !errorlevel! equ 0 (
                    set "PY=%%F"
                )
            )
        )
    )
)
if not defined PY (
    echo [WATCHDOG] %date% %time% Python not found in PATH. >> "%LOG%"
    exit /b 1
)

if not exist "%~dp0bridge.py" (
    echo [WATCHDOG] %date% %time% bridge.py not found in %~dp0 >> "%LOG%"
    exit /b 1
)

echo [WATCHDOG] %date% %time% Starting bridge with: %PY% >> "%LOG%"

:loop
"%PY%" "%~dp0bridge.py" >> "%LOG%" 2>&1
echo [WATCHDOG] %date% %time% bridge exited - restarting in 3s ... >> "%LOG%"
timeout /t 3 /nobreak >nul
goto loop
