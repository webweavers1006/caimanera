"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";

function Chip({ active, children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors disabled:opacity-40 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

export function DiscoveryFilterSheet({
  open,
  onOpenChange,
  filters,
  setters,
  hasActiveFilters,
  clearFilters,
  distanceEnabled = false,
}) {
  const labels = DISCOVERY_CONFIG.UI.FILTERS;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <div className="mx-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden">
          <DrawerHeader className="flex flex-row items-start justify-between gap-3 pb-2 text-left">
            <div>
              <DrawerTitle className="flex items-center gap-2 text-lg">
                <SlidersHorizontal className="size-4 text-primary" />
                Filtros
              </DrawerTitle>
              <DrawerDescription>
                Ajusta el día, la distancia y el orden de los partidos.
              </DrawerDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar filtros"
            >
              <X />
            </Button>
          </DrawerHeader>

          <div className="space-y-5 overflow-y-auto px-4 pb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.searchTerm}
                onChange={(event) => setters.setSearchTerm(event.target.value)}
                placeholder="Busca un partido, deporte o cancha"
                aria-label={labels.SEARCH}
                className="h-11 rounded-full pl-9"
              />
            </div>

            <Section title={labels.DATE}>
              {DISCOVERY_CONFIG.DATE_FILTERS.map((option) => (
                <Chip
                  key={option.value}
                  active={filters.dateFilter === option.value}
                  onClick={() => setters.setDateFilter(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </Section>

            <Section title={labels.RADIUS}>
              {DISCOVERY_CONFIG.RADIUS.OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  active={String(filters.radius) === String(option.value)}
                  onClick={() => setters.setRadius(option.value)}
                  disabled={!distanceEnabled}
                >
                  {option.label}
                </Chip>
              ))}
            </Section>
            {!distanceEnabled && (
              <p className="text-[11px] text-muted-foreground">
                Elige una ubicación para filtrar por distancia.
              </p>
            )}

            <Section title={labels.SORT}>
              {DISCOVERY_CONFIG.SORT.OPTIONS.filter(
                (option) => option.value !== "distance" || distanceEnabled
              ).map((option) => (
                <Chip
                  key={option.value}
                  active={filters.sort === option.value}
                  onClick={() => setters.setSort(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </Section>
          </div>

          <DrawerFooter className="border-t border-border/70 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 flex-1 rounded-full"
                  onClick={clearFilters}
                >
                  {labels.CLEAR}
                </Button>
              )}
              <Button
                type="button"
                className="h-11 flex-[1.5] rounded-full font-semibold"
                onClick={() => onOpenChange(false)}
              >
                Ver resultados
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
