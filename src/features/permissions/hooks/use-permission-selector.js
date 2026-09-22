"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { usePermissionCatalog } from "../components/PermissionCatalogProvider";

/**
 * HOOK: usePermissionSelector
 * Manages the logic for selecting permissions from a grouped catalog.
 * Performance optimized using Sets for O(1) lookups.
 */
export function usePermissionSelector({ 
  value = [], 
  onChange, 
  valueType = "id" 
}) {
  const { permissions: rawPermissions } = usePermissionCatalog();
  const permissions = Array.isArray(rawPermissions) ? rawPermissions : [];
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModule, setActiveModule] = useState("all");
  
  // localSelected is a Set of either IDs or Slugs depending on valueType
  const [localSelected, setLocalSelected] = useState(new Set(value));

  // Sync with external value changes
  useEffect(() => {
    setLocalSelected(new Set(value));
  }, [value]);

  // Group permissions by module (first part of slug "module:action")
  const groupedData = useMemo(() => {
    const groups = {};
    permissions.forEach(p => {
      const [moduleName] = p.slug.split(":");
      const normalizedModule = moduleName || "system";
      
      // Search filter
      const matchesSearch = 
        p.slug.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (matchesSearch) {
        if (!groups[normalizedModule]) groups[normalizedModule] = [];
        groups[normalizedModule].push(p);
      }
    });
    return groups;
  }, [permissions, searchTerm]);

  const modules = useMemo(() => {
    const mods = Object.keys(groupedData);
    return mods.sort();
  }, [groupedData]);

  const togglePermission = useCallback((permValue) => {
    const next = new Set(localSelected);
    if (next.has(permValue)) {
      next.delete(permValue);
    } else {
      next.add(permValue);
    }
    setLocalSelected(next);
    if (onChange) onChange(Array.from(next));
  }, [localSelected, onChange]);

  const toggleModule = useCallback((moduleName, checked) => {
    const next = new Set(localSelected);
    const modulePerms = groupedData[moduleName] || [];
    
    modulePerms.forEach(p => {
      const val = valueType === "id" ? p.id : p.slug;
      if (checked) {
        next.add(val);
      } else {
        next.delete(val);
      }
    });
    
    setLocalSelected(next);
    if (onChange) onChange(Array.from(next));
  }, [groupedData, localSelected, onChange, valueType]);

  const selectAll = useCallback((checked) => {
    const next = checked 
      ? new Set(permissions.map(p => valueType === "id" ? p.id : p.slug))
      : new Set();
    
    setLocalSelected(next);
    if (onChange) onChange(Array.from(next));
  }, [permissions, onChange, valueType]);

  return {
    searchTerm,
    setSearchTerm,
    activeModule,
    setActiveModule,
    localSelected,
    groupedData,
    modules,
    togglePermission,
    toggleModule,
    selectAll
  };
}
