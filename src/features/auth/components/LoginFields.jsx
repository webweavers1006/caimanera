'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, Lock } from 'lucide-react'
import { cn } from '@/features/shared/lib/shared-utils'
import { useAuthLogin } from '../hooks/use-auth-login'
import { AUTH_CONFIG } from '../config/auth.constants'

const FIELD_ICONS = {
  email: Mail,
  password: Lock,
};

/**
 * Componente que maneja la vista del formulario de login.
 * Usa useAuthLogin hook para toda la lógica (A-S-R-M compliance).
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.className] - Clases adicionales de estilo.
 */
export function LoginFields({ className }) {
  const { form, isSubmitting, serverError, onSubmit } = useAuthLogin();
  const { FORM } = AUTH_CONFIG.UI.LABELS;

  const fields = [
    { name: 'email', label: FORM.EMAIL, placeholder: FORM.EMAIL_PLACEHOLDER, type: 'email' },
    { name: 'password', label: FORM.PASSWORD, placeholder: FORM.PASSWORD_PLACEHOLDER, type: 'password' },
  ];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Form {...form}>
        <form onSubmit={onSubmit} method="POST" className="flex flex-col gap-5">
          {fields.map((field) => {
            const Icon = FIELD_ICONS[field.name];
            return (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        {Icon && (
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        )}
                        <Input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="pl-10"
                          {...formField}
                          value={formField.value ?? ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}

          {serverError && (
            <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive text-center font-medium">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {FORM.SUBMIT}
          </Button>
        </form>
      </Form>
    </div>
  )
}
