/**
 * Global shared constants for UI labels and common configurations.
 * Enforces Config-Driven UI across the entire application.
 */

export const SHARED_CONFIG = {
  UI: {
    LABELS: {
      ACTIONS: {
        TITLE: 'Acciones',
        EDIT: 'Editar',
        DELETE: 'Eliminar',
        VIEW: 'Ver',
        CANCEL: 'Cancelar',
        SAVE: 'Guardar',
        SUBMIT: 'Enviar',
        CREATE: 'Crear',
        UPDATE: 'Actualizar',
        SAVING: 'Guardando...',
        DELETING: 'Eliminando...',
        CONFIRM: 'Confirmar',
      },
      TABLE: {
        EMPTY: 'No se encontraron registros.',
        EMPTY_SEARCH: 'No hay resultados para esta búsqueda.',
        LOADING: 'Cargando datos...',
        TOTAL: 'Total',
        PAGE: 'Página',
        OF: 'de',
      },
      TOOLBAR: {
        SEARCH: 'Buscar...',
        CLEAN: 'Limpiar',
        NEW: 'Nuevo',
        FILTER: 'Filtrar',
      },
      DIALOGS: {
        DELETE: {
          TITLE: '¿Estás seguro?',
          DESCRIPTION: 'Esta acción no se puede deshacer. Por favor, confirma si deseas continuar.',
          CANCEL: 'Cancelar',
          CONFIRM: 'Eliminar',
        }
      },
      ERROR: {
        TITLE: 'Error',
        DESCRIPTION: 'No se pudieron cargar los datos. Por favor, verifique la conexión o intente nuevamente.',
      },
      ACCESS_DENIED: {
        TITLE: 'Acceso Denegado',
        DESCRIPTION: 'No tienes permisos para ver este módulo.',
      },
      FILE_UPLOAD: {
        NO_FILE: 'No se ha seleccionado ningún archivo.',
        INVALID_EXTENSION: (exts) => `Tipo de archivo no permitido. Solo: ${exts}`,
        INVALID_CONTENT: 'El contenido del archivo no coincide con el formato esperado.',
        VERIFY_FAILED: 'No se pudo verificar el contenido del archivo.',
        UPLOADING: 'Subiendo archivo...',
        ERROR: 'Error',
        RETRY: 'Intentar de nuevo',
        SUCCESS_DEFERRED: 'Archivo listo para enviar',
        SUCCESS_INSTANT: 'Archivo subido correctamente',
        UPLOAD_ERROR: 'Error al subir el archivo.',
        DRAG_PROMPT: 'Arrastra un archivo o haz clic',
        DROP_PROMPT: 'Suelta el archivo aquí',
        MAX_SIZE: (mb) => `El archivo supera el tamaño máximo de ${mb}MB.`,
      },
      PAGINATION: {
        SHOWING: 'Mostrando',
        PREVIOUS: 'Anterior',
        NEXT: 'Siguiente',
        ENTITY_DEFAULT: 'registros',
      },
      TABLE_ACTIONS: {
        OPEN_MENU: 'Abrir menú',
        SELECT_ALL: 'Select all',
      },
      DATA_TABLE: {
        EMPTY: 'No hay resultados.',
      },
      SELECT: {
        PLACEHOLDER: 'Seleccionar...',
        SEARCH_PLACEHOLDER: 'Buscar...',
        LOADING: 'Cargando...',
        EMPTY: 'No se encontraron resultados.',
        NO_RESULTS: 'Sin resultados.',
        SELECT_ALL: 'Seleccionar todos',
        CLEAR_SELECTION: 'Limpiar selección',
        CLEAR_SEARCH: 'Limpiar búsqueda',
        SELECTED_COUNT: (n) => `${n} seleccionados`,
        MIN_SEARCH_CHARS: (n) => `Escribe al menos ${n} caracteres.`,
        PLACEHOLDER_STATE_FIRST: 'Seleccione un estado primero',
      },
      PRINT: {
        LABEL: 'Imprimir',
      },
      SCHEMA_REQUIREMENTS: {
        TITLE: 'Requisitos del campo',
        FALLBACK: 'Requisito de seguridad',
        MIN_CHARS: (n) => `Al menos ${n} caracteres`,
        MAX_CHARS: (n) => `Máximo ${n} caracteres`,
        VALID_EMAIL: 'Formato de correo válido',
      },
      MESSAGES: {
        UNEXPECTED_SERVER_ERROR: 'Error inesperado en el servidor.',
        UNEXPECTED_DELETE_ERROR: 'Error inesperado al eliminar.',
        FETCH_LIST_ERROR: 'No se pudo obtener la lista.',
        SAVE_ERROR: 'Error al guardar.',
        CREATE_ERROR: 'Error al crear.',
        UPDATE_ERROR: 'Error al actualizar.',
        DELETE_ERROR: 'Error al eliminar.',
        ERROR_TITLE: 'Error',
      },
    },
    BADGE_VARIANTS: {
      ACTIVE: 'success',
      INACTIVE: 'destructive',
      PENDING: 'warning',
      INFO: 'secondary',
    }
  }
};
