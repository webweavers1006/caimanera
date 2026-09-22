import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { userSchema } from "../schemas/user.schema";
import { saveUser } from "../actions/user.write.action";
import { getUserFormConfig, getUserDefaultValues } from "../config/user.form.config";
import { useRoleProvider } from "@/features/roles/components/RoleProvider";
import { logger } from "@/features/shared";

export function useUserForm({ user, onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const { roles } = useRoleProvider();

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: getUserDefaultValues(user),
  });

  const formConfig = useMemo(() => 
    getUserFormConfig(roles, user), 
    [roles, user]
  );

  useEffect(() => {
    form.reset(getUserDefaultValues(user));
  }, [user, form]);

  function onSubmit(values) {
    startTransition(async () => {
      try {
        const result = await saveUser(values);

        if (result.success) {
          toast.success(result.message);
          onSuccess?.();
        } else {
          if (result.details) {
            Object.entries(result.details).forEach(([field, messages]) => {
              if (field in values) {
                 form.setError(field, { type: "server", message: messages[0] });
              } else {
                 toast.error(messages[0]);
              }
            });
          } else {
             toast.error(result.error || "Error al guardar el usuario.");
          }
        }
      } catch (error) {
        logger.error("Unexpected error in user form submission", { error: error.message });
        toast.error("Error inesperado al procesar la solicitud.");
      }
    });
  }

  return {
    form,
    formConfig,
    isPending,
    onSubmit: form.handleSubmit(onSubmit)
  };
}
