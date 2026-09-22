"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { changePasswordSchema } from "@/features/auth/schemas/change-password.schema";
import { changePasswordAction } from "@/features/auth/actions/auth.change-password.action";
import { logger } from "@/features/shared";

const DEFAULT_VALUES = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/**
 * Hook for the self-service password change form.
 * Validates with Zod, submits via the changePasswordAction, maps server errors.
 */
export function useChangePassword() {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: DEFAULT_VALUES,
  });

  function onSubmit(values) {
    startTransition(async () => {
      try {
        const result = await changePasswordAction(values);

        if (result.success) {
          toast.success(result.message || "Contraseña actualizada correctamente.");
          form.reset(DEFAULT_VALUES);
        } else if (result.details) {
          Object.entries(result.details).forEach(([field, messages]) => {
            form.setError(field, { type: "server", message: messages[0] });
          });
        } else {
          toast.error(result.error || "No se pudo cambiar la contraseña.");
        }
      } catch (error) {
        logger.error("Unexpected error changing password", { error: error.message });
        toast.error("Error inesperado al procesar la solicitud.");
      }
    });
  }

  return {
    form,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
