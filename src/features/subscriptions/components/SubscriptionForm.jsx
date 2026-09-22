"use client";

import { useSubscriptionForm } from "../hooks/use-subscription-form";
import { Form } from "@/components/ui/form";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { CustomFormTextarea } from "@/components/shared/form/CustomFormTextarea";
import { CustomFormSelect } from "@/components/shared/form/CustomFormSelect";
import { CustomFormSwitch } from "@/components/shared/form/CustomFormSwitch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SUBSCRIPTION_CONFIG } from "../config/subscription.constants";

export function SubscriptionForm({ defaultValues: item, onSuccess }) {
  const { form, formConfig, isPending, onSubmit } = useSubscriptionForm({ defaultValues: item, onSuccess });
  const { LABELS } = SUBSCRIPTION_CONFIG.UI;

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

                if (field.component === "textarea") {
                  return (
                    <div key={field.name} className={colSpan}>
                      <CustomFormTextarea
                        control={form.control}
                        {...field}
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
