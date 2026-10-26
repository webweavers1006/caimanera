import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SITE_CONFIG } from "@/features/shared";

const BENEFITS = [
  {
    icon: MapPin,
    title: "Canchas y partidos cerca",
    description: "Descubre dónde se juega a pocas cuadras de ti.",
  },
  {
    icon: Ticket,
    title: "Inscripción en segundos",
    description: "Reserva tu cupo y paga con el método que prefieras.",
  },
  {
    icon: CalendarCheck2,
    title: "Todo en un solo lugar",
    description: "Consulta y gestiona tus próximos partidos.",
  },
];

/**
 * Standalone, app-like login screen.
 *
 * Mobile: compact app bar → brand → form card, with safe-area padding.
 * Desktop: brand story on the left, form on the right.
 */
export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Ambient background, consistent with the public app */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute -top-40 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -bottom-48 -right-24 size-96 rounded-full bg-info/10 blur-3xl" />
        <div className="absolute -bottom-56 -left-32 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] md:px-8 md:py-10 lg:max-w-6xl">
        {/* Mobile app bar */}
        <header className="flex items-center justify-between lg:hidden">
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-card/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <img
              src={SITE_CONFIG.logo}
              alt={SITE_CONFIG.name}
              className="size-8 rounded-[0.6rem]"
            />
            <span className="text-sm font-bold tracking-tight">{SITE_CONFIG.name}</span>
          </Link>

          <span aria-hidden="true" className="size-10" />
        </header>

        <div className="flex flex-1 flex-col justify-center py-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:py-0 xl:gap-16">
          {/* Desktop brand panel */}
          <section className="hidden lg:block">
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary/15 via-card to-card p-8 shadow-sm xl:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-28 -left-16 size-56 rounded-full bg-info/10 blur-3xl"
              />

              <div className="relative space-y-9">
                <div className="flex items-center gap-3">
                  <img
                    src={SITE_CONFIG.logo}
                    alt={SITE_CONFIG.name}
                    className="size-14 rounded-2xl border border-border/60 bg-card p-1 shadow-sm"
                  />
                  <div>
                    <p className="text-lg font-bold tracking-tight">{SITE_CONFIG.name}</p>
                    <p className="text-xs text-muted-foreground">{SITE_CONFIG.tagline}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    <Sparkles className="size-3.5" />
                    Juega cerca de ti
                  </span>
                  <h2 className="text-3xl font-bold leading-[1.08] tracking-tight xl:text-4xl">
                    Tu próximo partido
                    <span className="block text-primary">está a unas cuadras.</span>
                  </h2>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Entra a Caimanera, encuentra tu cancha y asegura tu cupo sin
                    llamadas ni mensajes.
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {BENEFITS.map((benefit) => {
                    const Icon = benefit.icon;
                    return (
                      <li
                        key={benefit.title}
                        className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/40 p-3.5 backdrop-blur-sm"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{benefit.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {benefit.description}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Conexión segura · Caimanera
                </p>
              </div>
            </div>
          </section>

          {/* Form column */}
          <main className="w-full">
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[1.5rem] bg-primary/25 blur-xl"
                />
                <img
                  src={SITE_CONFIG.logo}
                  alt={SITE_CONFIG.name}
                  className="relative size-20 rounded-[1.5rem] border border-border/70 bg-card p-2 shadow-xl"
                />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7 lg:p-8">
              <LoginForm />
            </div>

            <Link
              href="/"
              className="mx-auto mt-5 flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              Explorar partidos sin cuenta
              <ArrowRight className="size-4" />
            </Link>
          </main>
        </div>
      </div>
    </div>
  );
}
