---
trigger: always_on
---

# 🎯 Code Paradigms

> **Agent Profile:** Senior Full-Stack Developer.
> **Environment:** Linux. Node.js with `TZ=UTC`.
> **Stack:** Next.js 16.2 (App Router), React 19, Tailwind 4, Prisma 7.5, PostgreSQL, JWT (jose).

## Strict File Size Limit
- Maximum **250 lines per file** (if exceeded, refactor immediately).
- *Exception: Library code (e.g., Shadcn UI in `src/components/ui/`) has no line limit to avoid breaking its functionality.*

## Language
- Only **JS/JSX**. (TypeScript is prohibited unless explicitly requested).

## Modular Feature-Based Structure

### `src/app/`
- Only routing files. **Prohibited**: business logic or complex UI here.
- Only verifies permissions and does the initial fetch (RSC).

### `src/features/[feature]/`
- Only place for domain logic. Contains: `components/`, `hooks/`, `actions/`, `services/`, `repositories/`, `mappers/`, `schemas/`, and `config/`.

### `src/components/`
- `ui/` (shadcn atoms) and `shared/` (infrastructure/layout).

## 🌐 Global Elements & Providers (Cross-Cutting)

### Technical/UI Providers
- e.g., `ThemeProvider`, generic contexts.
- **Mandatory** in `src/components/shared/providers/` (pure infrastructure).

### Logic Providers
- e.g., `PermissionsProvider`.
- These are domain components. They belong in their respective feature (e.g., `features/permissions/components/`).

### Global Config
- Routes, hooks, and cross-cutting logic go in `src/features/shared/` (e.g., `features/shared/config/routes.js`).
