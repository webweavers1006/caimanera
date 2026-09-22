-- AlterTable
ALTER TABLE "entregas_documentos" ADD COLUMN     "firma_omitida" BOOLEAN DEFAULT false,
ADD COLUMN     "foto_omitida" BOOLEAN DEFAULT false,
ADD COLUMN     "huella_omitida" BOOLEAN DEFAULT false;
