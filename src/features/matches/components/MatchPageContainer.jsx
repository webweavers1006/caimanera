import { EntityPageContainer } from "@/components/shared/EntityPageContainer";
import { fetchMatchesList } from "@/features/matches/services/match.read.service";
import { MatchTable } from "@/features/matches/components/MatchTable";
import { MATCH_CONFIG } from "@/features/matches/config/match.constants";

export async function MatchPageContainer({ searchParams }) {
  return (
    <EntityPageContainer
      config={MATCH_CONFIG}
      searchParams={searchParams}
      fetchData={fetchMatchesList}
      defaultSort={{ key: "scheduledAt", direction: "desc" }}
      renderTable={({ data, pagination }) => <MatchTable data={data} pagination={pagination} />}
    />
  );
}
