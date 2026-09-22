#!/bin/bash
set -e
# ==============================================================================
# make-dist.sh — Build distributable fingerprint bridge package
#
# Output: dist/saime-fingerprint-bridge.zip with platform-specific folders
# ==============================================================================

DIST_DIR="$(cd "$(dirname "$0")" && pwd)/dist"
INSTALL_DIR="$(cd "$(dirname "$0")" && pwd)"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/package/macos/native/macos"
mkdir -p "$DIST_DIR/package/windows/native/windows"
mkdir -p "$DIST_DIR/package/linux/native/linux"

echo "============================================"
echo "  SAIME Fingerprint Bridge — Build Dist"
echo "============================================"
echo ""

# ── Shared files (platform-independent) ──────────────────
echo "📋 Copying shared files..."
SHARED="$DIST_DIR/package"
cp "$INSTALL_DIR/bridge.py"              "$SHARED/"
cp "$INSTALL_DIR/futronic_api.py"        "$SHARED/"
cp "$INSTALL_DIR/finger_crop.py"         "$SHARED/"
cp "$INSTALL_DIR/futronic-capture.cpp"   "$SHARED/"
cp "$INSTALL_DIR/requirements.txt"       "$SHARED/"
cp "$INSTALL_DIR/generate-tls.py"        "$SHARED/"
cp "$INSTALL_DIR/wsq-compress.py"        "$SHARED/" 2>/dev/null || true
cp "$INSTALL_DIR/test-windows.bat"       "$SHARED/" 2>/dev/null || true
cp "$INSTALL_DIR/ws-check.py"            "$SHARED/" 2>/dev/null || true
echo "   ✅ bridge.py, futronic_api.py, finger_crop.py, generate-tls.py, requirements.txt, test-windows.bat"

# ── macOS ──────────────────────────────────────────────────
echo ""
echo "🍎 Building macOS package..."
MAC="$DIST_DIR/package/macos"
cp "$INSTALL_DIR/install.sh" "$MAC/"
chmod +x "$MAC/install.sh"

if [ -f "$INSTALL_DIR/native/macos/libScanAPI.dylib" ]; then
    cp "$INSTALL_DIR/native/macos/libScanAPI.dylib" "$MAC/native/macos/"
    g++ -std=c++17 -O2 -Wall \
        -o "$MAC/futronic-capture" \
        "$INSTALL_DIR/futronic-capture.cpp" \
        "$INSTALL_DIR/native/macos/libScanAPI.dylib" \
        -Wl,-rpath,"@loader_path/native/macos" \
        && echo "   ✅ macOS: libScanAPI.dylib + futronic-capture"
fi

# ── Windows ────────────────────────────────────────────────
echo ""
echo "🪟 Building Windows package..."
WIN="$DIST_DIR/package/windows"
cp "$INSTALL_DIR/install.bat" "$WIN/"
cp "$INSTALL_DIR/update.bat" "$WIN/"
cp "$INSTALL_DIR/bridge-watchdog.bat" "$WIN/" 2>/dev/null || true
cp "$INSTALL_DIR/bridge-watchdog.vbs" "$WIN/" 2>/dev/null || true

if [ -f "$INSTALL_DIR/native/windows/ftrScanAPI.dll" ]; then
    cp "$INSTALL_DIR/native/windows/ftrScanAPI.dll" "$WIN/native/windows/"
    cp "$INSTALL_DIR/native/windows/FTRAPI.dll"     "$WIN/native/windows/"
    # Also copy ftrScanAPI.dll next to the .exe so Windows can find it
    cp "$INSTALL_DIR/native/windows/ftrScanAPI.dll" "$WIN/"
    echo "   ✅ Windows: ftrScanAPI.dll + FTRAPI.dll"

    # Copy pre-compiled .exe (cross-compiled from macOS via mingw-w64)
    if [ -f "$INSTALL_DIR/native/windows/futronic-capture.exe" ]; then
        cp "$INSTALL_DIR/native/windows/futronic-capture.exe" "$WIN/"
        echo "   ✅ Windows: futronic-capture.exe (pre-compiled)"
    else
        echo "   ⚠️  futronic-capture.exe not pre-compiled — run: make cross-compile-windows"
    fi
fi

# ── Linux ──────────────────────────────────────────────────
echo ""
echo "🐧 Building Linux package..."
LIN="$DIST_DIR/package/linux"
cp "$INSTALL_DIR/install.sh" "$LIN/"
chmod +x "$LIN/install.sh"

if [ -f "$INSTALL_DIR/native/linux/libScanAPI.so" ]; then
    cp "$INSTALL_DIR/native/linux/libScanAPI.so"   "$LIN/native/"
    cp "$INSTALL_DIR/native/linux/libFTRAPI.so"    "$LIN/native/" 2>/dev/null || true
    g++ -std=c++17 -O2 -Wall \
        -o "$LIN/futronic-capture" \
        "$INSTALL_DIR/futronic-capture.cpp" \
        "$INSTALL_DIR/native/linux/libScanAPI.so" \
        -Wl,-rpath,'$ORIGIN/native' \
        && echo "   ✅ Linux: libScanAPI.so + futronic-capture"
else
    echo "   ⚠️  Linux .so not found — add Futronic SDK for Linux"
fi

# ── Create archive ─────────────────────────────────────────
echo ""
ZIP_NAME="saime-fingerprint-bridge.zip"
cd "$DIST_DIR"
zip -r "$ZIP_NAME" package/ > /dev/null
SIZE=$(du -sh "$ZIP_NAME" | cut -f1)

# ── Copy to public/downloads/ ──────────────────────────────
PUBLIC_DIR="$INSTALL_DIR/../../public/downloads"
mkdir -p "$PUBLIC_DIR"
cp "$DIST_DIR/$ZIP_NAME" "$PUBLIC_DIR/"
echo "   📁 public/downloads/$ZIP_NAME"

echo ""
echo "============================================"
echo "  ✅ Distribution package built! ($SIZE)"
echo ""
echo "  📦 $DIST_DIR/$ZIP_NAME"
echo "  🌐 /downloads/$ZIP_NAME"
echo ""
echo "  Structure:"
echo "    package/"
echo "    ├── bridge.py, futronic_api.py (shared)"
echo "    ├── macos/    → install.sh + futronic-capture"
echo "    ├── windows/  → install.bat + futronic-capture.exe"
echo "    └── linux/    → install.sh + futronic-capture"
echo ""
echo "  On the operator PC:"
echo "    macOS:   cd macos && ./install.sh --origin=..."
echo "    Windows: cd windows && install.bat --origin=..."
echo "============================================"
