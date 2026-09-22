"use client";

import { createContext, useContext } from 'react';

// Creamos el contexto con un valor por defecto vacío
const PermissionsContext = createContext([]);

/**
 * Provider que distribuye los permisos del usuario actual a toda la aplicación.
 * @param {Object} props
 * @param {string[]} props.permissions - Array de slugs de permisos (ej. ['users:read', 'users:create'])
 * @param {React.ReactNode} props.children
 */
const EMPTY_ARRAY = [];

export function PermissionsProvider({ permissions = EMPTY_ARRAY, children }) {
  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
}

/**
 * Hook para verificar permisos en componentes de cliente.
 * @returns {Object} { can: (slug: string) => boolean }
 */
export function usePermission() {
  const permissions = useContext(PermissionsContext);

  /**
   * Verifica si el usuario tiene un permiso específico.
   * @param {string} slug - El slug del permiso a verificar.
   * @returns {boolean}
   */
  const can = (slug) => {
    // Verificación normal
    return permissions.includes(slug);
  };

  return { can, permissions };
}
