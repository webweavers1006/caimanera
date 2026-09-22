import { useState, useCallback } from "react";
import { useDataTable } from "@/features/shared/hooks/useDataTable";

export function useUserTable(initialUsers) {
  // Estados de Filtros (Específicos de Usuarios)
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Definición de Filtros y Ordenamiento para useDataTable
  const filterFunction = useCallback((user) => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.idCard?.includes(searchTerm);
    
    const matchesArea = areaFilter === "all" || user.area?.id === areaFilter;
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? user.isActive : !user.isActive);

    return matchesSearch && matchesArea && matchesStatus;
  }, [searchTerm, areaFilter, statusFilter]);

  const getValue = useCallback((item, key) => {
    switch (key) {
      case 'area': return item.area?.name || '';
      case 'rol': return item.role?.name || '';
      default: return item[key];
    }
  }, []);

  // Uso del Hook Genérico
  const {
    paginatedData: paginatedUsers,
    processedData: filteredUsers,
    currentPage,
    totalPages,
    setCurrentPage,
    sortConfig,
    handleSort,
    selectedIds: selectedUsers,
    isAllPageSelected,
    isPageIndeterminate,
    handleSelectRow: handleSelectUser,
    handleSelectAllPage,
    clearSelection,
    isPending,
    startTransition
  } = useDataTable(initialUsers, {
    getValue,
    filterFunction
  });

  // Manejadores de Filtros (Wrappers para resetear página)
  const handleSearchChange = (value) => {
    startTransition(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    });
  };

  const handleAreaChange = (value) => {
    setAreaFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return {
    // Data
    filteredUsers,
    paginatedUsers,
    totalPages,
    currentPage,
    isPending,
    
    // UI State (Filters)
    searchTerm,
    areaFilter,
    statusFilter,

    // Handlers (Filters)
    handleSearchChange,
    handleAreaChange,
    handleStatusChange,
    setCurrentPage,

    // Sorting
    sortConfig,
    handleSort,

    // Selection
    selectedUsers,
    isAllPageSelected,
    isPageIndeterminate,
    handleSelectUser,
    handleSelectAllPage,
    clearSelection
  };
}
