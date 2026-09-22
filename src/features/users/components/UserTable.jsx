"use client";

import { useMemo } from "react";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { getUserTableColumns } from "../config/user.columns";
import { useUserTableDialogs } from "../hooks/use-user-table-dialogs";
import { useUserTableFilters } from "../hooks/use-user-table-filters";
import { useCredentialsSend } from "../hooks/use-credentials-send";
import { useUserPdfDownload } from "../hooks/use-user-pdf-download";
import { useUserExcelDownload } from "../hooks/use-user-excel-download";
import { UserTableView } from "./UserTableView";
import { SendCredentialsDialog } from "./SendCredentialsDialog";

/**
 * Main Users Table Component (Container).
 */
export function UserTable({ data, pagination }) {
  const { can } = usePermission();

  // Dialogs state
  const dialogState = useUserTableDialogs();

  // Credentials send state
  const credState = useCredentialsSend();

  // Filters, pagination and sorting synced with URL
  const { isPending, filters, paginationState, sortConfig, handlers } =
    useUserTableFilters(pagination);

  // PDF download state (must be after useUserTableFilters — depends on filters)
  const pdfDownload = useUserPdfDownload({ filters });

  // Excel download state
  const excelDownload = useUserExcelDownload({ filters });

  const columns = useMemo(
    () => getUserTableColumns(dialogState.handleEdit, dialogState.handleDelete, can),
    [can, dialogState.handleEdit, dialogState.handleDelete]
  );

  return (
    <>
      <UserTableView
        users={data}
        isPending={isPending}
        pagination={paginationState}
        filters={filters}
        sortConfig={sortConfig}
        handlers={handlers}
        dialogState={dialogState}
        columns={columns}
        onSendAll={credState.openSendAll}
        onSendSelected={credState.openSendSelected}
        onDownloadPdf={pdfDownload.download}
        onDownloadPdfSelected={pdfDownload.downloadSelected}
        isDownloadingPdf={pdfDownload.isDownloading}
        onDownloadExcel={excelDownload.download}
        onDownloadExcelSelected={excelDownload.downloadSelected}
        isDownloadingExcel={excelDownload.isDownloading}
      />
      <SendCredentialsDialog
        open={credState.showDialog}
        onOpenChange={credState.closeDialog}
        userIds={credState.userIds}
      />
    </>
  );
}
