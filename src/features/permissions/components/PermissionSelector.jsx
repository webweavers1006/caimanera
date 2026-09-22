"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert } from "lucide-react";

import { PermissionHeader } from "./PermissionHeader";
import { PermissionGroup } from "./PermissionGroup";
import { usePermissionSelector } from "../hooks/use-permission-selector";
import { usePermissionCatalog } from "./PermissionCatalogProvider";
import { PERMISSION_CONFIG } from "../config/permission.constants";

const { SELECTOR } = PERMISSION_CONFIG.UI.LABELS;

/**
 * COMPONENT: PermissionSelector
 * The main component to manage system permissions.
 * Consumes permissions from the context (PermissionProvider).
 */
export function PermissionSelector({
  value = [],
  onChange,
  label = SELECTOR.TITLE,
  valueType = "id"
}) {
  const { permissions } = usePermissionCatalog();
  const {
    searchTerm,
    setSearchTerm,
    localSelected,
    groupedData,
    togglePermission,
    toggleModule,
    selectAll
  } = usePermissionSelector({ value, onChange, valueType });

  const filteredGroups = Object.entries(groupedData);

  return (
    <div className="space-y-4 border rounded-xl p-5 bg-card shadow-sm border-border/60 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PermissionHeader 
        label={label}
        totalSelected={localSelected.size}
        totalPermissions={permissions.length}
        onSelectAll={selectAll}
      />

      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder={SELECTOR.SEARCH_PLACEHOLDER}
          className="pl-10 bg-muted/20 border-border/40 focus:bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[450px] pr-4 -mr-4">
        <Accordion type="multiple" className="space-y-3">
          {filteredGroups.map(([moduleName, perms]) => (
            <PermissionGroup 
              key={moduleName}
              moduleName={moduleName}
              permissions={perms}
              selectedSet={localSelected}
              onToggle={togglePermission}
              onSelectGroup={toggleModule}
            />
          ))}
        </Accordion>

        {filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-lg bg-muted/5 animate-in zoom-in-95 duration-300">
            <ShieldAlert className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">{SELECTOR.EMPTY_TITLE}</p>
            <p className="text-xs opacity-60">{SELECTOR.EMPTY_SUBTITLE}</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
