/**
 * Global site metadata and branding configuration.
 * Consumed by layout.jsx for Next.js metadata and by shared components.
 */
export const SITE_CONFIG = {
  name: "Caimanera",
  shortName: "Caimanera",
  tagline: "Conexión deportiva hiperlocal",
  logo: "/img/caimanera_logo.svg",
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
    imageSrc: "/img/caimanera_logo.svg",
    imageAlt: "Caimanera Logo",
  },
};
