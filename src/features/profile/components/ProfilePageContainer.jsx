import { PageHeader } from "@/components/shared/PageHeader";
import { User, Mail, ShieldCheck } from "lucide-react";
import { getUserById } from "@/features/users/services/user.integration.service";
import { PROFILE_CONFIG } from "../config/profile.constants";
import { ChangePasswordForm } from "./ChangePasswordForm";

const { LABELS } = PROFILE_CONFIG.UI;

/**
 * Server-only key/value row (icon + label + value).
 * Local replacement for the client `InfoItem` to avoid passing
 * function props (Lucide components) across the server → client boundary.
 */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-all">{value || "-"}</p>
      </div>
    </div>
  );
}

/**
 * ProfilePageContainer — Server Component.
 *
 * Renders the current user's account info (fetched via the users
 * integration service) plus the self-service password change form.
 * Page-level auth guard lives in the thin page (getSession + redirect).
 *
 * @param {Object} props
 * @param {Object} props.session - Current session ({ id, role, firstName }).
 */
export async function ProfilePageContainer({ session }) {
  const user = await getUserById(session.id);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    session.firstName ||
    session.role;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={LABELS.TITLE} subtitle={LABELS.DESCRIPTION} showNav={false} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account info */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{LABELS.ACCOUNT_TITLE}</h2>
          <div className="space-y-4">
            <InfoRow icon={User} label={LABELS.NAME} value={displayName} />
            <InfoRow icon={Mail} label={LABELS.EMAIL} value={user?.email || "—"} />
            <InfoRow icon={ShieldCheck} label={LABELS.ROLE} value={user?.role?.name || session.role} />
          </div>
        </section>

        {/* Password change */}
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold">{LABELS.CHANGE_PASSWORD_TITLE}</h2>
          <p className="mb-4 text-sm text-muted-foreground">{LABELS.CHANGE_PASSWORD_DESCRIPTION}</p>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
