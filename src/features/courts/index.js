// ⚠️ Safe barrel: only config, constants, and columns.
// Server-only functions (prisma, actions) must be imported by direct path.
export { COURT_CONFIG } from './config/court.constants'
export { getCourtTableColumns } from './config/court.columns'
