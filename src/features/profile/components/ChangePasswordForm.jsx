"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { CustomFormField } from "@/components/shared/form/CustomFormField";
import { useChangePassword } from "../hooks/use-change-password";
import { AUTH_CONFIG } from "@/features/auth";

const { LABELS } = AUTH_CONFIG.PASSWORD_CHANGE.UI;

/**
 * Change Password Form (Presentation Only).
 * Requires the current password before allowing the update.
 */
export function ChangePasswordForm() {
  const { form, isPending, onSubmit } = useChangePassword();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <CustomFormField
          control={form.control}
          name="currentPassword"
          label={LABELS.CURRENT_PASSWORD}
          placeholder={LABELS.CURRENT_PLACEHOLDER}
          type="password"
          description={LABELS.CURRENT_DESCRIPTION}
          required
          autoComplete="current-password"
        />
        <CustomFormField
          control={form.control}
          name="newPassword"
          label={LABELS.NEW_PASSWORD}
          placeholder={LABELS.NEW_PLACEHOLDER}
          type="password"
          required
          autoComplete="new-password"
        />
        <CustomFormField
          control={form.control}
          name="confirmPassword"
          label={LABELS.CONFIRM_PASSWORD}
          placeholder={LABELS.CONFIRM_PLACEHOLDER}
          type="password"
          required
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? LABELS.SAVING : LABELS.SUBMIT}
        </Button>
      </form>
    </Form>
  );
}
