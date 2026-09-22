import { logger } from "@/features/shared";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { PageHeader } from "@/components/shared/PageHeader";

/**
 * Generic page container for CRUD entity list pages.
 *
 * Eliminates the duplicated try/catch → fetch → ErrorAlert → PageHeader → Suspense → Table
 * pattern repeated across 20+ PageContainers.
 *
 * @param {Object}   props
 * @param {Object}   props.config       - Feature config (must have .TITLE, .PAGINATION.DEFAULT_PAGE_SIZE, .UI.LABELS)
 * @param {Object}   props.searchParams - Next.js searchParams promise
 * @param {Function} props.fetchData    - (normalizedParams) => Promise<{items, page, pageSize, totalPages, totalCount}>
 * @param {Function} props.renderTable  - ({data, pagination}) => JSX (the <XxxTable> component)
 * @param {Object}   [props.defaultSort] - { key: 'name', direction: 'asc' }
 * @param {ReactNode} [props.children]  - Wrapper providers rendered before the page content
 */
export async function EntityPageContainer({
  config,
  searchParams,
  fetchData,
  renderTable,
  defaultSort = { key: "name", direction: "asc" },
  children,
}) {
  const { LABELS } = config.UI;

  let data;
  try {
    const params = (await searchParams) || {};
    const page = params.page ? Number(params.page) : 1;
    const pageSize = params.pageSize ? Number(params.pageSize) : config.PAGINATION.DEFAULT_PAGE_SIZE;
    const searchTerm = params.q || "";
    const sortKey = params.sortKey || defaultSort.key;
    const sortDirection = params.sortDirection || defaultSort.direction;

    data = await fetchData({ page, pageSize, searchTerm, sortKey, sortDirection });
  } catch (error) {
    logger.error(`Error loading ${config.TITLE} data:`, error);
    return (
      <ErrorAlert
        title="Error"
        message={LABELS.MESSAGES.ERROR.LOAD}
      />
    );
  }

  const pagination = {
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
    totalCount: data.totalCount,
  };

  return (
    <>
      {children}
      <div className="flex flex-col gap-6 p-6">
        <PageHeader title={config.TITLE} subtitle={LABELS.DESCRIPTION} showNav={false} />
        <Suspense fallback={<TableSkeleton />}>
          {renderTable({ data: data.items, pagination })}
        </Suspense>
      </div>
    </>
  );
}
