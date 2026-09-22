import { cn } from "@/features/shared"
import { LoginFields } from "./LoginFields"
import { AUTH_CONFIG } from "../config/auth.constants"

/**
 * Contenedor del formulario de Login (panel derecho).
 * Layout limpio sin card: título, subtítulo, campos y footer.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export function LoginForm({ className, ...props }) {
  const { CARD } = AUTH_CONFIG.UI.LABELS;

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {CARD.TITLE}
        </h1>
        <p className="text-sm text-muted-foreground">
          {CARD.DESCRIPTION}
        </p>
      </div>

      {/* Form fields */}
      <LoginFields />

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        {AUTH_CONFIG.UI.LABELS.FOOTER.TERMS_TEXT}{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          {AUTH_CONFIG.UI.LABELS.FOOTER.TERMS_LINK}
        </a>{" "}
        y{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          {AUTH_CONFIG.UI.LABELS.FOOTER.PRIVACY_LINK}
        </a>
      </p>
    </div>
  )
}
