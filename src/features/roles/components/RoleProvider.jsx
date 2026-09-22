"use client";

import { createContext, useContext, useMemo } from "react";

const RoleContext = createContext(null);

/**
 * PROVIDER: Centraliza el catálogo de Roles para evitar prop drilling.
 * Útil para formularios de usuarios o filtros que necesitan la lista de roles.
 */
export function RoleProvider({ children, roles = [] }) {
  const value = useMemo(() => ({
    roles,
    count: roles.length
  }), [roles]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

/**
 * HOOK: Hook personalizado para consumir los datos de Roles.
 */
export function useRoleProvider() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRoleProvider must be used within a RoleProvider");
  }
  return context;
}
