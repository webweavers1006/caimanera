import { SITE_CONFIG } from "@/features/shared";

export const metadata = {
  title: `Términos de servicio | ${SITE_CONFIG.name}`,
  description: "Términos y condiciones de uso de la plataforma Caimanera.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Términos de servicio</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: octubre de 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. Uso de la plataforma</h2>
          <p>
            Caimanera conecta jugadores con partidos y canchas cercanas. Al crear una cuenta
            aceptas brindar información veraz y utilizar la plataforma de forma respetuosa.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Inscripciones y pagos</h2>
          <p>
            Las inscripciones están sujetas a la disponibilidad de cupos. Los pagos por partido
            y los créditos de los pases se rigen por las condiciones publicadas en cada partido
            o plan. La cancelación de una inscripción libera el cupo para otro jugador.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Conducta</h2>
          <p>
            No se permite el uso fraudulento de la plataforma, la suplantación de identidad ni
            conductas que afecten la seguridad o la experiencia de otros jugadores y canchas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Cambios</h2>
          <p>
            Podemos actualizar estos términos para reflejar mejoras del servicio. Notificaremos
            los cambios relevantes a través de la plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Contacto</h2>
          <p>
            Para consultas sobre estos términos escríbenos a soporte@caimanera.app.
          </p>
        </section>
      </div>
    </article>
  );
}
