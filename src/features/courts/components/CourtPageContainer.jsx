import { EntityPageContainer } from "@/components/shared/EntityPageContainer";
import { fetchCourtsList } from "@/features/courts/services/court.read.service";
import { CourtTable } from "@/features/courts/components/CourtTable";
import { COURT_CONFIG } from "@/features/courts/config/court.constants";

export async function CourtPageContainer({ searchParams }) {
  return (
    <EntityPageContainer
      config={COURT_CONFIG}
      searchParams={searchParams}
      fetchData={fetchCourtsList}
      renderTable={({ data, pagination }) => <CourtTable data={data} pagination={pagination} />}
    />
  );
}
