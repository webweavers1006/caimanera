/**
 * Global site metadata and branding configuration.
 * Consumed by layout.jsx for Next.js metadata and by shared components.
 */
export const SITE_CONFIG = {
  name: "Caimanera",
  shortName: "Caimanera",
  tagline: "Conexión deportiva hiperlocal",
  /**
   * Brand marks. `logo` is the "ca" emblem on its green plate, so it stays
   * legible on both the light and the dark surfaces of the shell.
   */
  logo: "/img/caimanera_icon.png",
  /** Emblem alone with a transparent background: for brand-coloured panels. */
  logoEmblem: "/img/caimanera-emblem.png",
  /** Full lockup (emblem + wordmark + tagline), transparent background. */
  logoLockup: "/img/caimanera-logo.png",
  title: "Caimanera - Plataforma Hiperlocal de Conexión Deportiva",
  description:
    "Plataforma hiperlocal para organizar encuentros deportivos amateurs: reservas, suscripciones y pagos por partido.",
  keywords: [
    "deporte",
    "partidos",
    "canchas",
    "reservas",
    "suscripciones",
    "hiperlocal",
  ],
  openGraph: {
    title: "Caimanera - Plataforma Hiperlocal de Conexión Deportiva",
    description:
      "Plataforma hiperlocal para organizar encuentros deportivos amateurs: reservas, suscripciones y pagos por partido.",
    type: "website",
  },
  toaster: {
    position: "bottom-right",
    fontSize: "0.875rem",
  },
  /** Fixed configuration for the shared PageHeader component. */
  PAGE_HEADER: {
    imageSrc: "/img/caimanera-emblem.png",
    imageAlt: "Caimanera Logo",
  },
};
