# ==============================================================================
# make-dist.ps1 — Build distributable fingerprint bridge package (Windows)
#
# PowerShell equivalent of make-dist.sh (Git Bash on Windows lacks `zip`).
#
# Output: dist/saime-fingerprint-bridge.zip + copy to public/downloads/
# ==============================================================================

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $root "dist"
$package = Join-Path $distDir "package"

# ── Clean + structure ──────────────────────────────────────
if (Test-Path $distDir) { Remove-Item $distDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path "$package/macos/native/macos" | Out-Null
New-Item -ItemType Directory -Force -Path "$package/windows/native/windows" | Out-Null
New-Item -ItemType Directory -Force -Path "$package/linux/native/linux" | Out-Null

Write-Host "`n  SAIME Fingerprint Bridge - Build Dist (PowerShell)`n"

# ── Shared files (platform-independent) ────────────────────
Write-Host "Copying shared files..."
$sharedFiles = @(
    "bridge.py",
    "futronic_api.py",
    "finger_crop.py",
    "futronic-capture.cpp",
    "requirements.txt",
    "generate-tls.py",
    "wsq-compress.py",
    "test-windows.bat",
    "ws-check.py"
)
foreach ($f in $sharedFiles) {
    if (Test-Path (Join-Path $root $f)) {
        Copy-Item (Join-Path $root $f) $package
    }
}
Write-Host "   OK: $($sharedFiles -join ', ')"

# ── macOS ──────────────────────────────────────────────────
$mac = "$package/macos"
Copy-Item "$root/install.sh" $mac -ErrorAction SilentlyContinue
if (Test-Path "$root/native/macos/libScanAPI.dylib") {
    Copy-Item "$root/native/macos/libScanAPI.dylib" "$mac/native/macos/"
    Write-Host "   macOS: libScanAPI.dylib copied (binary must be built on macOS)"
} else {
    Write-Host "   macOS: SDK dylib not found - skipped (as in make-dist.sh)"
}

# ── Windows ────────────────────────────────────────────────
$win = "$package/windows"
Copy-Item "$root/install.bat" $win
Copy-Item "$root/update.bat" $win
Copy-Item "$root/bridge-watchdog.bat" $win -ErrorAction SilentlyContinue
Copy-Item "$root/bridge-watchdog.vbs" $win -ErrorAction SilentlyContinue

if (Test-Path "$root/native/windows/ftrScanAPI.dll") {
    Copy-Item "$root/native/windows/ftrScanAPI.dll" "$win/native/windows/"
    Copy-Item "$root/native/windows/FTRAPI.dll" "$win/native/windows/" -ErrorAction SilentlyContinue
    # Also copy ftrScanAPI.dll next to the .exe so Windows can find it
    Copy-Item "$root/native/windows/ftrScanAPI.dll" $win
    Write-Host "   Windows: ftrScanAPI.dll + FTRAPI.dll"

    if (Test-Path "$root/native/windows/futronic-capture.exe") {
        Copy-Item "$root/native/windows/futronic-capture.exe" $win
        Write-Host "   Windows: futronic-capture.exe (pre-compiled)"
    } else {
        Write-Host "   WARN: futronic-capture.exe not found - build it first"
    }
}

# ── Linux ──────────────────────────────────────────────────
$lin = "$package/linux"
Copy-Item "$root/install.sh" $lin -ErrorAction SilentlyContinue
if (Test-Path "$root/native/linux/libScanAPI.so") {
    Copy-Item "$root/native/linux/libScanAPI.so" "$lin/native/"
    Copy-Item "$root/native/linux/libFTRAPI.so" "$lin/native/" -ErrorAction SilentlyContinue
    Write-Host "   Linux: .so copied (binary must be built on Linux)"
} else {
    Write-Host "   Linux: SDK .so not found - skipped (as in make-dist.sh)"
}

# -- Create archive ------------------------------------------------------
# Compress $distDir itself so entries keep the "package/" prefix,
# matching the layout produced by make-dist.sh (`zip -r ... package/`).
# The zip is built in the temp folder first: .NET cannot create it inside
# the directory being compressed (it would lock itself).
$zipPath = Join-Path $distDir "saime-fingerprint-bridge.zip"
$zipTmp = Join-Path ([System.IO.Path]::GetTempPath()) "saime-fingerprint-bridge.zip"
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
if (Test-Path $zipTmp) { Remove-Item $zipTmp -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($distDir, $zipTmp)
Move-Item -Force $zipTmp $zipPath
$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)

# ── Copy to public/downloads/ ──────────────────────────────
$publicDir = Join-Path (Split-Path -Parent $root) "..\public\downloads"
$publicDir = [System.IO.Path]::GetFullPath($publicDir)
New-Item -ItemType Directory -Force -Path $publicDir | Out-Null
Copy-Item $zipPath $publicDir -Force

Write-Host "`n  ============================================"
Write-Host "  OK: Distribution package built! ($sizeMB MB)"
Write-Host "  ZIP: $zipPath"
Write-Host "  WEB: $publicDir\saime-fingerprint-bridge.zip"
Write-Host "  ============================================"
