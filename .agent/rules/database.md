---
trigger: always_on
---

# 🧱 Database

## Secure Queries
- **Prohibited**: using concatenated strings in queries.
- Only Prisma's typed API is allowed.
- No raw SQL strings. Use `$queryRaw` with bind parameters when raw queries are necessary.

## Prisma Usage
- Prisma queries only in `repositories/` layer.

## Prisma Schema: English/Spanish Bridge via `@map` / `@@map`
- **Mandatory**: All Prisma models and fields must be defined in **English** in the schema.
- Use `@map("column_name")` to map English Prisma field names to Spanish DB column names.
- Use `@@map("table_name")` to map English Prisma model names to Spanish DB table names.
- This allows repositories, mappers, and services to use **100% English** while the PostgreSQL database retains its original Spanish column/table names.
- **No migration is required** when adding `@map` — it is a Prisma client alias only. Run `npx prisma generate` after changes.

### Example
```prisma
model User {
  firstName String @map("nombre")   // JS: firstName  →  DB: nombre
  idCard    String @map("cedula")   // JS: idCard     →  DB: cedula

  @@map("usuarios")                 // JS: prisma.user → DB table: usuarios
}
```

## Timestamps Convention
- Every model **must** include:
  - `createdAt DateTime? @default(now()) @map("creado_en")`
  - `updatedAt DateTime? @updatedAt @map("actualizado_en")`
- This ensures all entities have audit timestamps and the Prisma Client auto-manages `updatedAt`.

## Seed (`prisma/seed.js`)
- Must use English Prisma model and field names (e.g., `prisma.user`, `{ firstName: "..." }`).
- Must be **idempotent** using `upsert` — safe to run multiple times without duplicating data.
- Run with: `npx prisma db seed`.
