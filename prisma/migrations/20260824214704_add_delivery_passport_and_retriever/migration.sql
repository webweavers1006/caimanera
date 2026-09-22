-- AlterTable
ALTER TABLE "entregas_documentos" ADD COLUMN     "cedula_retira" VARCHAR(20),
ADD COLUMN     "nombre_retira" VARCHAR(200),
ADD COLUMN     "numero_pasaporte" VARCHAR(50),
ADD COLUMN     "parentesco_retira" VARCHAR(100),
ADD COLUMN     "tipo_retiro" VARCHAR(20),
ADD COLUMN     "vence_pasaporte" VARCHAR(20);
