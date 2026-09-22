"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Download, FileSpreadsheet, Filter, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { USER_CONFIG } from "../config/user.constants";
import { Toolbar } from "@/components/shared/Toolbar";
import { UserFilters } from "./UserFilters";

export function UserToolbar({
  searchTerm,
  onSearchChange,
  filters,
  handlers,
  onReset,
  onCreate,
  onSendCredentials,
  selectedCount = 0,
  onSendSelected,
  onDownloadPdf,
  onDownloadPdfSelected,
  isDownloadingPdf = false,
  onDownloadExcel,
  onDownloadExcelSelected,
  isDownloadingExcel = false,
}) {
  const { can } = usePermission();
  const { UI: { LABELS } } = USER_CONFIG;
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status !== "all") count++;
    if (filters.roleId?.length > 0) count++;
    if (filters.officeId?.length > 0) count++;
    if (filters.directionId?.length > 0) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  return (
    <Toolbar>
      <Toolbar.Main>
        <Toolbar.Filters>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Filter className="h-4 w-4" />
            {LABELS.TOOLBAR.FILTERS_TOGGLE}
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[11px] font-bold bg-primary/10 text-primary rounded-full">
                {LABELS.TOOLBAR.FILTERS_ACTIVE(activeFilterCount)}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </Toolbar.Filters>

        {showFilters && (
          <div className="pt-2">
            <UserFilters filters={filters} handlers={handlers} />
          </div>
        )}
      </Toolbar.Main>

      <Toolbar.Footer>
        <Toolbar.Search
          label={LABELS.TOOLBAR.SEARCH_LABEL}
          placeholder={LABELS.TOOLBAR.SEARCH_PLACEHOLDER}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <Toolbar.Actions label={LABELS.TOOLBAR.DIVIDER_ACTIONS}>
          <Button variant="secondary" onClick={onReset} className="gap-2">
            <X className="h-4 w-4" />
            <span>{LABELS.CLEAN_BUTTON}</span>
          </Button>

          {can(USER_CONFIG.PERMISSIONS.READ) && (
            <>
              {selectedCount > 0 ? (
                <Button
                  variant="secondary"
                  onClick={onDownloadPdfSelected}
                  disabled={isDownloadingPdf}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>{isDownloadingPdf ? LABELS.PDF.DOWNLOADING : `${LABELS.PDF.DOWNLOAD_BUTTON} (${selectedCount})`}</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={onDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>{isDownloadingPdf ? LABELS.PDF.DOWNLOADING : LABELS.PDF.DOWNLOAD_BUTTON}</span>
                </Button>
              )}

              {selectedCount > 0 ? (
                <Button
                  variant="secondary"
                  onClick={onDownloadExcelSelected}
                  disabled={isDownloadingExcel}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{isDownloadingExcel ? LABELS.EXCEL.DOWNLOADING : `${LABELS.EXCEL.DOWNLOAD_BUTTON} (${selectedCount})`}</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={onDownloadExcel}
                  disabled={isDownloadingExcel}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{isDownloadingExcel ? LABELS.EXCEL.DOWNLOADING : LABELS.EXCEL.DOWNLOAD_BUTTON}</span>
                </Button>
              )}
            </>
          )}

          {selectedCount > 0 && can(USER_CONFIG.PERMISSIONS.UPDATE) && (
            <Button variant="secondary" onClick={onSendSelected} className="gap-2">
              <Send className="h-4 w-4" />
              <span>Enviar credenciales ({selectedCount})</span>
            </Button>
          )}

          {can(USER_CONFIG.PERMISSIONS.UPDATE) && (
            <Button variant="secondary" onClick={onSendCredentials} className="gap-2">
              <Send className="h-4 w-4" />
              <span>Enviar credenciales a todos</span>
            </Button>
          )}

          {can(USER_CONFIG.PERMISSIONS.WRITE) && (
            <Button onClick={onCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{LABELS.TOOLBAR.NEW_BUTTON}</span>
            </Button>
          )}
        </Toolbar.Actions>
      </Toolbar.Footer>
    </Toolbar>
  );
}
