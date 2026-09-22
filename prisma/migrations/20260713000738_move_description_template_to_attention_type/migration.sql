/*
  Warnings:

  - You are about to drop the column `plantilla_descripcion` on the `motivos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "motivos" DROP COLUMN "plantilla_descripcion";

-- AlterTable
ALTER TABLE "tipos_atencion" ADD COLUMN     "plantilla_descripcion" TEXT;
