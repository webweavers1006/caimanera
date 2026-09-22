"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SHARED_CONFIG } from "@/features/shared";

const { ACTIONS, TABLE_ACTIONS } = SHARED_CONFIG.UI.LABELS;

/**
 * Shared component for table row actions using a DropdownMenu.
 * 
 * @param {Object[]} actions - Array of action configurations.
 * @param {string} actions[].label - Display text for the action.
 * @param {React.Component} [actions[].icon] - Lucide icon component.
 * @param {Function} actions[].onClick - Function to call with the row data.
 * @param {string} [actions[].variant] - "default" or "destructive".
 * @param {Function} [actions[].show] - Function (row) => boolean to conditionally show the action.
 * @param {boolean} [actions[].divider] - If true, renders a separator before this item.
 * @param {Object} row - The row data object.
 */
export function TableActions({ actions = [], row }) {
  // Filter actions based on show() condition if provided
  const visibleActions = actions.filter(action => {
    if (typeof action.show === 'function') {
      return action.show(row);
    }
    return true;
  });

  if (visibleActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">{TABLE_ACTIONS.OPEN_MENU}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{ACTIONS.TITLE}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visibleActions.map((action, index) => {
          const Icon = action.icon;

          return (
            <React.Fragment key={action.label || index}>
              {action.divider && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row);
                }}
                variant={action.variant}
              >
                {Icon && <Icon className={`mr-2 h-4 w-4 ${action.className || ""}`} />}
                <span>{action.label}</span>
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
