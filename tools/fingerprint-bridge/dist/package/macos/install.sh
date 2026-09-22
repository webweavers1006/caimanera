#!/bin/bash
set -e

# Install directory (platform-specific folder: macos/, linux/)
INSTALL_DIR="$(cd "$(dirname "$0")" && pwd)"
# Shared files are in the parent directory
SHARED_DIR="$(cd "$INSTALL_DIR/.." && pwd)"

# ── Parse arguments ─────────────────────────────────────────
ORIGIN=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --origin)
            ORIGIN="$2"
            shift 2
            ;;
        --origin=*)
            ORIGIN="${1#*=}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

echo "============================================"
echo "  SAIME Fingerprint Bridge - Installer"
echo "============================================"
echo ""

# ── Production origin ───────────────────────────────────────
if [ -z "$ORIGIN" ]; then
    if [ -f "$INSTALL_DIR/.env.bridge" ]; then
        ORIGIN=$(grep BRIDGE_ALLOWED_ORIGINS "$INSTALL_DIR/.env.bridge" 2>/dev/null | cut -d= -f2- || true)
    fi
fi

if [ -z "$ORIGIN" ]; then
    echo "⚠️  No se especificó el dominio de producción."
    echo "   El puente aceptará conexiones de cualquier origen."
    echo "   Para restringir: ./install.sh --origin=https://siac.saime.gob.ve"
    echo ""
else
    echo "🔐 Origen permitido: $ORIGIN"
    echo "BRIDGE_ALLOWED_ORIGINS=$ORIGIN" > "$INSTALL_DIR/.env.bridge"
fi

# ── Copy shared files to platform folder ───────────────────
echo "📋 Copying shared files..."
if [ -d "$SHARED_DIR" ] && [ "$SHARED_DIR" != "$INSTALL_DIR" ]; then
    cp "$SHARED_DIR/bridge.py"         "$INSTALL_DIR/" || echo "   ⚠️  bridge.py not found"
    cp "$SHARED_DIR/futronic_api.py"   "$INSTALL_DIR/" || echo "   ⚠️  futronic_api.py not found"
    cp "$SHARED_DIR/finger_crop.py"    "$INSTALL_DIR/" || echo "   ⚠️  finger_crop.py not found"
    cp "$SHARED_DIR/requirements.txt"  "$INSTALL_DIR/" || echo "   ⚠️  requirements.txt not found"
    cp "$SHARED_DIR/futronic-capture.cpp" "$INSTALL_DIR/" 2>/dev/null || true
    cp "$SHARED_DIR/futronic-capture"     "$INSTALL_DIR/" 2>/dev/null || true
    chmod +x "$INSTALL_DIR/futronic-capture" 2>/dev/null || true
    echo "   ✅ Shared files copied"
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Install it first."
    exit 1
fi
echo "✅ $(python3 --version)"

# ── Generate self-signed certificate for wss:// ──────────────────
CERT_DIR="$INSTALL_DIR/certs"
CERT_FILE="$CERT_DIR/bridge.crt"
KEY_FILE="$CERT_DIR/bridge.key"

echo ""
echo "🔒 Setting up TLS certificate for wss://..."
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    openssl req -x509 -newkey rsa:2048 -nodes \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -days 3650 \
        -subj "/CN=127.0.0.1/O=SAIME Fingerprint Bridge" \
        -addext "subjectAltName=IP:127.0.0.1,DNS:localhost" \
        2>/dev/null

    # Trust the certificate in the OS keychain
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERT_FILE" 2>/dev/null || true
        echo "   ✅ Certificate trusted (macOS Keychain)"
    elif [[ "$OSTYPE" == "linux"* ]]; then
        sudo cp "$CERT_FILE" /usr/local/share/ca-certificates/saime-bridge.crt 2>/dev/null || \
        sudo cp "$CERT_FILE" /etc/ssl/certs/saime-bridge.crt 2>/dev/null || true
        sudo update-ca-certificates 2>/dev/null || true
        echo "   ✅ Certificate trusted (Linux)"
    fi
    echo "   ✅ TLS certificate generated (10 years validity)"
else
    echo "   ✅ TLS certificate already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
python3 -m venv "$INSTALL_DIR/.venv"
source "$INSTALL_DIR/.venv/bin/activate"
# requirements.txt is in the shared parent directory
if [ -f "$SHARED_DIR/requirements.txt" ]; then
    pip install -r "$SHARED_DIR/requirements.txt"
elif [ -f "$INSTALL_DIR/requirements.txt" ]; then
    pip install -r "$INSTALL_DIR/requirements.txt"
else
    echo "   ⚠️  requirements.txt not found — installing websockets directly"
    pip install "websockets>=13.0"
fi

# Compile the native capture binary (if not already pre-compiled)
echo ""
echo "🔨 Checking native capture binary..."
if [ -f "$INSTALL_DIR/futronic-capture" ] && [ -x "$INSTALL_DIR/futronic-capture" ]; then
    echo "   ✅ Pre-compiled binary found — skipping compilation"
else
    echo "   ⚠️  Binary not found. Trying to compile..."

    # Try to auto-install build tools
    if ! command -v g++ &> /dev/null; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "   📦 Installing Xcode Command Line Tools..."
            xcode-select --install 2>/dev/null || true
            echo "   ⚠️  If a dialog appeared, complete the installation and re-run this script."
            echo "   ℹ️  Or install manually: xcode-select --install"
            exit 1
        elif [[ "$OSTYPE" == "linux"* ]]; then
            echo "   📦 Trying to install g++..."
            if command -v sudo &> /dev/null; then
                sudo apt update -qq 2>/dev/null && sudo apt install -y -qq g++ 2>/dev/null || true
            fi
            if ! command -v g++ &> /dev/null; then
                echo "   ❌ Could not install g++. Install manually: sudo apt install g++"
                exit 1
            fi
        fi
    fi

    # Compile
    CPP_FILE="$SHARED_DIR/futronic-capture.cpp"
    if [ ! -f "$CPP_FILE" ]; then
        CPP_FILE="$INSTALL_DIR/futronic-capture.cpp"
    fi
    if [[ "$OSTYPE" == "darwin"* ]]; then
        g++ -std=c++17 -O2 -Wall -o "$INSTALL_DIR/futronic-capture" "$CPP_FILE" \
            "$INSTALL_DIR/native/macos/libScanAPI.dylib" -Wl,-rpath,"$INSTALL_DIR/native/macos" \
            && echo "   ✅ Compiled (macOS)"
    elif [[ "$OSTYPE" == "linux"* ]]; then
        g++ -std=c++17 -O2 -Wall -o "$INSTALL_DIR/futronic-capture" "$CPP_FILE" \
            "$INSTALL_DIR/native/linux/libScanAPI.so" -Wl,-rpath,"$INSTALL_DIR/native/linux" \
            && echo "   ✅ Compiled (Linux)"
    fi
fi

# Install LaunchAgent (macOS) or systemd service (Linux)

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: LaunchAgent
    PLIST="$HOME/Library/LaunchAgents/com.saime.fingerprint-bridge.plist"
    cat > "$PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.saime.fingerprint-bridge</string>
    <key>ProgramArguments</key>
    <array>
        <string>$INSTALL_DIR/.venv/bin/python</string>
        <string>$INSTALL_DIR/bridge.py</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$INSTALL_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$HOME/Library/Logs/saime-bridge.log</string>
    <key>StandardErrorPath</key>
    <string>$HOME/Library/Logs/saime-bridge.log</string>
</dict>
</plist>
EOF
    launchctl unload "$PLIST" 2>/dev/null || true
    launchctl load "$PLIST"
    echo "✅ LaunchAgent restarted (auto-start on login)"

elif [[ "$OSTYPE" == "linux"* ]]; then
    # Linux: systemd user service
    mkdir -p "$HOME/.config/systemd/user"
    SERVICE="$HOME/.config/systemd/user/saime-bridge.service"
    cat > "$SERVICE" << EOF
[Unit]
Description=SAIME Fingerprint Bridge
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/.venv/bin/python $INSTALL_DIR/bridge.py
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
EOF
    systemctl --user daemon-reload
    systemctl --user enable saime-bridge
    systemctl --user start saime-bridge
    echo "✅ systemd service installed (auto-start on login)"
fi

echo ""
echo "============================================"
echo "  ✅ Installation complete!"
echo ""
if [ -f "$CERT_DIR/bridge.crt" ] && [ -f "$CERT_DIR/bridge.key" ]; then
    echo "  The bridge runs on wss://127.0.0.1:3002 (TLS enabled)"
else
    echo "  The bridge runs on ws://127.0.0.1:3002"
fi
echo "  It starts automatically when you log in."
echo "============================================"
