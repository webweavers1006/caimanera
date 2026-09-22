# Build futronic-capture.exe on Windows with MinGW (i686, static).
#
# Usage (PowerShell):
#   .\build-windows.ps1
#
# The script looks for the toolchain in:
#   1. $env:MINGW_I686_BIN (path to the bin/ dir of an i686 MinGW toolchain)
#   2. %LOCALAPPDATA%\mingw-i686\mingw32\bin (winlibs layout)
#
# Everything except the Futronic SDK is linked statically, so the resulting
# exe only depends on ftrScanAPI.dll (and system DLLs).

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src  = Join-Path $root "futronic-capture.cpp"
$dll  = Join-Path $root "native\windows\ftrScanAPI.dll"
$out  = Join-Path $root "native\windows\futronic-capture.exe"

if (-not (Test-Path $dll)) { throw "ftrScanAPI.dll not found at $dll" }

$bin = $env:MINGW_I686_BIN
if (-not $bin) {
    $candidate = "$env:LOCALAPPDATA\mingw-i686\mingw32\bin"
    if (Test-Path (Join-Path $candidate "i686-w64-mingw32-g++.exe")) { $bin = $candidate }
}
if (-not $bin -or -not (Test-Path (Join-Path $bin "i686-w64-mingw32-g++.exe"))) {
    throw @"
Toolchain not found. Download winlibs i686 (posix) from
https://github.com/brechtsanders/winlibs_mingw/releases and extract it, then set:
  `$env:MINGW_I686_BIN = '...\mingw32\bin'
"@
}

$gpp = Join-Path $bin "i686-w64-mingw32-g++.exe"
Write-Host "[BUILD] $src"
& $gpp -std=c++17 -O2 -Wall -mstackrealign -static -static-libgcc -static-libstdc++ `
    -o $out $src $dll
if ($LASTEXITCODE -ne 0) { throw "g++ failed with exit code $LASTEXITCODE" }
Write-Host "[OK] $out"
