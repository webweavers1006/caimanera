// Barrel exports for notifications feature.
// SECURITY: Only export config, constants, and pure utilities.
// NEVER export server-only functions (prisma, getSession, etc.) through this barrel.

export { NOTIFICATION_CONFIG } from './config/notification.constants';
