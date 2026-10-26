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
  const onDebounceRef = useRef(onDebounce);
  const isFirstRun = useRef(true);
  const [searchTerm, setSearchTermState] = useState(defaultValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(defaultValue);

  useEffect(() => {
    onDebounceRef.current = onDebounce;
  }, [onDebounce]);

  const setSearchTerm = useCallback((value) => {
    setSearchTermState(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, delay);
  }, [delay]);

  // Fire the callback on actual user-driven changes. Skipping the first run
  // avoids an unnecessary navigation on mount, and no longer compares against
  // defaultValue (which prevented clearing the search back to the URL value).
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    onDebounceRef.current?.(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { searchTerm, debouncedSearchTerm, setSearchTerm };
}
