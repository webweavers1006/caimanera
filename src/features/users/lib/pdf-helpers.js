/**
 * pdf-helpers.js
 * Reusable PDF rendering primitives for the users report.
 * Extracted to keep user.pdf.service.js under the 250-line limit.
 *
 * Uses jsPDF server-side. Follows the same visual style as case-sheets and case-stats.
 */

import { jsPDF } from "jspdf";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { USER_CONFIG } from "../config/user.constants";
import { logger } from "@/features/shared";

const { LABELS } = USER_CONFIG.UI;
const L = LABELS.PDF;

// ── Layout constants ─────────────────────────────────────────────────────────

export const PAGE_W = 279.4; // landscape letter
export const PAGE_H = 215.9;
export const MARGIN = 10;
export const CONTENT_W = PAGE_W - MARGIN * 2;
export const FOOTER_HEIGHT = 20;
export const PAGE_BOTTOM = PAGE_H - FOOTER_HEIGHT;

// SAIME color palette (matches case-sheets and case-stats)
export const COLORS = {
  SAIME_BLUE: [25, 55, 90],
  DARK_TEXT: [40, 40, 40],
  LIGHT_GRAY: [100, 100, 100],
  BORDER_GRAY: [230, 230, 230],
  DIVIDER_GRAY: [200, 200, 200],
  WHITE: [255, 255, 255],
  BLACK: [0, 0, 0],
  TABLE_STRIPE: [248, 250, 252],
};

// Cintillo config
export const CINTILLO = {
  PATH: "public/img/cintillo.jpg",
  X: 10,
  Y: 10,
  WIDTH: 190,
  HEIGHT: 25,
  FORMAT: "JPEG",
};

// ── Cintillo cache ───────────────────────────────────────────────────────────

let _cintilloBase64 = null;
export function getCintilloBase64() {
  if (_cintilloBase64 !== null) return _cintilloBase64;
  try {
    const cintilloPath = resolve(process.cwd(), CINTILLO.PATH);
    if (!existsSync(cintilloPath)) {
      logger.warn("Cintillo image not found", { path: cintilloPath });
      _cintilloBase64 = "";
      return _cintilloBase64;
    }
    const buffer = readFileSync(cintilloPath);
    const base64 = buffer.toString("base64");
    _cintilloBase64 = `data:image/jpeg;base64,${base64}`;
    return _cintilloBase64;
  } catch (error) {
    logger.error("Failed to load cintillo image", { error: error.message });
    _cintilloBase64 = "";
    return _cintilloBase64;
  }
}

// ── Document factory ─────────────────────────────────────────────────────────

export function createDocument() {
  return new jsPDF({ orientation: "l", unit: "mm", format: "letter" });
}

// ── Cintillo ─────────────────────────────────────────────────────────────────

export function addCintillo(doc) {
  const base64 = getCintilloBase64();
  if (!base64) return;
  doc.addImage(base64, CINTILLO.FORMAT, CINTILLO.X, CINTILLO.Y, CINTILLO.WIDTH, CINTILLO.HEIGHT);
}

// ── Footer ───────────────────────────────────────────────────────────────────

export function addFooter(doc) {
  const footerY = PAGE_H - 18;

  doc.setDrawColor(...COLORS.DIVIDER_GRAY);
  doc.line(MARGIN, footerY, PAGE_W - MARGIN, footerY);

  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.LIGHT_GRAY);
  doc.text(L.FOOTER_LINE1, PAGE_W / 2, footerY + 4, { align: "center" });
  doc.text(L.FOOTER_LINE2, PAGE_W / 2, footerY + 8, { align: "center" });
  doc.text(L.FOOTER_LINE3, PAGE_W / 2, footerY + 12, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.SAIME_BLUE);
  doc.text(L.FOOTER_WEB, PAGE_W / 2, footerY + 16, { align: "center" });
}

// ── Report header ────────────────────────────────────────────────────────────

export function drawReportHeader(doc, dateFrom, dateTo, userCount) {
  addCintillo(doc);
  let y = CINTILLO.Y + CINTILLO.HEIGHT + 6;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.SAIME_BLUE);
  doc.text(L.TITLE, PAGE_W / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.LIGHT_GRAY);
  const range = dateFrom || dateTo
    ? `${L.DATE_RANGE}: ${dateFrom || "\u2014"}  \u2192  ${dateTo || "\u2014"}`
    : L.DATE_ALL;
  doc.text(range, PAGE_W / 2, y, { align: "center" });
  y += 5;

  doc.setFontSize(8);
  doc.text(`Total: ${userCount} usuario${userCount !== 1 ? "s" : ""}`, PAGE_W / 2, y, { align: "center" });
  y += 8;

  return y;
}

// ── Section header ───────────────────────────────────────────────────────────

export function sectionHeader(doc, text, y) {
  doc.setFillColor(...COLORS.SAIME_BLUE);
  doc.rect(MARGIN, y, CONTENT_W, 6, "F");
  doc.setTextColor(...COLORS.WHITE);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(`  ${text}`, MARGIN + 2, y + 4.5);
  return y + 8;
}

// ── Resolve flex column widths ───────────────────────────────────────────────

export function resolveColWidths(cols, availableWidth) {
  const fixedTotal = cols.reduce((sum, c) => sum + (c.width || 0), 0);
  const flexCols = cols.filter((c) => c.flex);
  if (flexCols.length === 0) return cols.map((c) => ({ ...c }));
  const flexWidth = (availableWidth - fixedTotal) / flexCols.length;
  return cols.map((c) => (c.flex ? { ...c, width: Math.max(flexWidth, 20) } : { ...c }));
}

// ── Table drawer (multi-line cells, no truncation) ───────────────────────────

export function drawTable(doc, { cols, rows, startY }) {
  let y = startY;
  const headerH = 7;
  const lineH = 3.5;    // height per text line
  const cellPad = 1.5;  // vertical padding inside cell (top + bottom)
  const minRowH = lineH + cellPad; // minimum row height for single-line cells
  const sidePad = 1;    // horizontal padding inside cell (each side)
  const availW = CONTENT_W - sidePad * 2; // usable width for column content

  const resolvedCols = resolveColWidths(cols, availW);

  function drawHeader(atY) {
    doc.setFillColor(...COLORS.SAIME_BLUE);
    doc.rect(MARGIN, atY, CONTENT_W, headerH, "F");
    doc.setTextColor(...COLORS.WHITE);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    let cx = MARGIN + sidePad;
    resolvedCols.forEach((col) => {
      doc.text(col.header, cx, atY + 5);
      cx += col.width;
    });
  }

  drawHeader(y);
  y += headerH;

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.DARK_TEXT);

  rows.forEach((row, idx) => {
    // Pre-compute wrapped lines for each cell
    const cellLines = resolvedCols.map((col) => {
      const text = row[col.key] || "\u2014";
      return doc.splitTextToSize(text, col.width - sidePad);
    });

    // Max line count across all cells in this row
    const maxLines = Math.max(...cellLines.map((lines) => lines.length), 1);
    const rowH = Math.max(maxLines * lineH + cellPad, minRowH);

    // Page break if row doesn't fit
    if (y + rowH > PAGE_BOTTOM) {
      doc.addPage();
      y = MARGIN;
      drawHeader(y);
      y += headerH;
      // Restore row font — drawHeader sets white/bold for the header bar
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.DARK_TEXT);
    }

    // Row background
    if (idx % 2 === 0) {
      doc.setFillColor(...COLORS.TABLE_STRIPE);
      doc.rect(MARGIN, y, CONTENT_W, rowH, "F");
    }

    // Draw each cell
    let cx = MARGIN + sidePad;
    resolvedCols.forEach((col, ci) => {
      const lines = cellLines[ci];
      const textY = y + cellPad / 2 + lineH; // baseline of first line
      doc.text(lines, cx, textY);
      cx += col.width;
    });

    y += rowH;
  });

  return y + 2;
}
