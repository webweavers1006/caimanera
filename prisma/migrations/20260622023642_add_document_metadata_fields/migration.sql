-- AlterTable
ALTER TABLE "documentos_caso" ADD COLUMN     "extension" VARCHAR(10),
ADD COLUMN     "nombre_original" VARCHAR(255),
ADD COLUMN     "tamano_archivo" BIGINT,
ADD COLUMN     "tipo_mime" VARCHAR(100);
