/**
 * user.pdf.service.js
 * PDF generation for the users report.
 * Landscape letter: Cédula, Nombre, Correo, Rol, Estado.
 */

import { USER_CONFIG } from "../config/user.constants";
import {
  CINTILLO,
  createDocument,
  addCintillo,
  addFooter,
  drawTable,
} from "../lib/pdf-helpers";

const { LABELS } = USER_CONFIG.UI;
const L = LABELS.PDF;

const TABLE_COLS = [
  { header: L.TABLE_ID_CARD, key: "idCard", width: 26, align: "left" },
  { header: L.TABLE_NAME, key: "fullName", width: 48, align: "left" },
  { header: L.TABLE_EMAIL, key: "email", width: 0, align: "left", flex: true },
  { header: L.TABLE_ROLE, key: "role", width: 38, align: "left" },
  { header: L.TABLE_STATUS, key: "status", width: 18, align: "left" },
];

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
 * Generates the users report PDF.
 *
 * @param {object} options
 * @param {Array} options.users - Domain user objects (from mapper)
 * @returns {Buffer} PDF buffer
 */
export function generateUsersPdf({ users }) {
  const doc = createDocument();
  const rows = transformUsersToRows(users);

  addCintillo(doc);
  const y = CINTILLO.Y + CINTILLO.HEIGHT + 6;

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);

  drawTable(doc, { cols: TABLE_COLS, rows, startY: y });
  addFooter(doc);

  return Buffer.from(doc.output("arraybuffer"));
}
