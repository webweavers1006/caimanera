import { VenueDetailPageContainer } from "@/features/venues/components/VenueDetailPageContainer";
import { SITE_CONFIG } from "@/features/shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `Detalle de la cancha | ${SITE_CONFIG.name}`,
  description: "Consulta los datos de la cancha y sus próximos partidos disponibles.",
};

export default async function VenuePage({ params }) {
  const { id } = await params;
  return <VenueDetailPageContainer venueId={id} />;
}
