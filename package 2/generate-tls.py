#!/usr/bin/env python3
"""
TLS certificate generator for the Fingerprint Bridge.

Generates a self-signed certificate + private key in PEM format:
  certs/bridge.crt
  certs/bridge.key

The certificate includes SAN entries for localhost and 127.0.0.1
(required by Chrome/Edge, CN-only certs are rejected).

Usage:
  python generate-tls.py [--cert-dir certs]

Requires the `cryptography` package:
  pip install cryptography
"""

import argparse
import datetime
import ipaddress
import sys
from pathlib import Path

try:
    from cryptography import x509
    from cryptography.x509.oid import NameOID
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
except ImportError:
    print("[ERROR] The 'cryptography' package is not installed.")
    print("        Run: pip install cryptography")
    sys.exit(1)


def generate(cert_dir: Path):
    cert_dir.mkdir(parents=True, exist_ok=True)
    cert_file = cert_dir / "bridge.crt"
    key_file = cert_dir / "bridge.key"

    if cert_file.exists() and key_file.exists():
        print(f"[OK] TLS certificate already exists: {cert_file}")
        return cert_file, key_file

    print("[TLS] Generating self-signed certificate (10 years)...")

    # RSA 2048 private key
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    name = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, "127.0.0.1"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "SAIME Fingerprint Bridge"),
    ])

    now = datetime.datetime.now(datetime.timezone.utc)
    cert = (
        x509.CertificateBuilder()
        .subject_name(name)
        .issuer_name(name)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - datetime.timedelta(minutes=5))
        .not_valid_after(now + datetime.timedelta(days=3650))
        .add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName("localhost"),
                x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
            ]),
            critical=False,
        )
        .sign(key, hashes.SHA256())
    )

    # Write PEM files
    cert_file.write_bytes(cert.public_bytes(serialization.Encoding.PEM))
    key_file.write_bytes(
        key.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.TraditionalOpenSSL,
            serialization.NoEncryption(),
        )
    )
    # Restrict key permissions on POSIX
    try:
        key_file.chmod(0o600)
    except (OSError, PermissionError):
        pass

    print(f"[OK] Certificate: {cert_file}")
    print(f"[OK] Private key: {key_file}")
    print("[INFO] Trust the certificate in the OS store so the browser accepts wss://")
    return cert_file, key_file


def main():
    parser = argparse.ArgumentParser(description="Generate bridge TLS certificate")
    parser.add_argument(
        "--cert-dir",
        default=str(Path(__file__).parent / "certs"),
        help="Directory for bridge.crt and bridge.key (default: ./certs)",
    )
    args = parser.parse_args()

    try:
        generate(Path(args.cert_dir))
    except Exception as e:
        print(f"[ERROR] TLS generation failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
