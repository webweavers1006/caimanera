"use client";

import { useRef, useCallback, useState, useEffect } from "react";

/**
 * Shared debounced search hook — replaces 20+ identical implementations
 * across use-*-table-filters.js files.
 *
 * @param {string} defaultValue - Initial search value
 * @param {number} [delay=400] - Debounce delay in ms
 * @param {(value: string) => void} [onDebounce] - Called with debounced value
 * @returns {{ searchTerm: string, debouncedSearchTerm: string, setSearchTerm: (value: string) => void }}
 */
export function useDebouncedSearch(defaultValue = "", delay = 400, onDebounce) {
  const timerRef = useRef(null);
  const [searchTerm, setSearchTermState] = useState(defaultValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(defaultValue);

  const setSearchTerm = useCallback((value) => {
    setSearchTermState(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, delay);
  }, [delay]);

  // Call onDebounce when debounced value changes
  useEffect(() => {
    if (onDebounce && debouncedSearchTerm !== defaultValue) {
      onDebounce(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, defaultValue, onDebounce]);

  return { searchTerm, debouncedSearchTerm, setSearchTerm };
}
