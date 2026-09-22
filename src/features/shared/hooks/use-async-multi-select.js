"use client"

import * as React from "react"
import {
  getSelectOptionsCacheKey,
  getCachedSelectOptions,
  setCachedSelectOptions,
} from "@/features/shared/lib/select-options-cache"

/**
 * Debounced callback hook — delays execution until no calls for `delay` ms.
 */
function useDebouncedCallback(callback, delay) {
  const timeoutRef = React.useRef(null);
  return React.useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { callback(...args); }, delay);
  }, [callback, delay]);
}

/**
 * Hook for async multi-select dropdown logic.
 * Encapsulates state, search, toggle, select-all, and options management.
 *
 * @param {Object} params
 * @returns {Object} State and handlers for the multi-select UI.
 */
export function useAsyncMultiSelect({
  value = [],
  onChange,
  fetcher,
  getLabel = (opt) => opt.label || opt.nombre,
  getValue = (opt) => opt.value || opt.id,
  initialData = [],
  minSearchLength = 0,
  fetchOnOpen = false,
  initialQuery = "",
  allowEmptyQuery = false,
  cacheKey,
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedOptions, setSelectedOptions] = React.useState(Array.isArray(initialData) ? initialData : [])
  const [options, setOptions] = React.useState(Array.isArray(initialData) ? initialData.filter(o => getValue(o) !== 'ALL') : [])
  const [loading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const isMountedRef = React.useRef(true)

  const selectedValues = Array.isArray(value) ? value : []

  // Stabilize callback + state refs to avoid useEffect dependency churn
  const getValueRef = React.useRef(getValue);
  getValueRef.current = getValue;
  const getLabelRef = React.useRef(getLabel);
  getLabelRef.current = getLabel;
  const selectedOptionsRef = React.useRef(selectedOptions);
  selectedOptionsRef.current = selectedOptions;

  // Sync selected options when value or options change
  React.useEffect(() => {
    const resolveValue = getValueRef.current;
    if (selectedValues.length && options.length > 0) {
      const selectedMap = selectedValues.map(val => {
        const existing = selectedOptions.find(opt => String(resolveValue(opt)) === String(val))
        if (existing) return existing
        return options.find(opt => String(resolveValue(opt)) === String(val))
      }).filter(Boolean)
      setSelectedOptions(selectedMap)
    } else if (selectedValues.length === 0) {
      setSelectedOptions([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options])

  React.useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  // Fetch options on mount when values are pre-set (e.g., URL params on refresh)
  // so labels resolve immediately without requiring the user to open the dropdown
  React.useEffect(() => {
    if (selectedValues.length > 0 && options.length === 0 && !loading) {
      setLoading(true)
      fetcher({ searchTerm: initialQuery || "" })
        .then(results => {
          if (!isMountedRef.current) return
          const arr = Array.isArray(results) ? results : []
          setOptions(arr.filter(r => getValueRef.current(r) !== 'ALL'))
        })
        .catch(() => {
          if (!isMountedRef.current) setOptions([])
        })
        .finally(() => {
          if (!isMountedRef.current) return
          setLoading(false)
        })
    }
  }, [selectedValues.length, options.length, loading, fetcher, initialQuery])

  const performSearch = React.useCallback(async (term) => {
    const nextQuery = typeof term === "string" ? term.trim() : ""
    const canSearchEmpty = allowEmptyQuery && nextQuery.length === 0
    const canSearchText = nextQuery.length >= minSearchLength
    const currentSelected = selectedOptionsRef.current;

    if (!canSearchEmpty && !canSearchText) {
      if (!isMountedRef.current) return;
      setOptions(currentSelected);
      return;
    }
    setLoading(true)
    try {
      const key = getSelectOptionsCacheKey(fetcher, nextQuery, undefined, cacheKey)
      let results = getCachedSelectOptions(key)
      if (!results) {
        results = await fetcher({ searchTerm: nextQuery })
        if (Array.isArray(results)) setCachedSelectOptions(key, results)
      }
      if (!isMountedRef.current) return

      results = (Array.isArray(results) ? results : []).filter(r => getValueRef.current(r) !== 'ALL')

      const newOptions = [...results];
      currentSelected.forEach(selected => {
        if (!newOptions.some(opt => getValueRef.current(opt) === getValueRef.current(selected))) {
          newOptions.unshift(selected)
        }
      })
      setOptions(newOptions)
    } catch (_error) {
      if (!isMountedRef.current) return
      setOptions(currentSelected)
    } finally {
      if (!isMountedRef.current) return
      setLoading(false)
    }
  }, [allowEmptyQuery, cacheKey, fetcher, minSearchLength])

  const handleSearch = useDebouncedCallback(performSearch, 300)

  React.useEffect(() => {
    if (!open || !fetchOnOpen || query) return
    handleSearch(initialQuery)
  }, [fetchOnOpen, handleSearch, initialQuery, open, query])

  const toggleOption = (option) => {
    const val = getValue(option)
    const isSelected = selectedValues.some(v => String(v) === String(val))
    let newValues, newSelectedOptions;
    if (isSelected) {
      newValues = selectedValues.filter(v => String(v) !== String(val))
      newSelectedOptions = selectedOptions.filter(opt => String(getValue(opt)) !== String(val))
    } else {
      newValues = [...selectedValues, val]
      newSelectedOptions = [...selectedOptions, option]
    }
    setSelectedOptions(newSelectedOptions)
    onChange?.(newValues)
  }

  const selectAll = () => {
    if (selectedValues.length === options.length) {
      setSelectedOptions([])
      onChange?.([])
    } else {
      setSelectedOptions([...options])
      onChange?.(options.map(o => getValue(o)))
    }
  }

  return {
    open,
    setOpen,
    options,
    selectedOptions,
    selectedValues,
    loading,
    query,
    setQuery,
    handleSearch,
    toggleOption,
    selectAll,
  }
}
