/**
 * Configuración centralizada para el módulo de Permisos.
 * Enforces Config-Driven UI — no hardcoded strings in permission components.
 */

export const PERMISSION_CONFIG = {
  // Rutas del módulo
  PATH: '/admin/permissions',
  TITLE: 'Permisos del Sistema',

  // Permisos requeridos para este módulo
  PERMISSIONS: {
    VIEW: 'permissions:view',
    READ: 'permissions:read',
    WRITE: 'permissions:create',
    UPDATE: 'permissions:update',
    DELETE: 'permissions:delete',
  },

  // Configuración de Paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  UI: {
    LABELS: {
      DESCRIPTION: 'Administra los permisos del sistema (slugs y descripciones).',
      CLEAN_BUTTON: 'Limpiar',
        LOAD_DETAIL_ERROR: "No se pudieron cargar los detalles del permiso",
      FORM: {
        FIELDS: {
          SLUG: 'Slug del Permiso',
          DESCRIPTION: 'Descripción',
        },
        PLACEHOLDERS: {
          SLUG: 'Ej: users:create',
          DESCRIPTION: 'Descripción del permiso...',
        },
        DELETE_DIALOG: {
          TITLE: '¿Estás seguro?',
          DESCRIPTION: 'Esta acción eliminará el permiso. Los roles que lo tengan asignado perderán este permiso.',
          CANCEL: 'Cancelar',
          SUBMIT: 'Eliminar',
        },
        DIALOG: {
          TITLE_CREATE: 'Nuevo Permiso',
          TITLE_EDIT: 'Editar Permiso',
          DESCRIPTION_CREATE: 'Completa el formulario para registrar un nuevo permiso en el sistema.',
          DESCRIPTION_EDIT: 'Modifica la información del permiso existente.',
        },
        SUBMIT: 'Crear Permiso',
        UPDATE: 'Actualizar Permiso',
        SAVING: 'Guardando...',
      },
      TABLE: {
        SLUG: 'Slug',
        DESCRIPTION: 'Descripción',
        ROLES: 'Roles Asignados',
        ACTIONS: 'Acciones',
        EMPTY: 'No hay permisos registrados.',
        EMPTY_SEARCH: 'No se encontraron permisos con los criterios de búsqueda.',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar permisos...',
        NEW_BUTTON: 'Nuevo Permiso',
        SEARCH_LABEL: 'Búsqueda de Permisos',
        DIVIDER_ACTIONS: 'Gestión de Permisos',
      },
      SELECTOR: {
        TITLE: "Permisos del Sistema",
        SEARCH_PLACEHOLDER: "Buscar permisos...",
        EMPTY_TITLE: "No se encontraron permisos",
        EMPTY_SUBTITLE: "Intenta con otros términos de búsqueda",
      },
      HEADER: {
        SELECTED_COUNT: (selected, total) => `${selected} de ${total} seleccionados`,
        SELECT_ALL: "Seleccionar todo",
        DESELECT_ALL: "Deseleccionar todo",
      },
      MESSAGES: {
        SUCCESS: {
          CREATE: 'Permiso creado exitosamente.',
          UPDATE: 'Permiso actualizado exitosamente.',
          DELETE: 'Permiso eliminado exitosamente.',
        },
        ERROR: {
          LOAD: 'No se pudieron cargar los datos de permisos. Verifique la conexión a la base de datos.',
          CREATE: 'Error al crear el permiso.',
          UPDATE: 'Error al actualizar el permiso.',
          DELETE: 'Error al eliminar el permiso.',
        },
      },
    },
  },
};
