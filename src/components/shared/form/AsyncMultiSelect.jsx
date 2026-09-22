"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/features/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "@/components/ui/form"
import { useAsyncMultiSelect } from "@/features/shared/hooks/use-async-multi-select"
import { SHARED_CONFIG } from "@/features/shared/config/shared.constants";

const { SELECT } = SHARED_CONFIG.UI.LABELS;

export function AsyncMultiSelect({ 
  value = [], 
  onChange, 
  fetcher, 
  renderOption,
  getLabel = (opt) => opt.label || opt.nombre, 
  getValue = (opt) => opt.value || opt.id,     
  placeholder = SELECT.PLACEHOLDER,
  emptyMessage = SELECT.EMPTY,
  initialData = [], 
  useFormControl = true,
  triggerClassName,
  minSearchLength = 0,
  fetchOnOpen = false,
  initialQuery = "",
  allowEmptyQuery = false,
  cacheKey,
}) {
  const {
    open,
    setOpen,
    options,
    selectedOptions,
    selectedValues,
    loading,
    query,
    setQuery,
    handleSearch,
    toggleOption,
    selectAll,
  } = useAsyncMultiSelect({
    value,
    onChange,
    fetcher,
    getLabel,
    getValue,
    initialData,
    minSearchLength,
    fetchOnOpen,
    initialQuery,
    allowEmptyQuery,
    cacheKey,
  })

  const listboxId = React.useId()

  const TriggerButton = (
    <Button
      variant="outline"
      role="combobox"
      type="button"
      className={cn(
        "w-full min-w-0 justify-between overflow-hidden",
        !value && "text-muted-foreground",
        triggerClassName
      )}
    >
      <div className="flex flex-wrap gap-1 items-center flex-1 max-w-[calc(100%-20px)] overflow-hidden">
        {selectedValues.length === 0 ? (
          <span className="truncate">{placeholder}</span>
        ) : selectedValues.length > 2 ? (
          <Badge variant="secondary" className="rounded-sm px-1.5 font-normal h-5 border-none bg-muted hover:bg-muted">
            {SELECT.SELECTED_COUNT(selectedValues.length)}
          </Badge>
        ) : (
          selectedOptions.map((opt) => (
            <Badge key={getValue(opt)} variant="secondary" className="rounded-sm px-1.5 font-normal truncate max-w-[120px] h-5 border-none bg-muted hover:bg-muted">
              {getLabel(opt)}
            </Badge>
          ))
        )}
      </div>
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
            value={query}
            placeholder={SELECT.SEARCH_PLACEHOLDER} 
            className="border-none focus:ring-0"
            onValueChange={(val) => {
                setQuery(val)
                handleSearch(val)
            }}
          />
          <CommandList id={listboxId}>
            {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> {SELECT.LOADING}
                </div>
            )}
            {!loading && options.length === 0 && (
                <CommandEmpty>
                  {(!allowEmptyQuery && (query || "").trim().length < minSearchLength)
                    ? SELECT.MIN_SEARCH_CHARS(minSearchLength)
                    : emptyMessage}
                </CommandEmpty>
            )}
            <CommandGroup>
              {!loading && options.length > 0 && (
                <>
                  <CommandItem
                    value="selectAll"
                    onSelect={selectAll}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    className="cursor-pointer font-medium mb-1 pointer-events-auto data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                  >
                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/50", selectedValues.length === options.length ? "bg-primary border-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                      <Check className="h-3 w-3" />
                    </div>
                    {SELECT.SELECT_ALL}
                  </CommandItem>
                  <CommandSeparator className="my-1 border-muted" />
                </>
              )}
              {options.map((option) => {
                const optValue = getValue(option)
                const isSelected = selectedValues.some(v => String(v) === String(optValue))
                return (
                    <CommandItem
                      key={String(optValue)}
                      value={String(optValue)}
                      onSelect={() => toggleOption(option)}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      className="cursor-pointer pointer-events-auto data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                    >
                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/50 transition-colors", isSelected ? "bg-primary border-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                      <Check className="h-3 w-3" />
                    </div>
                    {renderOption ? renderOption(option) : getLabel(option)}
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
