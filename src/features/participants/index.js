// ⚠️ Safe barrel: only config, constants, and columns.
// Server-only functions (prisma, actions) must be imported by direct path.
export { PARTICIPANT_CONFIG } from './config/participant.constants'
export { getParticipantTableColumns } from './config/participant.columns'
