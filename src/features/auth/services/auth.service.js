/**
 * Auth Service — re-exports from read/write split files.
 * Prefer importing directly from auth.read.service.js or auth.write.service.js.
 * Kept for backward compatibility.
 */
export { authenticateUser } from './auth.read.service';
export { loginUserSession } from './auth.write.service';
