"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/shared/Toolbar";
import { TRANSACTION_CONFIG } from "../config/transaction.constants";

const { LABELS } = TRANSACTION_CONFIG.UI;

export function TransactionToolbar({ searchTerm, onSearchChange, onReset }) {
  return (
    <Toolbar>
      <Toolbar.Footer>
        <Toolbar.Search
          label={LABELS.TOOLBAR.SEARCH_LABEL}
          placeholder={LABELS.TOOLBAR.SEARCH_PLACEHOLDER}
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <Toolbar.Actions label={LABELS.TOOLBAR.ACTIONS_LABEL}>
          <Button variant="secondary" onClick={onReset} className="gap-2">
            <X className="h-4 w-4" />
            <span>Limpiar</span>
          </Button>
        </Toolbar.Actions>
      </Toolbar.Footer>
    </Toolbar>
  );
}
