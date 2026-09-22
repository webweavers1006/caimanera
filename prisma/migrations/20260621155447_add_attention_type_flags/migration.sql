-- AlterTable
ALTER TABLE "tipos_atencion" ADD COLUMN     "tiene_denuncia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiene_detalle_atencion" BOOLEAN NOT NULL DEFAULT false;
