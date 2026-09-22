/**
 * Send Credentials Service — Generates random passwords, hashes them,
 * updates users in the DB, and emails credentials via SMTP (nodemailer).
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { findUsersForCredentials } from "../repositories/user.read.repository";
import { updateUserPassword } from "../repositories/user.write.repository";
import { logger } from "@/features/shared/lib/logger";

const SALT_ROUNDS = 12;
const PASSWORD_LENGTH = 12;

/** Characters safe for readability (no ambiguous chars like 0/O, 1/l/I). */
const CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";

/**
 * Generates a cryptographically secure random password.
 */
function generatePassword() {
  const bytes = crypto.randomBytes(PASSWORD_LENGTH * 2);
  let password = "";
  for (let i = 0; i < PASSWORD_LENGTH; i++) {
    password += CHARS[bytes[i] % CHARS.length];
  }
  return password;
}

function buildCredentialsEmail({ userName, roleName, email, password, loginUrl }) {
  return {
    subject: "Caimanera — Credenciales de acceso",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#222">
        <h2 style="margin:0 0 8px">Hola ${userName}</h2>
        <p>Se han generado tus credenciales de acceso a <strong>Caimanera</strong>.</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0">
          <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Rol</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${roleName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Correo</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e2e8f0"><strong>Contraseña</strong></td><td style="padding:8px;border:1px solid #e2e8f0">${password}</td></tr>
        </table>
        <p><a href="${loginUrl}" style="display:inline-block;padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">Iniciar sesión</a></p>
        <p style="color:#888;font-size:12px">Por seguridad, cambia tu contraseña al iniciar sesión.</p>
      </div>`,
  };
}

async function sendMail({ to, subject, html }) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return { success: false, error: "SMTP no configurado." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Caimanera"}" <${process.env.SMTP_FROM_ADDRESS || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    logger.error("SMTP send failed", { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Sends credentials to one or more users.
 *
 * @param {Object} options
 * @param {string[]} [options.userIds] - Specific user UUIDs to send to. Omit for ALL active users.
 * @param {string} options.actorUserId - UUID of the admin triggering the send.
 * @param {string} options.loginUrl - Base URL for the login link in the email.
 * @returns {Promise<{success: boolean, results: Array, summary?: string, error?: string}>}
 */
export async function sendCredentials({ userIds, actorUserId, loginUrl }) {
  let users;
  try {
    users = await findUsersForCredentials(userIds);
  } catch (error) {
    logger.error("Failed to fetch users for credentials", { error: error.message });
    return { success: false, error: "No se pudieron obtener los usuarios.", results: [] };
  }

  if (users.length === 0) {
    return { success: false, error: "No se encontraron usuarios activos para enviar credenciales.", results: [] };
  }

  const results = [];

  for (const user of users) {
    const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Usuario";
    const roleName = user.role?.name || "Usuario";
    const plainPassword = generatePassword();

    if (!user.email) {
      results.push({
        userId: user.id,
        email: null,
        userName,
        success: false,
        error: "El usuario no tiene un correo electrónico registrado.",
      });
      continue;
    }

    // 1. Hash + update password in DB
    try {
      const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      await updateUserPassword(user.id, passwordHash);
    } catch (error) {
      logger.error("Failed to update password for user", { userId: user.id, error: error.message });
      results.push({
        userId: user.id,
        email: user.email,
        userName,
        success: false,
        error: "Error al actualizar la contraseña.",
      });
      continue;
    }

    // 2. Build + send email
    const { subject, html } = buildCredentialsEmail({
      userName,
      roleName,
      email: user.email,
      password: plainPassword,
      loginUrl: loginUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
    });
    const smtpResult = await sendMail({ to: user.email, subject, html });

    results.push({
      userId: user.id,
      email: user.email,
      userName,
      success: smtpResult.success,
      error: smtpResult.error || null,
    });
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  logger.info("Credentials batch send completed", {
    total: results.length,
    succeeded,
    failed,
    actorUserId,
  });

  return {
    success: failed === 0,
    results,
    summary: `${succeeded} enviado(s), ${failed} fallido(s) de ${results.length} total.`,
  };
}
