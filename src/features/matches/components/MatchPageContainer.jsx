import { EntityPageContainer } from "@/components/shared/EntityPageContainer";
import { fetchMatchesList } from "@/features/matches/services/match.read.service";
import { MatchTable } from "@/features/matches/components/MatchTable";
import { MATCH_CONFIG } from "@/features/matches/config/match.constants";

export async function MatchPageContainer({ searchParams, session }) {
  const resolvedParams = (await searchParams) || {};
  const statusFilter = resolvedParams.status || "upcoming";

  return (
    <EntityPageContainer
      config={MATCH_CONFIG}
      searchParams={searchParams}
      fetchData={(params) =>
        fetchMatchesList({
          ...params,
          statusFilter,
          currentUserId: session?.id || null,
        })
      }
      defaultSort={{ key: "scheduledAt", direction: "asc" }}
      renderTable={({ data, pagination }) => (
        <MatchTable
          data={data}
          pagination={pagination}
          isAuthenticated={Boolean(session)}
        />
      )}
    />
  );
}
