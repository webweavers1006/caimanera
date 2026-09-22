/**
 * PM2 Ecosystem Configuration — Admin Starter
 *
 * ⚠️  SECURITY: This file is committed to git.
 *     NEVER put secrets (JWT_SECRET, DATABASE_URL) here.
 *
 * ✅  Secrets must come from SYSTEM ENVIRONMENT VARIABLES:
 *     - /etc/environment (all users)
 *     - ~/.bashrc / ~/.zshrc (current user)
 *     - Docker / systemd EnvironmentFile
 *     - Cloud Secret Manager (AWS, Vault, Doppler)
 *
 *     PM2 inherits system env vars automatically.
 *
 * 📋  Required env vars for production:
 *     NODE_ENV=production
 *     JWT_SECRET=<min 32 chars, generate with: openssl rand -base64 32>
 *     DATABASE_URL=postgresql://user:pass@host:5432/db
 */
module.exports = {
  apps: [
    {
      name: "admin-starter",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      // --use-system-ca makes Node.js trust the OS certificate store (macOS Keychain,
      // Windows cert store, Linux /etc/ssl). Required for corporate SMTP servers that
      // use internal CAs not included in Node's bundled Mozilla CA store.
      node_args: "--use-system-ca --max-old-space-size=4096",
      restart_delay: 10000,
      autorestart: true,
      watch: false,
      // Only non-sensitive defaults — secrets come from the system
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
