"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"
import { cn } from "@/features/shared"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "@/components/ui/form"
import { useAsyncSelect } from "@/features/shared/hooks/use-async-select"
import { SHARED_CONFIG } from "@/features/shared/config/shared.constants";

const { SELECT } = SHARED_CONFIG.UI.LABELS;

export function AsyncSelect({
  value,
  onChange,
  fetcher,
  renderOption,
  getLabel = (opt) => opt.label || opt.nombre,
  getValue = (opt) => opt.value || opt.id,
  placeholder = SELECT.PLACEHOLDER,
  emptyMessage = SELECT.EMPTY,
  initialData = null,
  useFormControl = true,
  triggerClassName,
  fetchOnOpen = true,
  onOptionsLoad,
  parentValue,
  cacheKey,
}) {
  const {
    open,
    options,
    loading,
    searchTerm,
    setSearchTerm,
    displayLabel,
    handleOpenChange,
  } = useAsyncSelect({
    value,
    onChange,
    fetcher,
    getLabel,
    getValue,
    initialData,
    fetchOnOpen,
    onOptionsLoad,
    parentValue,
    cacheKey,
  })

  const getValueFn = getValue || ((opt) => opt.value || opt.id)
  const getLabelFn = getLabel || ((opt) => opt.label || opt.nombre)

  const listboxId = React.useId()

  const TriggerButton = (
    <Button
      variant="outline"
      role="combobox"
      type="button"
      className={cn(
        "w-full min-w-0 relative",
        !value && "text-muted-foreground",
        triggerClassName
      )}
    >
      <span className="truncate text-center flex-1 px-6">
        {displayLabel ?? placeholder}
      </span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value && (
          <span
            role="button"
            tabIndex={0}
            className="rounded-full p-0.5 hover:bg-muted-foreground/20 cursor-pointer inline-flex items-center justify-center"
            aria-label={SELECT.CLEAR_SELECTION}
            onClick={(e) => {
              e.stopPropagation()
              onChange?.("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation()
                onChange?.("")
              }
            }}
          >
            <X className="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
          </span>
        )}
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </span>
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {useFormControl ? <FormControl>{TriggerButton}</FormControl> : TriggerButton}
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 shadow-lg z-50"
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={searchTerm}
            placeholder={SELECT.SEARCH_PLACEHOLDER}
            className="border-none focus:ring-0"
            onValueChange={setSearchTerm}
          />
          <CommandList id={listboxId}>
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> {SELECT.LOADING}
              </div>
            )}
            {!loading && options.length === 0 && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => {
                const optValue = getValueFn(option)
                const isSelected = String(value) === String(optValue)
                return (
                  <CommandItem
                    key={String(optValue)}
                    value={String(optValue)}
                    onSelect={() => {
                      onChange?.(isSelected ? "" : optValue)
                      handleOpenChange(false)
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    className="cursor-pointer pointer-events-auto data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                  >
                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/50 transition-colors", isSelected ? "bg-primary border-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                      <Check className="h-3 w-3" />
                    </div>
                    {renderOption ? renderOption(option) : getLabelFn(option)}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
