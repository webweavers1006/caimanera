"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

/**
 * SUB-COMPONENT: PermissionGroup
 * Renders a group of permissions belonging to the same module inside an accordion.
 */
export function PermissionGroup({ 
  moduleName, 
  permissions = [], 
  selectedSet, 
  onToggle, 
  onSelectGroup 
}) {
  const selectedInGroup = permissions.filter(p => selectedSet.has(p.id)).length;
  const isAllGroupSelected = selectedInGroup === permissions.length;
  const isIndeterminate = selectedInGroup > 0 && selectedInGroup < permissions.length;

  return (
    <AccordionItem value={moduleName} className="border border-border/40 rounded-lg overflow-hidden bg-muted/5">
      <div className="flex items-center px-4 hover:bg-muted/30 transition-colors">
        <Checkbox 
          id={`group-${moduleName}`}
          checked={isIndeterminate ? "indeterminate" : isAllGroupSelected}
          onCheckedChange={(checked) => onSelectGroup(moduleName, !!checked)}
          className="mr-3"
        />
        <AccordionTrigger className="flex-1 py-4 hover:no-underline">
          <div className="flex items-center gap-3">
            <span className="font-medium capitalize text-sm">{moduleName}</span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-background border-border/60">
              {selectedInGroup} / {permissions.length}
            </Badge>
          </div>
        </AccordionTrigger>
      </div>
      
      <AccordionContent className="px-4 pb-4 pt-2 border-t border-border/20 bg-background/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {permissions.map((p) => (
            <div 
              key={p.id} 
              className="flex items-start gap-3 p-2.5 rounded-md border border-transparent hover:border-border/40 hover:bg-background transition-all group"
            >
              <Checkbox 
                id={`perm-${p.id}`}
                checked={selectedSet.has(p.id)}
                onCheckedChange={() => onToggle(p.id)}
                className="mt-0.5"
              />
              <div className="flex flex-col gap-0.5 cursor-pointer flex-1" onClick={() => onToggle(p.id)}>
                <label 
                  htmlFor={`perm-${p.id}`}
                  className="text-xs font-semibold leading-none cursor-pointer group-hover:text-primary transition-colors"
                >
                  {p.slug.split(":")[1].replace(/_/g, " ")}
                </label>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
