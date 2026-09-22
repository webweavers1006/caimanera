import { EntityPageContainer } from "@/components/shared/EntityPageContainer";
import { fetchAuditLogsList } from "@/features/audit-logs/services/audit-log.read.service";
import { AuditLogTable } from "@/features/audit-logs/components/AuditLogTable";
import { AUDIT_LOG_CONFIG } from "@/features/audit-logs/config/audit-log.constants";

export async function AuditLogPageContainer({ searchParams }) {
  return (
    <EntityPageContainer
      config={AUDIT_LOG_CONFIG}
      searchParams={searchParams}
      defaultSort={{ key: "createdAt", direction: "desc" }}
      fetchData={fetchAuditLogsList}
      renderTable={({ data, pagination }) => <AuditLogTable data={data} pagination={pagination} />}
    />
  );
}
