"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";
import { toast } from "sonner";
import { participantSchema } from "../schemas/participant.schema";
import { saveParticipantAction } from "../actions/participant.write.action";
import {
  getParticipantFormConfig,
  getParticipantDefaultValues,
} from "../config/participant.form.config";

export function useParticipantForm({ defaultValues: item, onSuccess }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(participantSchema),
    defaultValues: getParticipantDefaultValues(item),
  });

  const formConfig = getParticipantFormConfig();

  useEffect(() => {
    form.reset(getParticipantDefaultValues(item));
  }, [item, form]);

  const onSubmit = (data) => {
    startTransition(async () => {
      const result = await saveParticipantAction(data);

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
