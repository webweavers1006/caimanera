"use client";

import { useCallback, useTransition } from "react";
import { useDebouncedSearch } from "@/features/shared/hooks/use-debounced-search";
import { useRouter, useSearchParams } from "next/navigation";

export function useAuditLogTableFilters(pagination) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPage = pagination?.page || Number(searchParams.get("page") || 1);
  const totalPages = pagination?.totalPages || 1;
  const totalCount = pagination?.totalCount || 0;
  const sortKey = searchParams.get("sortKey") || "";
  const sortDirection = searchParams.get("sortDirection") || "desc";

  const navigateWithParams = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "" || v === "all") params.delete(k);
        else params.set(k, String(v));
      });
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  const handleSortChange = useCallback(
    (key, direction) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key) params.set("sortKey", key);
      else params.delete("sortKey");
      if (direction) params.set("sortDirection", direction);
      else params.delete("sortDirection");
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router]
  );
  const handlePageChange = useCallback(
    (nextPage) => navigateWithParams({ page: nextPage }),
    [navigateWithParams]
  );
  const { searchTerm: localSearchTerm, setSearchTerm: handleSearchChange } = useDebouncedSearch(
    searchParams.get("q") || "", 400, (v) => navigateWithParams({ q: v, page: 1 })
  );

  const handleReset = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  return {
    isPending,
    filters: { searchTerm: localSearchTerm },
    paginationState: { currentPage, totalPages, totalCount },
    sortConfig: { key: sortKey || null, direction: sortDirection === "desc" ? "desc" : "asc" },
    handlers: { handleSearchChange, handlePageChange, handleSortChange, handleReset },
  };
}
