-- DropIndex
DROP INDEX "casos_actualizado_en_idx";

-- DropIndex
DROP INDEX "casos_creado_en_idx";

-- DropIndex
DROP INDEX "casos_numero_solicitud_trgm_idx";

-- DropIndex
DROP INDEX "documentos_caso_caso_id_eliminado_en_idx";

-- DropIndex
DROP INDEX "personas_apellido_trgm_idx";

-- DropIndex
DROP INDEX "personas_cedula_trgm_idx";

-- DropIndex
DROP INDEX "personas_nombre_trgm_idx";

-- DropIndex
DROP INDEX "remisiones_caso_unidad_organizativa_id_vigencia_eliminado_e_idx";

-- DropIndex
DROP INDEX "turnos_oficina_id_estatus_creado_en_idx";

-- AlterTable
ALTER TABLE "estatus_llamada" ADD COLUMN     "enviar_correo" BOOLEAN NOT NULL DEFAULT false;
