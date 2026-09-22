"use client";

import { Input } from "@/components/ui/input";
import { AsyncMultiSelect } from "@/components/shared/form/AsyncMultiSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_CONFIG } from "../config/user.constants";

// Server actions
import { getRolesForSelectAction } from "@/features/roles/actions/role.select.action";

const F = USER_CONFIG.UI.LABELS.TOOLBAR.FILTERS;
const D = USER_CONFIG.UI.LABELS.TOOLBAR;

// ── Reusable primitives ────────────────────────────────────────────────────

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-4 py-1 w-full">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 whitespace-nowrap">
        {label}
      </span>
      <div className="h-[1px] w-full bg-border/40" />
    </div>
  );
}

function FilterRow({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">{children}</div>;
}

function FilterItem({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
      {children}
    </div>
  );
}

function MultiSelectFilter({ label, value, onChange, fetcher, cacheKey, placeholder }) {
  return (
    <FilterItem label={label}>
      <AsyncMultiSelect
        value={value || []}
        onChange={onChange}
        fetcher={fetcher}
        cacheKey={cacheKey}
        placeholder={placeholder}
        useFormControl={false}
        fetchOnOpen
        allowEmptyQuery
      />
    </FilterItem>
  );
}

function DateFilter({ label, value, onChange, placeholder }) {
  return (
    <FilterItem label={label}>
      <Input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className="h-9" />
    </FilterItem>
  );
}

function SelectFilter({ label, value, onChange, placeholder, options }) {
  return (
    <FilterItem label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full bg-background/60">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterItem>
  );
}

/**
 * User table filters — catalogs, status, and date range.
 * Follows the same pattern as CaseFilters.
 */
export function UserFilters({ filters, handlers }) {
  return (
    <div className="space-y-4">
      {/* ── Status ─────────────────────────────────────────────── */}
      <FilterRow>
        <SelectFilter
          label={F.STATUS}
          value={filters.status}
          onChange={(v) => handlers.handleStatusChange(v)}
          placeholder={F.STATUS_PLACEHOLDER}
          options={[
            { label: "Todos los estados", value: "all" },
            { label: "Activos", value: "active" },
            { label: "Inactivos", value: "inactive" },
          ]}
        />
      </FilterRow>

      {/* ── Catalog filters ────────────────────────────────────── */}
      <SectionDivider label={D.DIVIDER_CATALOGS} />
      <FilterRow>
        <MultiSelectFilter
          label={F.ROLE}
          value={filters.roleId}
          onChange={(v) => handlers.handleFilterChange("roleId", v)}
          fetcher={getRolesForSelectAction}
          cacheKey="filter:role"
          placeholder={F.ROLE_PLACEHOLDER}
        />
      </FilterRow>

      {/* ── Date range ─────────────────────────────────────────── */}
      <SectionDivider label={D.DIVIDER_DATES} />
      <FilterRow>
        <DateFilter
          label={F.DATE_FROM}
          value={filters.dateFrom}
          onChange={handlers.handleDateFromChange}
          placeholder={F.DATE_FROM_PLACEHOLDER}
        />
        <DateFilter
          label={F.DATE_TO}
          value={filters.dateTo}
          onChange={handlers.handleDateToChange}
          placeholder={F.DATE_TO_PLACEHOLDER}
        />
      </FilterRow>
    </div>
  );
}
