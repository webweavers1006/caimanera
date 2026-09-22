/*
  Warnings:

  - You are about to drop the column `motivo_cierre_id` on the `estatus_llamada` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "estatus_llamada" DROP CONSTRAINT "estatus_llamada_motivo_cierre_id_fkey";

-- AlterTable
ALTER TABLE "estatus_llamada" DROP COLUMN "motivo_cierre_id";
