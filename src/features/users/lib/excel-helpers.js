/**
 * excel-helpers.js
 * Reusable Excel rendering primitives for the users report.
 * Uses exceljs server-side. Follows the same visual style as pdf-helpers.js.
 *
 * Mirror of pdf-helpers.js for Excel output.
 */

import ExcelJS from "exceljs";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { logger } from "@/features/shared";

// ── Layout constants ─────────────────────────────────────────────────────────
// Column widths in approximate mm-equivalent Excel units

export const COLORS = {
  SAIME_BLUE: "FF19375A",
  SAIME_BLUE_LIGHT: "FF2B4F7A",
  DARK_TEXT: "FF282828",
  LIGHT_GRAY: "FF646464",
  BORDER_GRAY: "FFE6E6E6",
  WHITE: "FFFFFFFF",
  TABLE_STRIPE: "FFF8FAFC",
  TABLE_HEADER_BG: "FF19375A",
  TABLE_HEADER_FG: "FFFFFFFF",
};

export const CINTILLO = {
  PATH: "public/img/cintillo.jpg",
  WIDTH: 520,   // px in Excel
  HEIGHT: 68,   // px in Excel
};

// Column definitions matching the PDF 5-column layout
export const EXCEL_COLS = [
  { header: "Cédula",             key: "idCard",          width: 22 },
  { header: "Nombre Completo",    key: "fullName",        width: 42 },
  { header: "Tipo de Solicitud",  key: "requestType",     width: 50 },
  { header: "Producto Esperado",  key: "expectedProduct", width: 45 },
  { header: "Estatus",            key: "status",          width: 16 },
];

// ── Cintillo cache ───────────────────────────────────────────────────────────

let _cintilloBuffer = null;
export function getCintilloBuffer() {
  if (_cintilloBuffer !== null) return _cintilloBuffer;
  try {
    const cintilloPath = resolve(process.cwd(), CINTILLO.PATH);
    if (!existsSync(cintilloPath)) {
      logger.warn("Cintillo image not found for Excel", { path: cintilloPath });
      _cintilloBuffer = null;
      return _cintilloBuffer;
    }
    _cintilloBuffer = readFileSync(cintilloPath);
    return _cintilloBuffer;
  } catch (error) {
    logger.error("Failed to load cintillo image for Excel", { error: error.message });
    _cintilloBuffer = null;
    return _cintilloBuffer;
  }
}

// ── Workbook factory ─────────────────────────────────────────────────────────

export function createWorkbook() {
  return new ExcelJS.Workbook();
}

// ── Style helpers ────────────────────────────────────────────────────────────

export function applyHeaderStyle(cell, text) {
  cell.value = text;
  cell.font = { name: "Helvetica", size: 9, bold: true, color: { argb: COLORS.TABLE_HEADER_FG } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.TABLE_HEADER_BG } };
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  cell.border = {
    top:    { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
    bottom: { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
    left:   { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
    right:  { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
  };
}

export function applyDataCellStyle(cell, isEvenRow) {
  cell.font = { name: "Helvetica", size: 9, color: { argb: COLORS.DARK_TEXT } };
  if (isEvenRow) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.TABLE_STRIPE } };
  }
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  cell.border = {
    top:    { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
    bottom: { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
    left:   { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
    right:  { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
  };
}

export function applyTitleStyle(cell, text) {
  cell.value = text;
  cell.font = { name: "Helvetica", size: 14, bold: true, color: { argb: COLORS.SAIME_BLUE } };
  cell.alignment = { vertical: "middle", horizontal: "center" };
}

export function applySubtitleStyle(cell, text) {
  cell.value = text;
  cell.font = { name: "Helvetica", size: 8, color: { argb: COLORS.LIGHT_GRAY } };
  cell.alignment = { vertical: "middle", horizontal: "center" };
}

export function applyFooterStyle(cell, text, isBold = false) {
  cell.value = text;
  cell.font = { name: "Helvetica", size: 7, bold: isBold, color: { argb: isBold ? COLORS.SAIME_BLUE : COLORS.LIGHT_GRAY } };
  cell.alignment = { vertical: "middle", horizontal: "center" };
}
