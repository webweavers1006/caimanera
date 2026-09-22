/**
 * Centralized configuration for the Courts module.
 */

export const COURT_CONFIG = {
  PATH: '/admin/canchas',
  TITLE: 'Canchas',

  PERMISSIONS: {
    VIEW: 'courts:view',
    READ: 'courts:read',
    WRITE: 'courts:create',
    UPDATE: 'courts:update',
    DELETE: 'courts:delete',
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
          SPORT: 'Deporte',
          DESCRIPTION: 'Descripción',
          ADDRESS: 'Dirección',
          LATITUDE: 'Latitud',
          LONGITUDE: 'Longitud',
          HOURLY_RATE: 'Tarifa por Hora',
          MANAGER: 'Encargado',
          IS_ACTIVE: 'Activa',
        },
        PLACEHOLDERS: {
          NAME: 'Ej: Cancha Central',
          SPORT: 'Ej: Fútbol 7',
          DESCRIPTION: 'Descripción opcional de la cancha...',
          ADDRESS: 'Ej: Av. Principal, Sector El Valle',
          LATITUDE: 'Ej: 10.480594',
          LONGITUDE: 'Ej: -66.903606',
          HOURLY_RATE: 'Ej: 15000',
          MANAGER: 'Seleccionar encargado...',
        },
        IS_ACTIVE_DESCRIPTION: 'Las canchas inactivas no aparecen disponibles al crear partidos.',
        DELETE_DIALOG: {
          TITLE: '¿Estás seguro?',
          DESCRIPTION: 'Esta acción eliminará la cancha. No se puede deshacer.',
          CANCEL: 'Cancelar',
          SUBMIT: 'Eliminar',
        },
        DIALOG: {
          TITLE_CREATE: 'Nueva Cancha',
          TITLE_EDIT: 'Editar Cancha',
          DESCRIPTION_CREATE: 'Completa el formulario para registrar una nueva cancha en el sistema.',
          DESCRIPTION_EDIT: 'Modifica la información de la cancha existente.',
        },
        SUBMIT: 'Crear Cancha',
        UPDATE: 'Actualizar Cancha',
        SAVING: 'Guardando...',
      },
      PHOTOS: {
        TITLE: 'Fotos de la cancha',
        DESCRIPTION: 'Agrega imágenes de la cancha para mostrarlas en el detalle del partido.',
        ADD_LABEL: 'Agregar foto',
        REMOVE: 'Eliminar',
        UPLOAD_ERROR: 'No se pudo subir la foto.',
      },
      TABLE: {
        NAME: 'Cancha',
        SPORT: 'Deporte',
        MANAGER: 'Encargado',
        HOURLY_RATE: 'Tarifa',
        IS_ACTIVE: 'Activa',
        ACTIONS: 'Acciones',
        EMPTY: 'No hay canchas registradas.',
        EMPTY_SEARCH: 'No se encontraron canchas con los criterios de búsqueda.',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar canchas...',
        NEW_BUTTON: 'Nueva Cancha',
        SEARCH_LABEL: 'Búsqueda de Canchas',
        DIVIDER_SEARCH: 'Buscar por Nombre o Deporte',
        DIVIDER_ACTIONS: 'Gestión de Canchas',
      },
      DESCRIPTION: 'Administra las canchas deportivas del sistema.',
      MESSAGES: {
        SUCCESS: {
          CREATE: 'Cancha creada exitosamente.',
          UPDATE: 'Cancha actualizada exitosamente.',
          DELETE: 'Cancha eliminada exitosamente.',
        },
        ERROR: {
          LOAD: 'No se pudieron obtener las canchas.',
          CREATE: 'Error al crear la cancha.',
          UPDATE: 'Error al actualizar la cancha.',
          DELETE: 'Error al eliminar la cancha.',
        }
      }
    }
  }
};
