/**
 * user.pdf.service.js
 * PDF generation orchestration for the users report.
 * Landscape letter, single table: Cédula, Nombre, Tipo de Solicitud, Producto Esperado, Estatus.
 * Delegates PDF primitives to ../lib/pdf-helpers.js.
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
 * Groups permissions by functional area and returns the most relevant ones.
 */
function deriveExpectedProduct(permissions) {
  if (!permissions || permissions.length === 0) return L.PRODUCT_PENDING;

  const products = new Set();
  for (const slug of permissions) {
    const prefix = slug.split(":")[0];
    const product = PRODUCT_GROUPS[prefix];
    if (product) products.add(product);
  }

  // Catalog prefixes — any not explicitly mapped above fall here
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

// ── Table columns (5 cols, landscape) ────────────────────────────────────────

const TABLE_COLS = [
  { header: L.TABLE_ID_CARD,         key: "idCard",          width: 22, align: "left" },
  { header: L.TABLE_NAME,            key: "fullName",        width: 42, align: "left" },
  { header: L.TABLE_REQUEST_TYPE,    key: "requestType",     width: 0,  align: "left", flex: true },
  { header: L.TABLE_EXPECTED_PRODUCT,key: "expectedProduct", width: 45, align: "left" },
  { header: L.TABLE_STATUS,          key: "status",          width: 16, align: "left" },
];

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

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Generates the users report PDF (landscape, 5 columns).
 *
 * @param {object} options
 * @param {Array} options.users - Domain user objects (from mapper)
 * @returns {Buffer} PDF buffer
 */
export function generateUsersPdf({ users }) {
  const doc = createDocument();
  const rows = transformUsersToRows(users || []);

  // Cintillo
  addCintillo(doc);
  let y = CINTILLO.Y + CINTILLO.HEIGHT + 6;

  // Ensure font state is clean before table rendering
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);

  drawTable(doc, { cols: TABLE_COLS, rows, startY: y });

  addFooter(doc);

  return Buffer.from(doc.output("arraybuffer"));
}
