/*
  Warnings:

  - You are about to drop the column `formato_imagen` on the `plantillas_huellas` table. All the data in the column will be lost.
  - You are about to drop the column `imagen_huella` on the `plantillas_huellas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plantillas_huellas" DROP COLUMN "formato_imagen",
DROP COLUMN "imagen_huella",
ADD COLUMN     "ruta_imagen" VARCHAR(500);
