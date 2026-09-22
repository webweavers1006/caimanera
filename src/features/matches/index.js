// ⚠️ Safe barrel: only config, constants, and columns.
// Server-only functions (prisma, actions) must be imported by direct path.
export { MATCH_CONFIG } from './config/match.constants'
export { getMatchTableColumns } from './config/match.columns'
