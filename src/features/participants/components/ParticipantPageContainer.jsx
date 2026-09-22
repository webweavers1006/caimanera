import { EntityPageContainer } from "@/components/shared/EntityPageContainer";
import { fetchParticipantsList } from "@/features/participants/services/participant.read.service";
import { ParticipantTable } from "@/features/participants/components/ParticipantTable";
import { PARTICIPANT_CONFIG } from "@/features/participants/config/participant.constants";

export async function ParticipantPageContainer({ searchParams }) {
  return (
    <EntityPageContainer
      config={PARTICIPANT_CONFIG}
      searchParams={searchParams}
      fetchData={fetchParticipantsList}
      defaultSort={{ key: "createdAt", direction: "desc" }}
      renderTable={({ data, pagination }) => (
        <ParticipantTable data={data} pagination={pagination} />
      )}
    />
  );
}
