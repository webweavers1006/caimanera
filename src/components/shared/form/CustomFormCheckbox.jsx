"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

export function CustomFormCheckbox({
  control,
  name,
  label,
  description,
  disabled = false,
  className = "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-card/50 col-span-full",
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && <FormLabel className="font-semibold text-sm">{label}</FormLabel>}
            {description && <FormDescription className="text-[11px] leading-tight text-muted-foreground">{description}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
}
