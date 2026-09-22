-- AlterTable
ALTER TABLE "estatus_llamada" ADD COLUMN     "requiere_mensaje_ciudadano" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiere_motivo" BOOLEAN NOT NULL DEFAULT false;
