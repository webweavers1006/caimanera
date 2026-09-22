"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { CustomFormTextarea } from "@/components/shared/form/CustomFormTextarea";
import { CustomFormCheckboxGroup } from "@/components/shared/form/CustomFormCheckboxGroup";
import { PermissionSelector } from "@/features/permissions/components/PermissionSelector";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useRoleForm } from "../hooks/use-role-form";
import { ROLE_CONFIG } from "../config/role.constants";

export function RoleForm({ role, onSuccess }) {
  const { form, formConfig, isPending, onSubmit } = useRoleForm({ role, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {formConfig.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid gap-4 ${row.length > 1 ? "grid-cols-2" : "grid-cols-1"
              }`}
          >
            {row.map((field) => {
              if (field.component === "input") {
                return (
                  <CustomFormField
                    key={field.name}
                    control={form.control}
                    {...field}
                  />
                );
              }
              if (field.component === "textarea") {
                return (
                  <CustomFormTextarea
                    key={field.name}
                    control={form.control}
                    {...field}
                  />
                );
              }
              if (field.component === "checkbox-group") {
                return (
                  <CustomFormCheckboxGroup
                    key={field.name}
                    control={form.control}
                    {...field}
                  />
                );
              }
              if (field.component === "permission-selector") {
                return (
                  <div key={field.name} className="col-span-full">
                    <FormField
                      control={form.control}
                      name={field.name}
                      render={({ field: formField }) => (
                        <FormItem>
                          <PermissionSelector
                            label={field.label}
                            value={formField.value}
                            onChange={formField.onChange}
                          />
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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? ROLE_CONFIG.UI.LABELS.FORM.SAVING
              : role?.id
                ? ROLE_CONFIG.UI.LABELS.FORM.UPDATE
                : ROLE_CONFIG.UI.LABELS.FORM.SUBMIT}
          </Button>
        </div>
      </form>
    </Form>
  );
}
