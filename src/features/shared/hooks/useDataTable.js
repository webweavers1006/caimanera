import { useState, useMemo, useTransition } from "react";

/**
 * Hook genérico para manejo de tablas (Paginación, Ordenamiento, Filtrado, Selección).
 * 
 * @param {Array} data - Datos originales.
 * @param {Object} options - Opciones de configuración.
 * @param {number} options.itemsPerPage - Elementos por página (default: 10).
 * @param {Function} options.getValue - Función personalizada para obtener valores de ordenamiento.
 * @param {Function} options.filterFunction - Función personalizada para filtrado.
 */
const EMPTY_ARRAY = [];

export function useDataTable(data = EMPTY_ARRAY, { 
  itemsPerPage = 10, 
  getValue = (item, key) => item[key],
  filterFunction = () => true 
} = {}) {
  
  // --- Estados Base ---
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isPending, startTransition] = useTransition();

  // --- Lógica de Procesamiento (Filtrado + Ordenamiento) ---
  const processedData = useMemo(() => {
    // 1. Filtrado
    let result = data.filter(filterFunction);

    // 2. Ordenamiento
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = getValue(a, sortConfig.key);
        let bValue = getValue(b, sortConfig.key);

        // Normalización para comparación segura
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filterFunction, sortConfig, getValue]);

  // --- Lógica de Paginación ---
  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;
  
  // Asegurar que la página actual sea válida si los datos cambian
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  // --- Lógica de Selección ---
  const isAllPageSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));
  const isPageIndeterminate = paginatedData.some((item) => selectedIds.has(item.id)) && !isAllPageSelected;

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAllPage = (checked) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      paginatedData.forEach((item) => newSelected.add(item.id));
    } else {
      paginatedData.forEach((item) => newSelected.delete(item.id));
    }
    setSelectedIds(newSelected);
  };

  const clearSelection = () => setSelectedIds(new Set());

  // --- Handlers ---
  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return {
    processedData,
    paginatedData,
    totalPages,
    currentPage,
    totalItems: processedData.length,
    setCurrentPage: handlePageChange,
    
    sortConfig,
    handleSort,
    
    selectedIds,
    isAllPageSelected,
    isPageIndeterminate,
    handleSelectRow,
    handleSelectAllPage,
    clearSelection,
    
    isPending,
    startTransition
  };
}
