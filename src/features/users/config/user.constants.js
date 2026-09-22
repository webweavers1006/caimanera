/**
 * Configuración centralizada para el módulo de Usuarios.
 */

export const USER_CONFIG = {
  // Rutas del módulo
  PATH: '/admin/users',
  TITLE: 'Usuarios',

  // Permisos requeridos
  PERMISSIONS: {
    VIEW: 'users:view',
    READ: 'users:read',
    READ_ALL: 'users:read_all',
    WRITE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },

  // Estados de usuario
  STATUS: {
    ALL: 'all',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },

  // Configuración de Paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SEARCH_TAKE: 10,
  },

  // Configuración de visualización (Frontend)
  UI: {
    BADGE_VARIANTS: {
      ACTIVE: 'default',
      INACTIVE: 'secondary',
    },
    LABELS: {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      NO_ROLE: 'Sin Rol',
      CLEAN_BUTTON: 'Limpiar',
      FORM: {
        FIELDS: {
          NAME: 'Nombre',
          LASTNAME: 'Apellido',
          CEDULA: 'Cédula',
          EMAIL: 'Email',
          PASSWORD: 'Contraseña',
          ROLE: 'Rol',
          DIRECTION: 'Dirección',
          ATTENTION_CHANNEL: 'Canal de Atención',
          OFFICE: 'Oficina',
          STATUS: 'Estado del Usuario',
        },
        PLACEHOLDERS: {
          NAME: 'Ej: Juan',
          LASTNAME: 'Ej: Pérez',
          CEDULA: 'Ej: 123456789',
          EMAIL: 'juan@empresa.com',
          PASSWORD: 'Mínimo 6 caracteres',
          PASSWORD_EDIT: 'Dejar en blanco para mantener',
          SELECT_ROLE: 'Seleccionar Rol',
          SELECT_DIRECTION: 'Seleccionar dirección...',
          SELECT_ATTENTION_CHANNEL: 'Seleccionar canal...',
        },
        DESCRIPTIONS: {
          ACTIVE: 'Usuario activo en el sistema',
          INACTIVE: 'Usuario inactivo',
        },
        DELETE_DIALOG: {
          TITLE: '¿Estás seguro?',
          DESCRIPTION: 'Esta acción eliminará al usuario. No se puede deshacer. Si tiene historial, considera inactivarlo en su lugar.',
          CANCEL: 'Cancelar',
          SUBMIT: 'Eliminar',
        },
        ORGANIGRAMA: {
          DIRECTION_LABEL: 'Dirección',
          OFFICE_LABEL: 'Oficina',
          UNIT_LABEL: 'Unidad',
          DEPARTMENT_LABEL: 'Departamento',
          NOT_ASSIGNED: 'Sin asignar',
          MANAGE_LINK: 'Gestionar en Organigrama →',
        },
        DIALOG: {
          TITLE_CREATE: 'Nuevo Usuario',
          TITLE_EDIT: 'Editar Usuario',
          DESCRIPTION_CREATE: 'Completa el formulario para registrar un nuevo usuario en el sistema.',
          DESCRIPTION_EDIT: 'Modifica la información del usuario existente.',
        },
        SUBMIT: 'Crear Usuario',
        UPDATE: 'Actualizar Usuario',
        SAVING: 'Guardando...',
      },
      TABLE: {
        NAME: 'Nombre Completo',
        CEDULA: 'Cédula',
        EMAIL: 'Email',
        ROLE: 'Rol',
        STATUS: 'Estado',
        UPDATED_AT: 'Última Actualización',
        ACTIONS: 'Acciones',
        EMPTY_SEARCH: 'No se encontraron usuarios.',
        EMPTY_DATA: 'No hay usuarios registrados.',
        ENTITY_NAME: 'usuarios',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar por nombre o cédula...',
        NEW_BUTTON: 'Nuevo Usuario',
        SEARCH_LABEL: 'Búsqueda de Personal',
        FILTERS_TOGGLE: 'Filtros',
        FILTERS_ACTIVE: (n) => `${n} filtro${n !== 1 ? 's' : ''} activo${n !== 1 ? 's' : ''}`,
        DIVIDER_CATALOGS: 'Catálogos',
        DIVIDER_DATES: 'Fechas',
        DIVIDER_ACTIONS: 'Acciones Disponibles',
        FILTERS: {
          ROLE: 'Rol',
          ROLE_PLACEHOLDER: 'Todos los roles',
          OFFICE: 'Oficina',
          OFFICE_PLACEHOLDER: 'Todas las oficinas',
          DIRECTION: 'Dirección',
          DIRECTION_PLACEHOLDER: 'Todas las direcciones',
          STATUS: 'Estado',
          STATUS_PLACEHOLDER: 'Todos los estados',
          DATE_FROM: 'Desde',
          DATE_FROM_PLACEHOLDER: 'Fecha inicio',
          DATE_TO: 'Hasta',
          DATE_TO_PLACEHOLDER: 'Fecha fin',
        },
      },
      DESCRIPTION: 'Administra los usuarios del sistema y sus roles asignados.',
      CREDENTIALS: {
        DIALOG_TITLE: 'Enviar Credenciales de Acceso',
        DIALOG_DESCRIPTION_ALL: 'Se generarán nuevas contraseñas aleatorias y se enviarán por correo electrónico a todos los usuarios activos del sistema.',
        DIALOG_DESCRIPTION_SINGLE: 'Se generará una nueva contraseña aleatoria y se enviará por correo electrónico al usuario seleccionado.',
        DIALOG_DESCRIPTION_SELECTED: (count) => `Se generarán nuevas contraseñas aleatorias y se enviarán por correo electrónico a ${count} usuarios seleccionados.`,
        CONFIRM_BUTTON: 'Enviar Credenciales',
        CANCEL_BUTTON: 'Cancelar',
        SENDING: 'Enviando...',
        SUCCESS_TITLE: 'Credenciales Enviadas',
        SUCCESS_DESCRIPTION: 'Las credenciales fueron enviadas exitosamente.',
        ERROR_TITLE: 'Error',
        ERROR_DESCRIPTION: 'No se pudieron enviar las credenciales.',
        RESULT_SENT: 'enviado(s)',
        RESULT_FAILED: 'fallido(s)',
      },
      MESSAGES: {
        ERROR: {
          LOAD: 'No se pudieron cargar los datos de usuarios. Verifique la conexión a la base de datos.',
        },
        SUCCESS: {
          SAVE: 'Usuario guardado exitosamente.',
          DELETE: 'Usuario eliminado exitosamente.',
        }
      },
      /** @section PDF Export */
      PDF: {
        TITLE: 'REPORTE DE USUARIOS',
        SUBTITLE: 'Listado de personal del sistema',
        DOWNLOAD_BUTTON: 'Descargar PDF',
        DOWNLOADING: 'Generando PDF...',
        GENERATED: 'PDF generado correctamente.',
        GENERATE_ERROR: 'Error al generar el PDF.',
        TABLE_ID_CARD: 'Cédula',
        TABLE_NAME: 'Nombre Completo',
        TABLE_REQUEST_TYPE: 'Tipo de Solicitud',
        TABLE_EXPECTED_PRODUCT: 'Producto Esperado',
        TABLE_STATUS: 'Estatus',
        DATE_RANGE: 'Período',
        DATE_ALL: 'Todo el historial',
        ACTIVE: 'Activo',
        INACTIVE: 'Inactivo',
        NO_PERMISSIONS: 'Sin solicitudes',
        PRODUCT_PENDING: '—',
        FOOTER_LINE1: 'Servicio Administrativo de Identificación, Migración y Extranjería (SAIME)',
        FOOTER_LINE2: 'Dirección de Atención al Ciudadano — Sistema Integral de Atención al Ciudadano',
        FOOTER_LINE3: 'Av. Universidad, Esq. Traposos, Torre MPPRE, Piso 3, Caracas, Venezuela',
        FOOTER_WEB: 'www.saime.gob.ve',
      },
      /** @section Excel Export */
      EXCEL: {
        DOWNLOAD_BUTTON: 'Descargar Excel',
        DOWNLOADING: 'Generando Excel...',
        GENERATED: 'Excel generado correctamente.',
        GENERATE_ERROR: 'Error al generar el Excel.',
      },
    }
  }
};
