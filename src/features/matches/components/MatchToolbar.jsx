"use client";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { usePermission } from "@/features/permissions/components/PermissionsProvider";
import { MATCH_CONFIG } from "../config/match.constants";
import { Toolbar } from "@/components/shared/Toolbar";

const STATUS_FILTERS = [
  { value: "upcoming", label: "Próximos" },
  { value: "all", label: "Todos" },
  { value: "open", label: "Abiertos" },
  { value: "full", label: "Llenos" },
  { value: "past", label: "Finalizados" },
  { value: "canceled", label: "Cancelados" },
];

export function MatchToolbar({
  searchTerm,
  status = "upcoming",
  onStatusChange,
  onSearchChange,
  onReset,
  onCreate,
}) {
  const { can } = usePermission();
  const { LABELS } = MATCH_CONFIG.UI;

  return (
    <Toolbar>
      <Toolbar.Main>
        <Toolbar.Filters>
          <Toolbar.FilterItem label="Estado" width="190px">
            <NativeSelect
              value={status}
              onChange={(event) => onStatusChange?.(event.target.value)}
              className="w-full"
              aria-label="Filtrar partidos por estado"
            >
              {STATUS_FILTERS.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Toolbar.FilterItem>
        </Toolbar.Filters>
      </Toolbar.Main>

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

          {can(MATCH_CONFIG.PERMISSIONS.WRITE) && (
            <Button onClick={onCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{LABELS.TOOLBAR.NEW_BUTTON}</span>
            </Button>
          )}
        </Toolbar.Actions>
      </Toolbar.Footer>
    </Toolbar>
  );
}
