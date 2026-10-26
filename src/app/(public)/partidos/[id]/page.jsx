import { PublicMatchDetailPageContainer } from "@/features/discovery/components/PublicMatchDetailPageContainer";
import { SITE_CONFIG } from "@/features/shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `Detalle del partido | ${SITE_CONFIG.name}`,
  description: "Consulta horario, cancha, cupos y precio del partido. Inscríbete en segundos.",
};

export default async function PublicMatchPage({ params }) {
  const { id } = await params;
  return <PublicMatchDetailPageContainer matchId={id} />;
}
