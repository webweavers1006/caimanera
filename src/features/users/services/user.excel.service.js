/**
 * user.excel.service.js
 * Excel generation orchestration for the users report.
 * Replicates the PDF layout: cintillo, title, 5-column table, footer.
 * Uses exceljs server-side. Mirrors user.pdf.service.js structure.
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

// ── Permission prefix → human-readable label (Tipo de Solicitud) ─────────────

const PERMISSION_LABELS = {
  cases:              "Gestión de Casos",
  users:              "Gestión de Usuarios",
  roles:              "Gestión de Roles",
  permissions:        "Gestión de Permisos",
  procedures:         "Gestión de Trámites",
  tickets:            "Gestión de Turnos",
  case_stats:         "Estadísticas de Casos",
  regional_stats:     "Estadísticas Regionales",
  follow_up_stats:    "Estadísticas de Seguimientos",
  forward_stats:      "Estadísticas de Remisiones",
  case_sheets:        "Generación de Planillas",
  case_forwards:      "Remisiones de Casos",
  case_follow_ups:    "Seguimientos de Casos",
  case_documents:     "Documentos de Casos",
  case_complaints:    "Denuncias de Casos",
  case_coordinates:   "Mapa de Casos",
  case_areas:         "Catálogo de Áreas",
  case_statuses:      "Catálogo de Estatus de Caso",
  call_statuses:      "Catálogo de Estatus de Llamada",
  closure_reasons:    "Catálogo de Motivos de Cierre",
  reasons:            "Catálogo de Motivos",
  attention_types:    "Catálogo de Tipos de Atención",
  attention_type_details: "Catálogo de Detalles de Atención",
  attention_channels: "Catálogo de Canales de Atención",
  administrative_directions: "Catálogo de Direcciones",
  offices:            "Catálogo de Oficinas",
  states:             "Catálogo de Estados",
  municipalities:     "Catálogo de Municipios",
  parishes:           "Catálogo de Parroquias",
  countries:          "Catálogo de Países",
  beneficiary_types:  "Catálogo de Tipos de Beneficiario",
  attached_entities:  "Catálogo de Entes Adscritos",
  popular_organizations: "Catálogo de Organizaciones Populares",
  persons:            "Gestión de Personas",
  saime_consultations:"Consultas SAIME",
  organigrama:        "Organigrama",
  operator_workspace: "Espacio de Trabajo",
  dashboard:          "Dashboard",
  notifications:      "Notificaciones",
  audit_logs:         "Auditoría",
  sent_emails:        "Correos Enviados",
  sse_monitor:        "Monitor SSE",
};

/**
 * Converts permission slugs into a sorted, deduplicated human-readable list.
 */
function permissionsToHuman(permissions) {
  if (!permissions || permissions.length === 0) return L.NO_PERMISSIONS;
  const categories = new Set();
  for (const slug of permissions) {
    const prefix = slug.split(":")[0];
    const label = PERMISSION_LABELS[prefix];
    if (label) categories.add(label);
  }
  if (categories.size === 0) return L.NO_PERMISSIONS;
  return [...categories].sort().join(", ");
}

// ── Permission prefix groups → Producto Esperado ─────────────────────────────

const PRODUCT_GROUPS = {
  cases:              "Atención y seguimiento de casos",
  case_forwards:      "Atención y seguimiento de casos",
  case_follow_ups:    "Atención y seguimiento de casos",
  case_documents:     "Atención y seguimiento de casos",
  case_complaints:    "Atención y seguimiento de casos",
  case_sheets:        "Atención y seguimiento de casos",
  users:              "Administración de usuarios y roles",
  roles:              "Administración de usuarios y roles",
  permissions:        "Administración de usuarios y roles",
  procedures:         "Gestión de trámites y planillas",
  tickets:            "Atención y gestión de turnos",
  case_stats:         "Análisis y reportes estadísticos",
  regional_stats:     "Análisis y reportes estadísticos",
  follow_up_stats:    "Análisis y reportes estadísticos",
  forward_stats:      "Análisis y reportes estadísticos",
  dashboard:          "Análisis y reportes estadísticos",
  case_coordinates:   "Registro geográfico de casos",
  persons:            "Gestión de datos de personas",
  saime_consultations:"Consulta de datos SAIME",
  organigrama:        "Gestión de estructura organizacional",
  operator_workspace: "Atención de casos asignados",
  notifications:      "Monitoreo y notificaciones del sistema",
  audit_logs:         "Monitoreo y notificaciones del sistema",
  sent_emails:        "Monitoreo y notificaciones del sistema",
  sse_monitor:        "Monitoreo y notificaciones del sistema",
};

/**
 * Derives the "Producto Esperado" from the user's permission set.
 */
function deriveExpectedProduct(permissions) {
  if (!permissions || permissions.length === 0) return L.PRODUCT_PENDING;
  const products = new Set();
  for (const slug of permissions) {
    const prefix = slug.split(":")[0];
    const product = PRODUCT_GROUPS[prefix];
    if (product) products.add(product);
  }
  const catalogPrefixes = [
    "case_areas", "case_statuses", "call_statuses", "closure_reasons", "reasons",
    "attention_types", "attention_type_details", "attention_channels",
    "administrative_directions", "offices", "states", "municipalities", "parishes",
    "countries", "beneficiary_types", "attached_entities", "popular_organizations",
  ];
  const hasCatalog = permissions.some((slug) => catalogPrefixes.includes(slug.split(":")[0]));
  if (hasCatalog) products.add("Gestión de catálogos del sistema");
  if (products.size === 0) return L.PRODUCT_PENDING;
  return [...products].sort().join("; ");
}

// ── Data transformation ──────────────────────────────────────────────────────

function transformUsersToRows(users) {
  return users.map((u) => {
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "\u2014";
    const perms = u.permissions || [];
    const reqType = permissionsToHuman(perms);
    const expProduct = deriveExpectedProduct(perms);
    const st = u.isActive ? "Activo" : "Inactivo";
    return {
      idCard: u.idCard || "\u2014",
      fullName,
      requestType: reqType || "Sin solicitudes",
      expectedProduct: expProduct || "\u2014",
      status: st || "\u2014",
    };
  });
}

// ── Column config matching PDF 5-col layout ──────────────────────────────────

const EXCEL_COLS = [
  { header: L.TABLE_ID_CARD,         key: "idCard",          width: 22 },
  { header: L.TABLE_NAME,            key: "fullName",        width: 42 },
  { header: L.TABLE_REQUEST_TYPE,    key: "requestType",     width: 50 },
  { header: L.TABLE_EXPECTED_PRODUCT,key: "expectedProduct", width: 45 },
  { header: L.TABLE_STATUS,          key: "status",          width: 16 },
];

// Number of columns (used for merged cells)
const COL_COUNT = EXCEL_COLS.length;

// ── Row indices (layout) ─────────────────────────────────────────────────────
// Row 1: empty (spacer for cintillo image overlay — image is placed at A1)
// Row 2: title (merged)
// Row 3: subtitle / date range (merged)
// Row 4: spacer
// Row 5: table headers
// Row 6+: data rows
// Last rows: footer

const ROW_TITLE = 2;
const ROW_SUBTITLE = 3;
const ROW_HEADER = 5;

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Generates the users report Excel workbook (mirrors PDF layout).
 *
 * @param {object} options
 * @param {Array} options.users - Domain user objects (from mapper)
 * @returns {Promise<Buffer>} Excel buffer
 */
export async function generateUsersExcel({ users }) {
  const wb = createWorkbook();
  const ws = wb.addWorksheet(LABELS.PDF.TITLE);

  const rows = transformUsersToRows(users || []);

  // ── Column widths ──────────────────────────────────────────────────────
  ws.columns = EXCEL_COLS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // ── Cintillo image ─────────────────────────────────────────────────────
  const cintilloBuf = getCintilloBuffer();
  if (cintilloBuf) {
    const imageId = wb.addImage({ buffer: cintilloBuf, extension: "jpeg" });
    ws.addImage(imageId, {
      tl: { col: 0, row: 0 },           // A1
      ext: { width: CINTILLO.WIDTH, height: CINTILLO.HEIGHT },
    });
  }

  // ── Title row (merged) ─────────────────────────────────────────────────
  ws.getCell(`A${ROW_TITLE}`).value = null;
  applyTitleStyle(ws.getCell(`A${ROW_TITLE}`), L.TITLE);
  ws.mergeCells(ROW_TITLE, 1, ROW_TITLE, COL_COUNT);
  ws.getRow(ROW_TITLE).height = 22;

  // ── Subtitle row (merged) ──────────────────────────────────────────────
  const today = new Date().toLocaleDateString("es-VE", {
    year: "numeric", month: "long", day: "numeric",
  });
  const subtitleText = `${L.DATE_ALL} — ${today} — ${rows.length} usuario${rows.length !== 1 ? "s" : ""}`;
  ws.getCell(`A${ROW_SUBTITLE}`).value = null;
  applySubtitleStyle(ws.getCell(`A${ROW_SUBTITLE}`), subtitleText);
  ws.mergeCells(ROW_SUBTITLE, 1, ROW_SUBTITLE, COL_COUNT);
  ws.getRow(ROW_SUBTITLE).height = 16;

  // ── Table headers ──────────────────────────────────────────────────────
  const headerRow = ws.getRow(ROW_HEADER);
  headerRow.height = 20;
  EXCEL_COLS.forEach((col, ci) => {
    const cell = headerRow.getCell(ci + 1);
    applyHeaderStyle(cell, col.header);
  });

  // ── Data rows ──────────────────────────────────────────────────────────
  rows.forEach((row, idx) => {
    const excelRow = ws.getRow(ROW_HEADER + 1 + idx);
    excelRow.height = 16;
    const isEven = idx % 2 === 0;

    EXCEL_COLS.forEach((col, ci) => {
      const cell = excelRow.getCell(ci + 1);
      cell.value = row[col.key] || "\u2014";
      applyDataCellStyle(cell, isEven);
    });
  });

  // ── Footer rows ────────────────────────────────────────────────────────
  const footerStart = ROW_HEADER + 1 + rows.length + 1; // 1 blank row after data

  const footerLines = [
    { text: L.FOOTER_LINE1, bold: false },
    { text: L.FOOTER_LINE2, bold: false },
    { text: L.FOOTER_LINE3, bold: false },
    { text: L.FOOTER_WEB, bold: true },
  ];

  footerLines.forEach((line, i) => {
    const r = footerStart + i;
    ws.getCell(`A${r}`).value = null;
    applyFooterStyle(ws.getCell(`A${r}`), line.text, line.bold);
    ws.mergeCells(r, 1, r, COL_COUNT);
    ws.getRow(r).height = 14;
  });

  // ── Top border on footer separator ─────────────────────────────────────
  const sepCell = ws.getCell(`A${footerStart}`);
  sepCell.border = {
    top: { style: "thin", color: { argb: COLORS.BORDER_GRAY } },
  };

  // ── Print setup (landscape, fit to page) ───────────────────────────────
  ws.pageSetup.orientation = "landscape";
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.paperSize = 1; // Letter

  // ── Freeze header row ──────────────────────────────────────────────────
  ws.views = [{ state: "frozen", ySplit: ROW_HEADER }];

  // ── Output ─────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
