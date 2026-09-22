/*
  Warnings:

  - You are about to drop the column `estatus_caso_id` on the `seguimientos_caso` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "seguimientos_caso" DROP CONSTRAINT "seguimientos_caso_estatus_caso_id_fkey";

-- AlterTable
ALTER TABLE "estatus_llamada" ADD COLUMN     "estatus_caso_id" INTEGER;

-- AlterTable
ALTER TABLE "seguimientos_caso" DROP COLUMN "estatus_caso_id";

-- AddForeignKey
ALTER TABLE "estatus_llamada" ADD CONSTRAINT "estatus_llamada_estatus_caso_id_fkey" FOREIGN KEY ("estatus_caso_id") REFERENCES "estatus_caso"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
