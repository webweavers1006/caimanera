/**
 * user.excel.service.js
 * Excel generation for the users report.
 * Mirrors the PDF columns: Cédula, Nombre, Correo, Rol, Estado.
 */

import { USER_CONFIG } from "../config/user.constants";
import {
  CINTILLO,
  COLORS,
  createWorkbook,
  getCintilloBuffer,
  applyHeaderStyle,
  applyDataCellStyle,
  applyTitleStyle,
  applySubtitleStyle,
  applyFooterStyle,
} from "../lib/excel-helpers";

const { LABELS } = USER_CONFIG.UI;
const L = LABELS.PDF;

const EXCEL_COLS = [
  { header: L.TABLE_ID_CARD, key: "idCard", width: 22 },
  { header: L.TABLE_NAME, key: "fullName", width: 38 },
  { header: L.TABLE_EMAIL, key: "email", width: 42 },
  { header: L.TABLE_ROLE, key: "role", width: 24 },
  { header: L.TABLE_STATUS, key: "status", width: 16 },
];

const COL_COUNT = EXCEL_COLS.length;
const ROW_TITLE = 2;
const ROW_SUBTITLE = 3;
const ROW_HEADER = 5;

function transformUsersToRows(users) {
  return (users || []).map((user) => ({
    idCard: user.idCard || "\u2014",
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "\u2014",
    email: user.email || "\u2014",
    role: user.role?.name || "Sin rol",
    status: user.isActive ? "Activo" : "Inactivo",
  }));
}

/**
 * Generates the users report workbook.
 *
 * @param {object} options
 * @param {Array} options.users - Domain user objects (from mapper)
 * @returns {Promise<Buffer>} Excel buffer
 */
export async function generateUsersExcel({ users }) {
  const wb = createWorkbook();
  const ws = wb.addWorksheet(L.TITLE);
  const rows = transformUsersToRows(users);

  ws.columns = EXCEL_COLS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  const cintilloBuffer = getCintilloBuffer();
  if (cintilloBuffer) {
    const imageId = wb.addImage({ buffer: cintilloBuffer, extension: "png" });
    ws.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: CINTILLO.WIDTH, height: CINTILLO.HEIGHT },
    });
  }

  ws.getCell(`A${ROW_TITLE}`).value = null;
  applyTitleStyle(ws.getCell(`A${ROW_TITLE}`), L.TITLE);
  ws.mergeCells(ROW_TITLE, 1, ROW_TITLE, COL_COUNT);
  ws.getRow(ROW_TITLE).height = 22;

  const today = new Date().toLocaleDateString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const subtitleText = `${L.DATE_ALL} — ${today} — ${rows.length} usuario${rows.length !== 1 ? "s" : ""}`;
  ws.getCell(`A${ROW_SUBTITLE}`).value = null;
  applySubtitleStyle(ws.getCell(`A${ROW_SUBTITLE}`), subtitleText);
  ws.mergeCells(ROW_SUBTITLE, 1, ROW_SUBTITLE, COL_COUNT);
  ws.getRow(ROW_SUBTITLE).height = 16;

  const headerRow = ws.getRow(ROW_HEADER);
  headerRow.height = 20;
  EXCEL_COLS.forEach((col, index) => {
    applyHeaderStyle(headerRow.getCell(index + 1), col.header);
  });

  rows.forEach((row, rowIndex) => {
    const excelRow = ws.getRow(ROW_HEADER + 1 + rowIndex);
    excelRow.height = 16;
    const isEven = rowIndex % 2 === 0;

    EXCEL_COLS.forEach((col, columnIndex) => {
      const cell = excelRow.getCell(columnIndex + 1);
      cell.value = row[col.key] || "\u2014";
      applyDataCellStyle(cell, isEven);
    });
  });

  const footerStart = ROW_HEADER + 1 + rows.length + 1;
  const footerLines = [
    { text: L.FOOTER_LINE1, bold: false },
    { text: L.FOOTER_LINE2, bold: false },
    { text: L.FOOTER_LINE3, bold: false },
    { text: L.FOOTER_WEB, bold: true },
  ];

  footerLines.forEach((line, index) => {
    const rowNumber = footerStart + index;
    ws.getCell(`A${rowNumber}`).value = null;
    applyFooterStyle(ws.getCell(`A${rowNumber}`), line.text, line.bold);
    ws.mergeCells(rowNumber, 1, rowNumber, COL_COUNT);
    ws.getRow(rowNumber).height = 14;
  });

  const separator = ws.getCell(`A${footerStart}`);
  separator.border = {
    top: { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
  };

  ws.pageSetup.orientation = "landscape";
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.paperSize = 1;

  ws.views = [{ state: "frozen", ySplit: ROW_HEADER }];

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
