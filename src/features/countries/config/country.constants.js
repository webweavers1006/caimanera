/**
 * Centralized configuration for the Countries module.
 */

export const COUNTRY_CONFIG = {
  PATH: '/admin/paises',
  TITLE: 'Países',

  PERMISSIONS: {
    VIEW: 'countries:view',
    READ: 'countries:read',
    WRITE: 'countries:create',
    UPDATE: 'countries:update',
    DELETE: 'countries:delete',
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SEARCH_TAKE: 10,
  },

  UI: {
    ITEMS_PER_PAGE: 10,
    LABELS: {
      CLEAN_BUTTON: 'Limpiar',
      FORM: {
        FIELDS: {
          NAME: 'Nombre',
        },
        PLACEHOLDERS: {
          NAME: 'Ej: Venezuela',
        },
        DELETE_DIALOG: {
          TITLE: '¿Estás seguro?',
          DESCRIPTION: 'Esta acción eliminará el país. No se puede deshacer.',
          CANCEL: 'Cancelar',
          SUBMIT: 'Eliminar',
        },
        DIALOG: {
          TITLE_CREATE: 'Nuevo País',
          TITLE_EDIT: 'Editar País',
          DESCRIPTION_CREATE: 'Completa el formulario para registrar un nuevo país en el sistema.',
          DESCRIPTION_EDIT: 'Modifica la información del país existente.',
        },
        SUBMIT: 'Crear País',
        UPDATE: 'Actualizar País',
        SAVING: 'Guardando...',
      },
      TABLE: {
        NAME: 'País',
        ACTIONS: 'Acciones',
        EMPTY: 'No hay países registrados.',
        EMPTY_SEARCH: 'No se encontraron países con los criterios de búsqueda.',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar países...',
        NEW_BUTTON: 'Nuevo País',
        SEARCH_LABEL: 'Búsqueda de Países',
        DIVIDER_SEARCH: 'Buscar por Nombre',
        DIVIDER_ACTIONS: 'Gestión de Países',
      },
      DESCRIPTION: 'Administra los países del sistema.',
      MESSAGES: {
        SUCCESS: {
          CREATE: 'País creado exitosamente.',
          UPDATE: 'País actualizado exitosamente.',
          DELETE: 'País eliminado exitosamente.',
        },
        ERROR: {
          LOAD: 'No se pudieron obtener los países.',
          CREATE: 'Error al crear el país.',
          UPDATE: 'Error al actualizar el país.',
          DELETE: 'Error al eliminar el país.',
        }
      }
    }
  }
};
