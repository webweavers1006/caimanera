"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { CustomFormTextarea } from "@/components/shared/form/CustomFormTextarea";
import { usePermissionForm } from "../hooks/use-permission-form";
import { PERMISSION_CONFIG } from "../config/permission.constants";

export function PermissionForm({ permission, onSuccess }) {
  const { form, formConfig, isPending, onSubmit } = usePermissionForm({ permission, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {formConfig.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid gap-4 ${row.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
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
              return null;
            })}
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? PERMISSION_CONFIG.UI.LABELS.FORM.SAVING
              : permission?.id
                ? PERMISSION_CONFIG.UI.LABELS.FORM.UPDATE
                : PERMISSION_CONFIG.UI.LABELS.FORM.SUBMIT}
          </Button>
        </div>
      </form>
    </Form>
  );
}
