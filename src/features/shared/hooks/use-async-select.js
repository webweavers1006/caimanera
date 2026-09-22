"use client"

import * as React from "react"
import { logger } from "@/features/shared"
import {
  getSelectOptionsCacheKey,
  getCachedSelectOptions,
  setCachedSelectOptions,
} from "@/features/shared/lib/select-options-cache"

const DEBOUNCE_MS = 300

/**
 * Hook that encapsulates all state, refs, fetch logic, debounce,
 * open/close handling, and derived values for an async search-select.
 *
 * @param {Object} params
 * @param {string|number} params.value - Current selected value.
 * @param {Function} params.onChange - Called with new value (or "" to clear).
 * @param {Function} params.fetcher - (query: string, parentValue?: any) => Promise<Option[]>
 * @param {Function} [params.getLabel] - (opt) => string display label.
 * @param {Function} [params.getValue] - (opt) => string|number option value.
 * @param {Object|null} [params.initialData] - Pre-loaded option for edit mode.
 * @param {boolean} [params.fetchOnOpen] - Whether to fetch on first open.
 * @param {Function} [params.onOptionsLoad] - Callback when options load.
 * @param {*} [params.parentValue] - Value to pass as second argument to fetcher (e.g. countryId for states).
 * @returns {Object} Hook state and handlers.
 */
export function useAsyncSelect({
  value,
  onChange,
  fetcher,
  getLabel = (opt) => opt.label || opt.nombre,
  getValue = (opt) => opt.value || opt.id,
  initialData = null,
  fetchOnOpen = true,
  onOptionsLoad,
  parentValue,
  cacheKey,
}) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState(initialData ? [initialData] : [])
  const [loading, setLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // ---- Refs ----
  const mountedRef = React.useRef(true)
  const reqIdRef = React.useRef(0)
  const cbRef = React.useRef({ fetcher, getValue, getLabel, onOptionsLoad })
  const prevOpenRef = React.useRef(false)
  const prevSearchRef = React.useRef("")
  const lastQueryRef = React.useRef("")
  const didInitRef = React.useRef(false)
  const prevParentRef = React.useRef(parentValue)

  // Lifecycle
  React.useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Sync all callback props in a single effect
  React.useEffect(() => {
    cbRef.current = { fetcher, getValue, getLabel, onOptionsLoad }
  }, [fetcher, getValue, getLabel, onOptionsLoad])

  // ---- Derived selected option (sync — no extra render frame) ----
  const selectedOption = React.useMemo(() => {
    if (!value || options.length === 0) return initialData ?? null
    const found = options.find(
      (opt) => String(cbRef.current.getValue(opt)) === String(value)
    )
    return found ?? initialData ?? null
  }, [value, options, initialData])

  // ---- Fetch (requestId guards against stale async responses) ----
  // Client-side cache (TTL 60s) so catalog dropdowns don't depend on the
  // router queue — instant reopen. Invalidated on catalog create/edit.
  const loadOptions = React.useCallback(async (query = "") => {
    const id = ++reqIdRef.current
    lastQueryRef.current = query
    const fetcherFn = cbRef.current.fetcher
    const key = getSelectOptionsCacheKey(fetcherFn, query, parentValue, cacheKey)

    const cached = getCachedSelectOptions(key)
    if (cached) {
      if (mountedRef.current && reqIdRef.current === id) {
        setOptions(cached)
        cbRef.current.onOptionsLoad?.(cached)
      }
      return
    }

    setLoading(true)
    try {
      const results = await fetcherFn(query, parentValue)
      if (mountedRef.current && reqIdRef.current === id) {
        const arr = Array.isArray(results) ? results : []
        setOptions(arr)
        setCachedSelectOptions(key, arr)
        cbRef.current.onOptionsLoad?.(arr)
      }
    } catch (error) {
      logger.error("AsyncSelect error:", error)
      if (mountedRef.current && reqIdRef.current === id) setOptions([])
    } finally {
      if (mountedRef.current && reqIdRef.current === id) setLoading(false)
    }
  }, [parentValue, cacheKey])

  // ---- Initial load when value is pre-set (edit mode) ----
  React.useEffect(() => {
    if (value && !didInitRef.current) {
      didInitRef.current = true
      loadOptions("")
    }
  }, [value, loadOptions])

  // ---- Unified open / search effect ----
  React.useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    const searchChanged = searchTerm !== prevSearchRef.current
    prevOpenRef.current = open
    prevSearchRef.current = searchTerm

    if (!open) return

    if (justOpened) {
      if (options.length === 0 && fetchOnOpen) loadOptions("")
      return
    }

    if (searchChanged) {
      const timer = setTimeout(() => loadOptions(searchTerm), DEBOUNCE_MS)
      return () => clearTimeout(timer)
    }
  }, [open, searchTerm, options.length, fetchOnOpen, loadOptions])

  // ---- Parent value change → reset selection + options ----
  React.useEffect(() => {
    if (prevParentRef.current !== parentValue) {
      prevParentRef.current = parentValue
      // Clear current selection when parent changes (e.g. new country → reset state)
      if (value) {
        onChange?.("")
      }
      setOptions([])
      setSearchTerm("")
      prevSearchRef.current = ""
      lastQueryRef.current = ""
      // Re-fetch with new parent if dropdown is open
      if (open) {
        loadOptions("")
      }
    }
  }, [parentValue, value, onChange, open, loadOptions])

  // ---- Open / close handler — resets search state on close ----
  const handleOpenChange = React.useCallback((next) => {
    if (!next) {
      setSearchTerm("")
      prevSearchRef.current = ""
      lastQueryRef.current = ""
    }
    setOpen(next)
  }, [])

  // ---- Clear search — resets to initial options immediately ----
  const handleClear = React.useCallback(() => {
    setSearchTerm("")
    prevSearchRef.current = ""
    lastQueryRef.current = ""
    loadOptions("")
  }, [loadOptions])

  // ---- Derived UI state ----
  const displayLabel = selectedOption ? cbRef.current.getLabel(selectedOption) : null
  const showOverlay =
    loading || (open && searchTerm !== "" && searchTerm !== lastQueryRef.current)

  return {
    open,
    options,
    loading,
    searchTerm,
    setSearchTerm,
    selectedOption,
    displayLabel,
    showOverlay,
    handleOpenChange,
    handleClear,
  }
}
