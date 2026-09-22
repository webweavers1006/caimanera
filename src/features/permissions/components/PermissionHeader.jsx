"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck } from "lucide-react";
import { PERMISSION_CONFIG } from "../config/permission.constants";

const { HEADER } = PERMISSION_CONFIG.UI.LABELS;

/**
 * SUB-COMPONENT: PermissionHeader
 * Displays the title, selection count, and a global "Select All" toggle.
 */
export function PermissionHeader({ 
  label, 
  totalSelected, 
  totalPermissions, 
  onSelectAll 
}) {
  const isAllSelected = totalSelected === totalPermissions && totalPermissions > 0;
  const isIndeterminate = totalSelected > 0 && totalSelected < totalPermissions;

  return (
    <div className="flex items-center justify-between pb-4 border-b border-border/40">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-base leading-none">{label}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {HEADER.SELECTED_COUNT(totalSelected, totalPermissions)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/40">
        <Checkbox 
          id="select-all-permissions"
          checked={isIndeterminate ? "indeterminate" : isAllSelected}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
        />
        <label 
          htmlFor="select-all-permissions"
          className="text-xs font-medium cursor-pointer"
        >
          {isAllSelected ? HEADER.DESELECT_ALL : HEADER.SELECT_ALL}
        </label>
      </div>
    </div>
  );
}
