/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `oficinas` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "oficinas" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cambio_correo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cedula_jefe" VARCHAR(20),
ADD COLUMN     "codigo" VARCHAR(10),
ADD COLUMN     "direccion" VARCHAR(500),
ADD COLUMN     "email_jefe" VARCHAR(255),
ADD COLUMN     "estado_id" INTEGER,
ADD COLUMN     "extranjeria" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "migracion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nombre_jefe" VARCHAR(255),
ADD COLUMN     "observacion" VARCHAR(500),
ADD COLUMN     "telefono_jefe" VARCHAR(100),
ADD COLUMN     "ultima_actualizacion" TIMESTAMPTZ(6),
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "oficinas_codigo_key" ON "oficinas"("codigo");

-- AddForeignKey
ALTER TABLE "oficinas" ADD CONSTRAINT "oficinas_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados"("id") ON DELETE SET NULL ON UPDATE CASCADE;
