import { cn, LANDING_CONFIG } from "@/features/shared";
import { LoginFields } from "./LoginFields";
import { AUTH_CONFIG } from "../config/auth.constants";

/**
 * Login form content: heading, fields and legal footer.
 * The card and page shell live in the login page so the component can be
 * reused in other surfaces without duplicating layout.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export function LoginForm({ className, ...props }) {
  const { CARD, FOOTER } = AUTH_CONFIG.UI.LABELS;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-1.5 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {CARD.TITLE}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {CARD.DESCRIPTION}
        </p>
      </div>

      <LoginFields />

      <p className="border-t border-border/60 pt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        {FOOTER.TERMS_TEXT}{" "}
        {LANDING_CONFIG.termsUrl ? (
          <a
            href={LANDING_CONFIG.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/80 underline underline-offset-4 hover:text-primary"
          >
            {FOOTER.TERMS_LINK}
          </a>
        ) : (
          FOOTER.TERMS_LINK
        )}{" "}
        y{" "}
        {LANDING_CONFIG.privacyUrl ? (
          <a
            href={LANDING_CONFIG.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/80 underline underline-offset-4 hover:text-primary"
          >
            {FOOTER.PRIVACY_LINK}
          </a>
        ) : (
          FOOTER.PRIVACY_LINK
        )}
      </p>
    </div>
  );
}
