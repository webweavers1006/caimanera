---
trigger: always_on
---

# 🖼️ UI Conventions

## Components & Hooks

### Hook Naming
- Hooks must use **hyphen-case** (e.g., `use-user-form.js`, `use-role-table-filters.js`).

### State Logic
- Components must delegate their logic to custom management hooks.

### Form Logic
- **Mandatory**: extract `useForm` logic, schemas, and option transformation into specific hooks.

## Config-Driven UI (Mandatory)

### Centralized Constants
- **Prohibited**: Hardcoded strings (text in Spanish) directly in components.
- **Mandatory**: All UI labels, placeholders, tooltips, and alert messages must reside in `src/features/[feature]/config/[feature].constants.js`.
- **Standard Structure**:
  - `ERRORS`: Consistent error messages.
  - `UI.LABELS.FORM`: Fields, placeholders, descriptions, and action buttons (Create/Update/Saving).
  - `UI.LABELS.TABLE`: Column headers, empty state messages, and entity names.
  - `UI.LABELS.TOOLBAR`: Search placeholders, filter labels, and action buttons.
  - `UI.LABELS.DELETE_DIALOG`: Titles and descriptions for confirmation alerts.

### Forms
- Stack: `react-hook-form` + `zod` + `[feature].form.config.js`.
- Always consume labels from the centralized constants file.

### Tables
- Column definitions in `[feature].columns.jsx`.
- Use `createActionsColumn` + generic `DataTable`.
- Consume column headers from `TABLE` labels in constants.

### Toolbar
- **Mandatory**: Use the compound `<Toolbar>` component from `@/components/shared/Toolbar`.
- **Prohibited**: Using raw HTML (`div`, `Input`, etc.) directly to build the toolbar.

### Form Dialogs
- Dialog that wraps the form lives directly in `[Feature]TableDialogs.jsx`.
- No separate `FormDialog.jsx` file.
