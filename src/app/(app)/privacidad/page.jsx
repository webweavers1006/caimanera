import { SITE_CONFIG } from "@/features/shared";

export const metadata = {
  title: `Política de privacidad | ${SITE_CONFIG.name}`,
  description: "Cómo Caimanera recopila, usa y protege tus datos.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Política de privacidad</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: octubre de 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. Datos que usamos</h2>
          <p>
            Para mostrarte partidos cercanos utilizamos la ubicación que eliges en tu navegador.
            También guardamos los datos de tu cuenta necesarios para gestionar inscripciones,
            pases y pagos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Ubicación</h2>
          <p>
            La ubicación seleccionada se guarda en tu dispositivo para recordar tu zona. No
            compartimos tu ubicación exacta con otros jugadores; solo se usa para ordenar los
            partidos por distancia.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Uso de los datos</h2>
          <p>
            Usamos tus datos para autenticarte, gestionar tus inscripciones y enviarte
            comunicaciones operativas relacionadas con el servicio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Seguridad</h2>
          <p>
            Aplicamos controles de acceso y cifrado de credenciales. Aun así, ningún sistema es
            completamente infalible; te recomendamos usar una contraseña única.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Contacto</h2>
          <p>
            Para ejercer tus derechos sobre tus datos escríbenos a privacidad@caimanera.app.
          </p>
        </section>
      </div>
    </article>
  );
}
