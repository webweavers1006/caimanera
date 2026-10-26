import { PARTICIPANT_CONFIG } from "@/features/participants/config/participant.constants";
import { getUserPermissions } from "@/features/permissions/services/permission.authorization.service";

/**
 * Capabilities the booking flow grants to the current session.
 *
 * Staff with participant write permission can confirm a spot without going
 * through the payment gateway. Keeping the rule here means page containers
 * stay unaware of the permission catalog.
 */
export async function getBookingCapabilities(session) {
  if (!session) return { canStaffConfirm: false };

  const permissions = await getUserPermissions(session.role);
  return {
    canStaffConfirm: permissions.includes(PARTICIPANT_CONFIG.PERMISSIONS.WRITE),
  };
}
