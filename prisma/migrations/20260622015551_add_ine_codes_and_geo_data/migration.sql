/*
  Warnings:

  - A unique constraint covering the columns `[codigo_ine]` on the table `estados` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo_ine]` on the table `municipios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo_ine]` on the table `parroquias` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "estados" ADD COLUMN     "codigo_ine" VARCHAR(4);

-- AlterTable
ALTER TABLE "municipios" ADD COLUMN     "codigo_ine" VARCHAR(6);

-- AlterTable
ALTER TABLE "parroquias" ADD COLUMN     "codigo_ine" VARCHAR(8),
ADD COLUMN     "datos_geo" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "estados_codigo_ine_key" ON "estados"("codigo_ine");

-- CreateIndex
CREATE UNIQUE INDEX "municipios_codigo_ine_key" ON "municipios"("codigo_ine");

-- CreateIndex
CREATE UNIQUE INDEX "parroquias_codigo_ine_key" ON "parroquias"("codigo_ine");
