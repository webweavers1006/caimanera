/**
 * GET /api/users
 *
 * Generates and downloads a users report (PDF or Excel).
 * Accepts the same filter params as the users admin page.
 *
 * Query params:
 *   ?format=pdf  (default) — PDF report (landscape, 5 cols)
 *   ?format=xlsx           — Excel report (mirrors PDF layout)
 *
 * Architecture: API route → action → service → repository → mapper
 */

import { NextResponse } from "next/server";
import { generateUsersPdfAction } from "@/features/users/actions/user.pdf.action";
import { generateUsersExcelAction } from "@/features/users/actions/user.excel.action";
import { logger } from "@/features/shared";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const format = searchParams.get("format") || "pdf";

    const filters = {
      searchTerm: searchParams.get("q") || "",
      status: searchParams.get("status") || "",
      roleId: searchParams.get("roleId") || "",
      officeId: searchParams.get("officeId") || "",
      directionId: searchParams.get("directionId") || "",
      dateFrom: searchParams.get("dateFrom") || "",
      dateTo: searchParams.get("dateTo") || "",
      userIds: searchParams.get("userIds") ? searchParams.get("userIds").split(",") : undefined,
    };

    // ── Excel branch ─────────────────────────────────────────────────────
    if (format === "xlsx") {
      const result = await generateUsersExcelAction(filters);

      if (!result.success) {
        const status = result.error === "No autorizado" ? 401
          : result.error === "Acceso denegado" ? 403
          : 500;
        return NextResponse.json({ error: result.error }, { status });
      }

      const today = new Date().toISOString().slice(0, 10);
      const filename = `reporte_usuarios_${today}.xlsx`;

      const buffer = result.data;
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "no-store, max-age=0",
          "Referrer-Policy": "no-referrer",
        },
      });
    }

    // ── PDF branch (default) ─────────────────────────────────────────────
    const result = await generateUsersPdfAction(filters);

    if (!result.success) {
      const status = result.error === "No autorizado" ? 401
        : result.error === "Acceso denegado" ? 403
        : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    const today = new Date().toISOString().slice(0, 10);
    const filename = `reporte_usuarios_${today}.pdf`;

    const buffer = result.data;
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store, max-age=0",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    logger.error("API users report error", { error: error.message });
    return NextResponse.json(
      { error: "Error al generar el reporte de usuarios." },
      { status: 500 }
    );
  }
}
