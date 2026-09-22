import { LoginForm } from '@/features/auth/components/LoginForm';
import { SITE_CONFIG } from "@/features/shared";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[oklch(0.26_0.06_165)] via-primary to-[oklch(0.40_0.11_160)] p-4">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-black/20 blur-3xl" />

      <div className="w-full max-w-md rounded-3xl border bg-card/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src={SITE_CONFIG.logo} alt={SITE_CONFIG.name} className="size-16 object-contain" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">{SITE_CONFIG.name}</h1>
            <p className="text-sm text-muted-foreground">{SITE_CONFIG.tagline}</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
