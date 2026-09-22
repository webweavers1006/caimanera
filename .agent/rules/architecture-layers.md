---
trigger: always_on
---

# 🧱 Architecture Layers (Action → Service → Repository → Mapper)

## Strict Separation of Responsibilities

### `actions/`
- Next.js orchestration.
- Handles **Zod** validation, cache revalidation (`revalidatePath`), and session management.
- Calls **exclusively** `services`.

### `services/`
- Domain and Business Logic.
- Orchestrates calls to one or more `repositories`.
- **Prohibited**: using API client or knowing URLs here.

### `repositories/`
- Data Access.
- The **only** place where Prisma queries are made (read, write, update, delete).
- Calls **exclusively** `mappers`.
- Thanks to Prisma `@map` / `@@map`, **all field names here are in English**. No Spanish column names should appear in repository code.

### `mappers/`
- **Mandatory** Data Transformation Layer.
- With Prisma `@map` / `@@map` applied in the schema, the mapper's role is **shape normalization** and **relation flattening** — NOT field name translation (Prisma handles that).
- **Mandatory methods**: `toDomain(entity)`, `toDomainList(entities)`, `toPersistence(domain)`, `toSortKey(domainKey)`.

### `[feature].validation.service.js`
- **Mandatory** for Business Rule Validations.
- Contains only functions that check domain rules (e.g., uniqueness of a field).
- Does **not** perform structural validation (that is Zod's job in the `actions/`).
- Used exclusively by `write` services before performing mutations.

## Read/Write Segregation (CQRS)
- To maintain the **250-line limit**, separate files by intent:
  - `[feature].read.[layer].js` (e.g., `user.read.repository.js`)
  - `[feature].write.[layer].js` (e.g., `user.write.repository.js`)

## Naming Convention (English Only)

### Mandatory
- File names, folder names, variables, functions, and constants in **ENGLISH**.

### Logic Files
- Pattern: `[entity].[layer].js` (e.g., `user.mapper.js`, `role.read.service.js`).

### Config Files
- **Mandatory**: `[feature].constants.js` to centralize ALL UI labels, error messages, and feature-specific configuration.

### UI Components
- **PascalCase** (e.g., `UserTable.jsx`, `RoleForm.jsx`).

### Hooks
- **hyphen-case** (e.g., `use-user-form.js`, `use-role-table-filters.js`).

### List Suffix
- Mandatory `List` suffix (e.g., `fetchUserList`, `getRoleListAction`).

## Feature Structure

### Domain Features
- Contain A-S-R logic, mappers, and **config**.
- May export **Providers** to share state and avoid *prop drilling* (e.g., `PermissionsProvider` in `features/permissions/components/`).

### Global Config
- Routes and shared configuration in `src/features/shared/config/`.
