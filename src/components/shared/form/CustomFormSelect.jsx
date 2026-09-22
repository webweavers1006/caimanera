"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_ARRAY = [];

export function CustomFormSelect({
  control,
  name,
  label,
  placeholder,
  options = EMPTY_ARRAY,
  description,
  disabled = false,
  className,
  triggerClassName,
  value,
  onChange,
  useFormControl = true
}) {
  const Trigger = (
    <Select
      onValueChange={useFormControl ? undefined : onChange}
      value={useFormControl ? undefined : value}
      disabled={disabled}
    >
      {useFormControl ? (
        <FormControl>
          <SelectTrigger className={`w-full ${triggerClassName || ""}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
      ) : (
        <SelectTrigger className={`w-full ${triggerClassName || ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      )}
      <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (!useFormControl) {
    return (
      <div className={className}>
        {label && <label className="text-sm font-medium mb-1.5 inline-block">{label}</label>}
        {Trigger}
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
          <Select
            onValueChange={(val) => {
              field.onChange(val);
              if (onChange) onChange(val);
            }}
            value={field.value}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className={`w-full ${triggerClassName || ""}`}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
