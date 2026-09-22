import { SHARED_CONFIG } from "@/features/shared";
import { logger } from "@/features/shared";
import { Suspense } from "react";
import { UserTable } from "@/features/users/components/UserTable";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { PageHeader } from "@/components/shared/PageHeader";
import { fetchUsersList } from "@/features/users/services/user.read.service";
import { USER_CONFIG } from "@/features/users";
import { RoleProvider } from "@/features/roles/components/RoleProvider";

const { LABELS } = USER_CONFIG.UI;

export async function UserPageContainer({ session, searchParams }) {
  let users, roles, totalCount, page, pageSize, totalPages;
  try {
    const params = (await searchParams) || {};
    const sortKey = params.sortKey || "name";
    const sortDirection = params.sortDirection || undefined;
    const searchTerm = params.q || "";
    const status = params.status || "all";
    const roleId = params.roleId || undefined;
    const officeId = params.officeId || undefined;
    const directionId = params.directionId || undefined;
    const dateFrom = params.dateFrom || undefined;
    const dateTo = params.dateTo || undefined;
    page = params.page ? Number(params.page) : 1;
    pageSize = params.pageSize ? Number(params.pageSize) : USER_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;

    ({
      users,
      roles,
      totalCount,
      page,
      pageSize,
      totalPages,
    } = await fetchUsersList(session, {
      page,
      pageSize,
      searchTerm,
      status,
      roleId,
      officeId,
      directionId,
      dateFrom,
      dateTo,
      sortKey,
      sortDirection,
    }));
  } catch (error) {
    logger.error("Error loading users data:", error);
    return (
      <ErrorAlert 
        title={SHARED_CONFIG.UI.LABELS.MESSAGES.ERROR_TITLE}
        message={LABELS.MESSAGES.ERROR.LOAD}
      />
    );
  }

  return (
    <RoleProvider roles={roles}>
      <div className="flex flex-col gap-6 p-6">
      <PageHeader title={USER_CONFIG.TITLE} subtitle={LABELS.DESCRIPTION} showNav={false} />
        
        <Suspense fallback={<TableSkeleton />}>
          <UserTable 
            data={users} 
            pagination={{ page, pageSize, totalPages, totalCount }}
          />
        </Suspense>
      </div>
    </RoleProvider>
  );
}
