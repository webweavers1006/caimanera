"use client";

import { createContext, useContext, useMemo } from "react";

const PermissionCatalogContext = createContext(null);

/**
 * PROVIDER: Centraliza el catálogo de TODOS los permisos del sistema.
 * Se usa en la gestión de seguridad (Roles) para mostrar la lista de selección.
 */
export function PermissionCatalogProvider({ children, permissions = [] }) {
  const value = useMemo(() => ({
    permissions,
    count: permissions.length
  }), [permissions]);

  return (
    <PermissionCatalogContext.Provider value={value}>
      {children}
    </PermissionCatalogContext.Provider>
  );
}

/**
 * HOOK: Hook para consumir el catálogo de permisos.
 */
export function usePermissionCatalog() {
  const context = useContext(PermissionCatalogContext);
  if (!context) {
    throw new Error("usePermissionCatalog must be used within a PermissionCatalogProvider");
  }
  return context;
}
