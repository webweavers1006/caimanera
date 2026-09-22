"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";
import { toast } from "sonner";
import { subscriptionSchema } from "../schemas/subscription.schema";
import { saveSubscriptionAction } from "../actions/subscription.write.action";
import { getSubscriptionFormConfig, getSubscriptionDefaultValues } from "../config/subscription.form.config";

export function useSubscriptionForm({ defaultValues: item, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: getSubscriptionDefaultValues(item),
  });

  const formConfig = getSubscriptionFormConfig();

  useEffect(() => {
    form.reset(getSubscriptionDefaultValues(item));
  }, [item, form]);

  const onSubmit = (data) => {
    startTransition(async () => {
      const result = await saveSubscriptionAction(data);

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
      } else {
        if (result.details) {
          Object.entries(result.details).forEach(([field, messages]) => {
            form.setError(field, { type: "server", message: messages[0] });
          });
        } else {
          toast.error(result.error || "Error al guardar");
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
