"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { CustomFormSelect } from "@/components/shared/form/CustomFormSelect";
import { CustomFormCheckbox } from "@/components/shared/form/CustomFormCheckbox";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";
import { useUserForm } from "../hooks/use-user-form";
import { USER_CONFIG } from "../config/user.constants";

const { LABELS } = USER_CONFIG.UI;

/**
 * User Form Component (Presentation Only).
 * Direction, office and unit are managed from Organigrama — shown as read-only here.
 */
export function UserForm({ user, onSuccess }) {
  const { form, formConfig, isPending, onSubmit } = useUserForm({ user, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4 py-4">
        {user?.id && <input type="hidden" {...form.register("id")} />}

        {formConfig.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid gap-4 ${row.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {row.map((field) => {
              const commonProps = {
                control: form.control,
                name: field.name,
                label: field.label,
                placeholder: field.placeholder,
              };

              if (field.component === "select") {
                return <CustomFormSelect key={field.name} {...commonProps} options={field.options} />;
              }
              if (field.component === "checkbox") {
                return (
                  <CustomFormCheckbox
                    key={field.name}
                    {...commonProps}
                    description={typeof field.description === 'function' ? field.description(form.watch(field.name)) : field.description}
                  />
                );
              }
              if (field.component === "asyncSelect") {
                return (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <AsyncSelect
                          value={controllerField.value}
                          onChange={(val) => controllerField.onChange(val)}
                          fetcher={field.loadOptions}
                          getLabel={field.getOptionLabel}
                          getValue={field.getOptionValue}
                          placeholder={field.placeholder}
                          emptyMessage="No se encontraron resultados."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              }
              return (
                <CustomFormField
                  key={field.name}
                  {...commonProps}
                  type={field.type || "text"}
                  disabled={field.disabled}
                  className={field.className}
                  {...(field.value !== undefined ? { value: field.value } : {})}
                />
              );
            })}
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending 
            ? LABELS.FORM.SAVING 
            : user?.id 
              ? LABELS.FORM.UPDATE 
              : LABELS.FORM.SUBMIT}
        </Button>
      </form>
    </Form>
  );
}
