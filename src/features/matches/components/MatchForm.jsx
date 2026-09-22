"use client";

import { useMatchForm } from "../hooks/use-match-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { CustomFormSelect } from "@/components/shared/form/CustomFormSelect";
import { CustomFormSwitch } from "@/components/shared/form/CustomFormSwitch";
import { AsyncSelect } from "@/components/shared/form/AsyncSelect";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MATCH_CONFIG } from "../config/match.constants";

export function MatchForm({ defaultValues: item, onSuccess }) {
  const { form, formConfig, isPending, onSubmit } = useMatchForm({ defaultValues: item, onSuccess });
  const { LABELS } = MATCH_CONFIG.UI;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {formConfig.map((row, rowIndex) => (
            <div key={rowIndex} className="grid gap-4 md:grid-cols-2">
              {row.map((field) => {
                const colSpan = row.length === 1 ? "md:col-span-2" : "";

                if (field.component === "input") {
                  return (
                    <div key={field.name} className={colSpan}>
                      <CustomFormField
                        control={form.control}
                        {...field}
                      />
                    </div>
                  );
                }

                if (field.component === "select") {
                  return (
                    <div key={field.name} className={colSpan}>
                      <CustomFormSelect
                        control={form.control}
                        {...field}
                      />
                    </div>
                  );
                }

                if (field.component === "switch") {
                  return (
                    <div key={field.name} className={colSpan}>
                      <CustomFormSwitch
                        control={form.control}
                        name={field.name}
                        label={field.label}
                        description={field.description}
                      />
                    </div>
                  );
                }

                if (field.component === "asyncSelect") {
                  const initialData =
                    field.name === "hostId" && item?.hostId
                      ? { label: item.hostName, value: item.hostId }
                      : field.name === "courtId" && item?.courtId
                        ? { label: item.courtName, value: item.courtId }
                        : null;

                  return (
                    <div key={field.name} className={colSpan}>
                      <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: controllerField }) => (
                          <FormItem>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                              <AsyncSelect
                                value={controllerField.value}
                                onChange={(val) => form.setValue(field.name, val, { shouldDirty: true })}
                                fetcher={field.fetcher}
                                getLabel={field.getLabel}
                                getValue={field.getValue}
                                placeholder={field.placeholder}
                                emptyMessage={field.emptyMessage}
                                initialData={initialData}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? LABELS.FORM.SAVING : (item ? LABELS.FORM.UPDATE : LABELS.FORM.SUBMIT)}
          </Button>
        </div>
      </form>
    </Form>
  );
}
