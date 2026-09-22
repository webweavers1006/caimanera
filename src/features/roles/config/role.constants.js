/**
 * Configuración centralizada para el módulo de Roles.
 */

export const ROLE_CONFIG = {
  // Rutas del módulo
  PATH: '/admin/roles',
  TITLE: 'Roles',

  // Permisos requeridos
  PERMISSIONS: {
    VIEW: 'roles:view',
    READ: 'roles:read',
    READ_ALL: 'roles:read_all',
    // Permiso para crear roles (coincide con slugs de DB)
    WRITE: 'roles:create',
    UPDATE: 'roles:update',
    DELETE: 'roles:delete',
  },

  // Configuración de Paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SEARCH_TAKE: 10,
  },

  // Configuración de visualización (Frontend)
  UI: {
    MAX_VISIBLE_PERMISSIONS: 3,
    ITEMS_PER_PAGE: 10,
    LABELS: {
      CLEAN_BUTTON: 'Limpiar',
      FORM: {
        FIELDS: {
          NAME: 'Nombre del Rol',
          DESCRIPTION: 'Descripción',
          PERMISSIONS: 'Permisos del Sistema',
        },
        PLACEHOLDERS: {
          NAME: 'Ej: Administrador',
          DESCRIPTION: 'Descripción del rol...',
        },
        DELETE_DIALOG: {
          TITLE: '¿Estás seguro?',
          DESCRIPTION: 'Esta acción eliminará el rol. No se puede deshacer si tiene usuarios asignados.',
          CANCEL: 'Cancelar',
          SUBMIT: 'Eliminar',
        },
        DIALOG: {
          TITLE_CREATE: 'Nuevo Rol',
          TITLE_EDIT: 'Editar Rol',
          DESCRIPTION_CREATE: 'Completa el formulario para registrar un nuevo rol en el sistema.',
          DESCRIPTION_EDIT: 'Modifica la información del rol existente.',
        },
        SUBMIT: 'Crear Rol',
        UPDATE: 'Actualizar Rol',
        SAVING: 'Guardando...',
      },
      TABLE: {
        NAME: 'Rol',
        DESCRIPTION: 'Descripción',
        USERS: 'Usuarios',
        PERMISSIONS: 'Permisos',
        ACTIONS: 'Acciones',
        EMPTY: 'No hay roles registrados.',
        EMPTY_SEARCH: 'No se encontraron roles con los criterios de búsqueda.',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar roles...',
        NEW_BUTTON: 'Nuevo Rol',
        SEARCH_LABEL: 'Búsqueda de Roles',
        DIVIDER_FILTERS: 'Filtros Disponibles',
        DIVIDER_SEARCH: 'Buscar Rol por Nombre',
        DIVIDER_ACTIONS: 'Gestión de Roles',
      },
      DESCRIPTION: 'Administra los roles del sistema y asigna permisos a cada uno.',
      MESSAGES: {
        SUCCESS: {
          CREATE: 'Rol creado exitosamente.',
          UPDATE: 'Rol actualizado exitosamente.',
          DELETE: 'Rol eliminado exitosamente.',
        },
        ERROR: {
          LOAD: 'No se pudieron cargar los datos de roles. Verifique la conexión a la base de datos.',
          CREATE: 'Error al crear el rol.',
          UPDATE: 'Error al actualizar el rol.',
          DELETE: 'Error al eliminar el rol.',
        }
      }
    }
  }
};
