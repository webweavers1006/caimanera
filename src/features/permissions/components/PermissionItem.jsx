"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/features/shared";

/**
 * Atomo memoizado para un solo Permiso.
 * Maximiza el rendimiento evitando re-renderizados innecesarios en listas grandes.
 */
export const PermissionItem = React.memo(({ permission, isSelected, onToggle }) => {
  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-2 rounded-lg border select-none cursor-pointer group transition-colors overflow-hidden",
        isSelected
          ? "bg-primary/5 border-primary/30"
          : "bg-transparent border-transparent hover:bg-accent/50"
      )}
      onClick={() => onToggle(permission.id)}
    >
      {/* Indicador de Check Visual (Ultra-estable, sin lógica de Radix) */}
      <div className={cn(
        "mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
        isSelected
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-background border-input group-hover:border-primary/50"
      )}>
        {isSelected && <Check className="w-3 h-3" strokeWidth={4} />}
      </div>

      <div className="space-y-0.5 overflow-hidden">
        <p className={cn(
          "text-sm font-semibold leading-tight truncate",
          isSelected ? "text-primary" : "text-foreground"
        )}>
          {permission.label}
        </p>
        {permission.description && (
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
            {permission.description}
          </p>
        )}
      </div>
    </div>
  );
}, (prev, next) => {
  // Solo re-renderizar si cambia el estado de selección o el objeto del permiso
  return prev.isSelected === next.isSelected && prev.permission.id === next.permission.id;
});

// Asignar display name para debugging
PermissionItem.displayName = "PermissionItem";
