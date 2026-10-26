'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { cn } from '@/features/shared/lib/shared-utils'
import { useAuthLogin } from '../hooks/use-auth-login'
import { AUTH_CONFIG } from '../config/auth.constants'

const FIELD_ICONS = {
  email: Mail,
  password: Lock,
};

/**
 * Mobile-first login fields.
 * Large touch targets, floating icons and a password visibility toggle.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.className] - Clases adicionales de estilo.
 */
export function LoginFields({ className }) {
  const { form, isSubmitting, serverError, onSubmit } = useAuthLogin();
  const { FORM } = AUTH_CONFIG.UI.LABELS;
  const [showPassword, setShowPassword] = useState(false);

  const fields = [
    {
      name: 'email',
      label: FORM.EMAIL,
      placeholder: FORM.EMAIL_PLACEHOLDER,
      type: 'email',
      autoComplete: 'email',
      inputMode: 'email',
      autoCapitalize: 'none',
      autoCorrect: 'off',
      spellCheck: false,
      enterKeyHint: 'next',
    },
    {
      name: 'password',
      label: FORM.PASSWORD,
      placeholder: FORM.PASSWORD_PLACEHOLDER,
      type: showPassword ? 'text' : 'password',
      autoComplete: 'current-password',
      enterKeyHint: 'go',
    },
  ];

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {fields.map((field) => {
            const Icon = FIELD_ICONS[field.name];
            const isPassword = field.name === 'password';

            return (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem className="gap-1.5">
                    <FormLabel className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {field.label}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        {Icon && (
                          <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        )}
                        <Input
                          type={field.type}
                          placeholder={field.placeholder}
                          autoComplete={field.autoComplete}
                          inputMode={field.inputMode}
                          autoCapitalize={field.autoCapitalize}
                          autoCorrect={field.autoCorrect}
                          spellCheck={field.spellCheck}
                          enterKeyHint={field.enterKeyHint}
                          className={cn(
                            "h-12 rounded-2xl bg-input/60 pl-11 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-ring/40 md:text-base",
                            isPassword && "pr-12"
                          )}
                          {...formField}
                          value={formField.value ?? ""}
                        />
                        {isPassword && (
                          <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={
                              showPassword ? FORM.HIDE_PASSWORD : FORM.SHOW_PASSWORD
                            }
                            aria-pressed={showPassword}
                            className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm font-medium text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-1 h-12 w-full rounded-2xl text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? FORM.SUBMITTING : FORM.SUBMIT}
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight data-icon="inline-end" className="size-4" />
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
