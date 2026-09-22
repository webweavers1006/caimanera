"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/features/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SHARED_CONFIG } from "@/features/shared/config/shared.constants";

const { SELECT } = SHARED_CONFIG.UI.LABELS;

const EMPTY_ARRAY = [];

export function CustomMultiSelect({
  control,
  name,
  label,
  placeholder = SELECT.PLACEHOLDER,
  options = EMPTY_ARRAY,
  description,
  disabled = false,
  className,
  triggerClassName,
  value = EMPTY_ARRAY,
  onChange,
  useFormControl = true,
}) {
  const [open, setOpen] = React.useState(false);
  const selectedValues = Array.isArray(value) ? value : EMPTY_ARRAY;

  const renderSelect = (currentValues, currentOnChange) => {
    const doToggle = (optionValue) => {
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      if (currentOnChange) currentOnChange(newValues);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto min-h-9 py-1.5 px-3 bg-background/60 border-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-background/80",
              !currentValues.length && "text-muted-foreground",
              triggerClassName
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 items-center flex-1 max-w-[calc(100%-20px)] overflow-hidden">
              {currentValues.length === 0 ? (
                <span className="truncate">{placeholder}</span>
              ) : currentValues.length > 2 ? (
                <Badge variant="secondary" className="rounded-sm px-1.5 font-normal h-5 border-none bg-muted hover:bg-muted">
                  {SELECT.SELECTED_COUNT(currentValues.length)}
                </Badge>
              ) : (
                options
                  .filter((opt) => currentValues.includes(opt.value))
                  .map((opt) => (
                    <Badge key={opt.value} variant="secondary" className="rounded-sm px-1.5 font-normal truncate max-w-[120px] h-5 border-none bg-muted hover:bg-muted">
                      {opt.label}
                    </Badge>
                  ))
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 shadow-lg" align="start">
          <Command>
            <CommandInput placeholder={SELECT.SEARCH_PLACEHOLDER} className="border-none focus:ring-0" />
            <CommandList>
              <CommandEmpty>{SELECT.NO_RESULTS}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="selectAll"
                  onSelect={() => {
                    const isAllSelected = currentValues.length === options.length;
                    if (currentOnChange) currentOnChange(isAllSelected ? [] : options.map(o => o.value));
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="cursor-pointer font-medium mb-1 pointer-events-auto data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                >
                  <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/50", currentValues.length === options.length ? "bg-primary border-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                    <Check className="h-3 w-3" />
                  </div>
                  {SELECT.SELECT_ALL}
                </CommandItem>
                <CommandSeparator className="my-1 border-muted" />
                {options.map((option) => {
                  const isSelected = currentValues.includes(option.value);
                  return (
                    <CommandItem
                      key={String(option.value)}
                      value={String(option.value)}
                      onSelect={() => doToggle(option.value)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="cursor-pointer pointer-events-auto data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                    >
                      <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/50 transition-colors", isSelected ? "bg-primary border-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  if (!useFormControl || !control || !name) {
    return (
      <div className={className}>
        {label && <label className="text-sm font-medium mb-1.5 inline-block">{label}</label>}
        {renderSelect(selectedValues, onChange)}
        {description && <p className="text-xs text-muted-foreground mt-1.5">{description}</p>}
      </div>
    );
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          {renderSelect(field.value || EMPTY_ARRAY, field.onChange)}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
