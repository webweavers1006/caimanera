-- AlterTable
ALTER TABLE "auditoria" ADD COLUMN     "actualizado_en" TIMESTAMPTZ(6),
ADD COLUMN     "eliminado_en" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "contadores_turnos" ADD COLUMN     "eliminado_en" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "correos_enviados" ADD COLUMN     "eliminado_en" TIMESTAMPTZ(6);
