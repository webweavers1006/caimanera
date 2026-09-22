import { SHARED_CONFIG } from "@/features/shared";
import { logger } from "@/features/shared";
import { Suspense } from "react";
import { fetchRolesList } from "@/features/roles/services/role.read.service";
import { getAllSystemPermissionsAction } from "@/features/permissions/actions/permission.read.action";
import { RoleTable } from "@/features/roles/components/RoleTable";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { PageHeader } from "@/components/shared/PageHeader";
import { ROLE_CONFIG } from "@/features/roles";
import { PermissionCatalogProvider } from "@/features/permissions/components/PermissionCatalogProvider";

const { LABELS } = ROLE_CONFIG.UI;

export async function RolePageContainer({ searchParams }) {
  let rolesData, permissions;
  try {
    const params = (await searchParams) || {};
    const sortKey = params.sortKey || "name";
    const sortDirection = params.sortDirection || "asc";
    const page = params.page ? Number(params.page) : 1;
    const pageSize = params.pageSize ? Number(params.pageSize) : ROLE_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
    const searchTerm = params.q || "";

    // Fetch roles and permissions in parallel — no cross-feature service imports
    const [rolesResult, permissionsResult] = await Promise.all([
      fetchRolesList({ page, pageSize, searchTerm, sortKey, sortDirection }),
      getAllSystemPermissionsAction(),
    ]);
    rolesData = rolesResult;
    // createProtectedFunction returns raw array on success, or { success: false } on error
    permissions = Array.isArray(permissionsResult) ? permissionsResult : [];
  } catch (error) {
    logger.error("Error loading roles data:", error);
    return (
      <ErrorAlert
        title={SHARED_CONFIG.UI.LABELS.MESSAGES.ERROR_TITLE}
        message={LABELS.MESSAGES.ERROR.LOAD}
      />
    );
  }

  return (
    <PermissionCatalogProvider permissions={permissions || []}>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader title={ROLE_CONFIG.TITLE} subtitle={LABELS.DESCRIPTION} showNav={false} />
        <Suspense fallback={<TableSkeleton />}>
          <RoleTable 
            data={rolesData.items} 
            pagination={{
              page: rolesData.page,
              pageSize: rolesData.pageSize,
              totalPages: rolesData.totalPages,
              totalCount: rolesData.totalCount
            }}
          />
        </Suspense>
      </div>
    </PermissionCatalogProvider>
  );
}
