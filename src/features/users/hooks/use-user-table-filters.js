import { useCallback, useTransition } from "react";
import { useDebouncedSearch } from "@/features/shared/hooks/use-debounced-search";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Manages filters, pagination and sorting for the users table via URL search params.
 *
 * Filters:
 *   q              — search term (name, idCard, email)
 *   status         — "all" | "active" | "inactive"
 *   roleId         — comma-separated role IDs (multi-select)
 *   officeId       — comma-separated office IDs (multi-select)
 *   directionId    — comma-separated direction IDs (multi-select)
 *   dateFrom       — ISO date string
 *   dateTo         — ISO date string
 */
export function useUserTableFilters(pagination) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for the input value — prevents losing focus on every keystroke
  const parseArr = (key) => {
    const raw = searchParams.get(key);
    return raw ? raw.split(",").filter(Boolean) : [];
  };

  const status = searchParams.get("status") || "all";
  const roleId = parseArr("roleId");
  const officeId = parseArr("officeId");
  const directionId = parseArr("directionId");
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const currentPage = pagination?.page || Number(searchParams.get("page") || 1);
  const totalPages = pagination?.totalPages || 1;
  const totalCount = pagination?.totalCount || 0;
  const sortKey = searchParams.get("sortKey") || "";
  const sortDirection = searchParams.get("sortDirection") || "asc";

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
    [router, searchParams, startTransition]
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
    [searchParams, startTransition, router]
  );

  const handleStatusChange = useCallback(
    (value) => {
      navigateWithParams({ status: value, page: 1 });
    },
    [navigateWithParams]
  );

  // Generic filter change for multi-select (arrays) or single values
  const handleFilterChange = useCallback(
    (key, value) => {
      const normalized = Array.isArray(value) ? (value.length > 0 ? value.join(",") : null) : value;
      navigateWithParams({ [key]: normalized, page: 1 });
    },
    [navigateWithParams]
  );

  const handleDateFromChange = useCallback(
    (value) => {
      navigateWithParams({ dateFrom: value || null, page: 1 });
    },
    [navigateWithParams]
  );

  const handleDateToChange = useCallback(
    (value) => {
      navigateWithParams({ dateTo: value || null, page: 1 });
    },
    [navigateWithParams]
  );

  const handlePageChange = useCallback(
    (nextPage) => {
      navigateWithParams({ page: nextPage });
    },
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
    filters: {
      searchTerm: localSearchTerm,
      status,
      roleId,
      officeId,
      directionId,
      dateFrom,
      dateTo,
    },
    paginationState: {
      currentPage,
      totalPages,
      totalCount,
    },
    sortConfig: {
      key: sortKey || null,
      direction: sortDirection === "desc" ? "desc" : "asc",
    },
    handlers: {
      handleSearchChange,
      handleStatusChange,
      handleFilterChange,
      handleDateFromChange,
      handleDateToChange,
      handlePageChange,
      handleSortChange,
      handleReset,
    },
  };
}
