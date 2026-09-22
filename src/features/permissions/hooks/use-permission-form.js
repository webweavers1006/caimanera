import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";
import { toast } from "sonner";
import { permissionSchema } from "../schemas/permission.schema";
import { savePermissionAction } from "../actions/permission.write.action";
import { getPermissionFormConfig, getPermissionDefaultValues } from "../config/permission.form.config";

export function usePermissionForm({ permission, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(permissionSchema),
    defaultValues: getPermissionDefaultValues(permission),
  });

  const formConfig = getPermissionFormConfig();

  useEffect(() => {
    form.reset(getPermissionDefaultValues(permission));
  }, [permission, form]);

  const onSubmit = (data) => {
    startTransition(async () => {
      const payload = permission ? { ...data, id: permission.id } : data;

      const result = await savePermissionAction(payload);

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
      } else {
        if (result.details) {
          Object.entries(result.details).forEach(([field, messages]) => {
            form.setError(field, { type: "server", message: messages[0] });
          });
        } else {
          toast.error(result.error || "Error al guardar el permiso");
        }
      }
    });
  };

  return {
    form,
    formConfig,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
