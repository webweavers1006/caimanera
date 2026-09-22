import { SHARED_CONFIG } from "@/features/shared";
import { logger } from "@/features/shared";
import { Suspense } from "react";
import { fetchPermissionsList } from "@/features/permissions/services/permission.read.service";
import { PermissionTable } from "@/features/permissions/components/PermissionTable";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { PageHeader } from "@/components/shared/PageHeader";
import { PERMISSION_CONFIG } from "@/features/permissions";

const { LABELS } = PERMISSION_CONFIG.UI;

export async function PermissionPageContainer({ searchParams }) {
  let permissionsData;
  try {
    const params = (await searchParams) || {};
    const sortKey = params.sortKey || "slug";
    const sortDirection = params.sortDirection || "asc";
    const page = params.page ? Number(params.page) : 1;
    const pageSize = params.pageSize ? Number(params.pageSize) : PERMISSION_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
    const searchTerm = params.q || "";

    permissionsData = await fetchPermissionsList({
      page,
      pageSize,
      searchTerm,
      sortKey,
      sortDirection,
    });
  } catch (error) {
    logger.error("Error loading permissions data:", error);
    return (
      <ErrorAlert
        title={SHARED_CONFIG.UI.LABELS.MESSAGES.ERROR_TITLE}
        message={LABELS.MESSAGES.ERROR.LOAD}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={PERMISSION_CONFIG.TITLE} subtitle={LABELS.DESCRIPTION} showNav={false} />
      <Suspense fallback={<TableSkeleton />}>
        <PermissionTable
          data={permissionsData.items}
          pagination={{
            page: permissionsData.page,
            pageSize: permissionsData.pageSize,
            totalPages: permissionsData.totalPages,
            totalCount: permissionsData.totalCount,
          }}
        />
      </Suspense>
    </div>
  );
}
