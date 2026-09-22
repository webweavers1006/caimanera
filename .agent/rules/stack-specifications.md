---
trigger: always_on
---

# 🛠️ Stack Specifications (v2026)

## Next.js 16.2 & React 19

### Server Components (RSC)
- Use **Server Components by default**.
- Implement `"use cache"` in `services/` to optimize data fetching.

### Refs
- In React 19, `refs` are normal props. **Prohibited**: using `forwardRef`.

### Hydration
- **Prohibited**: rendering dynamic dates directly on the client.
- Use suppression strategies or server-side formatting to avoid *Hydration Mismatch*.

## Tailwind CSS v4

### Configuration
- **Prohibited**: using `tailwind.config.js`.
- All theme customization goes in global CSS via `@theme`.

## Prisma

### Usage
- Exclusive use in `repositories/` layer. Prohibited in components, actions, services, or app.
- Use the Driver Adapter `@prisma/adapter-pg` for stability.

### Schema Conventions
- All models and fields defined in **English** using `@map` / `@@map` to alias Spanish DB column/table names.
- Every model must have `createdAt` and `updatedAt` timestamp fields with `@map("creado_en")` / `@map("actualizado_en")`.
- After any schema change, always run `npx prisma generate` to regenerate the client.
- Use `npx prisma migrate dev --name <description>` for schema migrations in development.

### npm audit
- Do NOT run `npm audit fix --force`. It will downgrade Next.js and Prisma to incompatible versions.

## UI

### Icons & Notifications
- Use `lucide-react` for icons.
- Use `sonner` for toast notifications.

### Port
- **3001**.
