---
trigger: always_on
---

# 🧪 Quality & Diagnostics

## Complexity
- Maximum **3 nesting levels** (`if`/`for`/`try`).

## XSS Prevention
- **Prohibited**: `dangerouslySetInnerHTML`.

## Error Handling
- Server Actions use `createProtectedAction` which wraps errors in `{ success: false, error: "..." }`.
- Client components handle errors via `toast` (sonner) or inline error states.
