"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedSearch } from "@/features/shared/hooks/use-debounced-search";

export function useTransactionTableFilters(pagination) {
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
      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") params.delete(key);
        else params.set(key, String(value));
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
    [router, searchParams]
  );

  const handlePageChange = useCallback(
    (nextPage) => navigateWithParams({ page: nextPage }),
    [navigateWithParams]
  );

  const { searchTerm, setSearchTerm } = useDebouncedSearch(
    searchParams.get("q") || "",
    400,
    (value) => navigateWithParams({ q: value, page: 1 })
  );

  const handleReset = useCallback(() => {
    setSearchTerm("");
  }, [setSearchTerm]);

  return {
    isPending,
    filters: { searchTerm },
    paginationState: { currentPage, totalPages, totalCount },
    sortConfig: {
      key: sortKey || null,
      direction: sortDirection === "asc" ? "asc" : "desc",
    },
    handlers: {
      handleSearchChange: setSearchTerm,
      handlePageChange,
      handleSortChange,
      handleReset,
    },
  };
}
