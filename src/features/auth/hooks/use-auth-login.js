import { logger } from "@/features/shared";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema } from '../schemas/login.schema';
import { loginAction } from '../actions/auth.login.action';
import { toFormData } from '@/features/shared/lib/shared-utils';
import { AUTH_CONFIG } from '../config/auth.constants';

export function useAuthLogin() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  async function onSubmit(values) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const formData = toFormData(values);
      const result = await loginAction(null, formData);

      if (result?.error) {
        if (result.details) {
          // Validation errors from server
          Object.entries(result.details).forEach(([field, messages]) => {
            form.setError(field, { type: 'server', message: messages[0] });
          });
        } else {
          // General error
          setServerError(result.error);
          toast.error(result.error);
        }
      } else if (result?.success) {
        toast.success(AUTH_CONFIG.UI.LABELS.WELCOME_MESSAGE);
        router.push('/');
      }
    } catch (error) {
      logger.error(error);
      setServerError('Error inesperado al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    isSubmitting,
    serverError,
    onSubmit: form.handleSubmit(onSubmit)
  };
}
