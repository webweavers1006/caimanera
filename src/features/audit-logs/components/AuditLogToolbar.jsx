"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AUDIT_LOG_CONFIG } from "../config/audit-log.constants";
import { Toolbar } from "@/components/shared/Toolbar";

export function AuditLogToolbar({ searchTerm, onSearchChange, onReset }) {
  const { LABELS } = AUDIT_LOG_CONFIG.UI;

  return (
    <Toolbar>
      <Toolbar.Footer>
        <Toolbar.Search
          label={LABELS.TOOLBAR.SEARCH_LABEL}
          placeholder={LABELS.TOOLBAR.SEARCH_PLACEHOLDER}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <Toolbar.Actions label={LABELS.TOOLBAR.DIVIDER_ACTIONS}>
          <Button variant="secondary" onClick={onReset} className="gap-2">
            <X className="h-4 w-4" />
            <span>{LABELS.CLEAN_BUTTON}</span>
          </Button>
        </Toolbar.Actions>
      </Toolbar.Footer>
    </Toolbar>
  );
}
