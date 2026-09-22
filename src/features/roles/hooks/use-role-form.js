import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { roleSchema } from "../schemas/role.schema";
import { saveRoleAction } from "../actions/role.write.action";
import { getRoleFormConfig, getRoleDefaultValues } from "../config/role.form.config";

export function useRoleForm({ role, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: getRoleDefaultValues(role),
  });

  const formConfig = useMemo(() => 
    getRoleFormConfig(), 
    []
  );

  useEffect(() => {
    form.reset(getRoleDefaultValues(role));
  }, [role, form]);

  const onSubmit = (data) => {
    startTransition(async () => {
      const payload = role ? { ...data, id: role.id } : data;
      
      const result = await saveRoleAction(payload);

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
      } else {
        if (result.details) {
          Object.entries(result.details).forEach(([field, messages]) => {
            form.setError(field, { type: "server", message: messages[0] });
          });
        } else {
          toast.error(result.error || "Error al guardar el rol");
        }
      }
    });
  };

  return {
    form,
    formConfig,
    isPending,
    onSubmit: form.handleSubmit(onSubmit)
  };
}
