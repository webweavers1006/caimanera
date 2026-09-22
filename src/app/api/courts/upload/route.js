/**
 * POST /api/courts/upload
 *
 * Stores a court photo locally under /public/uploads/canchas and returns
 * its public URL. Requires an authenticated session with courts:update.
 */

import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getSession } from "@/features/auth/lib/auth";
import { verifyPermission } from "@/features/permissions/services/permission.authorization.service";
import { logger } from "@/features/shared";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const allowed = await verifyPermission(session.role, "courts:update");
    if (!allowed) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const name = file.name || "foto.jpg";
    const ext = "." + name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json({ error: "Formato no permitido" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "La imagen supera los 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${crypto.randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "canchas");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/canchas/${fileName}` });
  } catch (error) {
    logger.error("Court photo upload failed", { error: error.message });
    return NextResponse.json({ error: "No se pudo subir la foto." }, { status: 500 });
  }
}
