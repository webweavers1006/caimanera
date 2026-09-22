"use client";

import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/features/shared"

import { 
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/**
 * Root container for the Toolbar.
 * Provides the glassmorphism background and a two-column layout.
 */
const ToolbarRoot = ({ children, className }) => (
  <div className={cn(
    "flex flex-col gap-2 rounded-xl bg-muted/40 p-4 w-full",
    className
  )}>
    {children}
  </div>
);

/**
 * Container for the bottom row (Search + Actions).
 * This ensures dividers and inputs are perfectly aligned.
 */
const ToolbarFooter = ({ children, className }) => (
  <div className={cn("flex flex-col md:flex-row items-end gap-4 w-full mt-2", className)}>
    {children}
  </div>
);

/**
 * Main container for Filters (Top part).
 */
const ToolbarMain = ({ children, className }) => (
  <div className={cn("flex-1 flex flex-col gap-4 min-w-0" , className)}>
    {children}
  </div>
);

/**
 * Container for filters (Top part of Main).
 */
const ToolbarFilters = ({ children, className }) => (
  <div className={cn("flex flex-wrap items-end gap-3 w-full", className)}>
    {children}
  </div>
);

/**
 * Standardized Search input (Bottom part of Main).
 * Always takes 100% of the available width in its block.
 */
const ToolbarSearch = ({ label, value, onChange, placeholder, className, ...props }) => (
  <div className={cn("flex flex-col gap-1.5 w-full", className)}>
    {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
    <div className="relative w-full">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9 h-10 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring w-full"
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  </div>
);

/**
 * Right-aligned container for action buttons.
 * On small screens, collapses into a "3 dots" menu.
 */
const ToolbarActions = ({ children, label, className }) => {
  // Helper to flatten children including groups
  const flattenActions = (nodes) => {
    return React.Children.toArray(nodes).flatMap(child => {
      if (child.type === ToolbarActionGroup) {
        return React.Children.toArray(child.props.children);
      }
      return child;
    });
  };

  const allActions = flattenActions(children);

  return (
    <div className={cn("flex flex-col md:self-end flex-1 md:flex-none", className)}>
      {label && <ToolbarDivider label={label} />}
      
      <div className="flex shrink-0 self-end items-center gap-2">
        {/* Desktop View: Regular buttons or groups */}
        <div className="hidden md:flex items-center gap-2">
          {children}
        </div>

        {/* Mobile View: 3 Dots Menu (Flattened) */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 bg-background/40 hover:bg-background/60">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {allActions.map((child, index) => {
                if (!child.props) return null;
                const { children: btnLabel, onClick, disabled } = child.props;
                
                return (
                  <DropdownMenuItem 
                    key={index} 
                    onClick={onClick}
                    disabled={disabled}
                    className="flex items-center gap-2"
                  >
                    {btnLabel}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

/**
 * A group of actions that appears as a Dropdown on Desktop
 * but flattens into the main menu on Mobile.
 */
const ToolbarActionGroup = ({ label, icon: Icon, children, className }) => {
  return (
    <>
      {/* Desktop: Dropdown */}
      <div className={cn("hidden md:block", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {React.Children.map(children, (child) => (
              <DropdownMenuItem 
                onClick={child.props.onClick} 
                disabled={child.props.disabled}
                className="flex items-center gap-2"
              >
                {child.props.children}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Mobile: Managed by ToolbarActions (it will pick children from here) */}
    </>
  );
};

/**
 * Visual divider with optional label to separate sections.
 */
const ToolbarDivider = ({ label, className }) => (
  <div className={cn("flex items-center gap-4 py-2 w-full", className)}>
    {label && (
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 whitespace-nowrap">
        {label}
      </span>
    )}
    <div className="h-[1px] w-full bg-border/40" />
  </div>
);

/**
 * Wrapper for an individual filter with a label.
 */
const ToolbarFilterItem = ({ label, children, className, width = "180px" }) => {
  const minWidth = typeof width === 'number' ? `${width}px` : width;

  return (
    <div
      className={cn("flex flex-col gap-1.5 flex-1", className)}
      style={{ minWidth: minWidth }}
    >
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
      {children}
    </div>
  );
};

// Composite Component
export const Toolbar = Object.assign(ToolbarRoot, {
  Main: ToolbarMain,
  Footer: ToolbarFooter,
  Filters: ToolbarFilters,
  Search: ToolbarSearch,
  FilterItem: ToolbarFilterItem,
  Actions: ToolbarActions,
  ActionGroup: ToolbarActionGroup,
  Divider: ToolbarDivider,
});
