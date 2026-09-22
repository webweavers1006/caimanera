/*
  Warnings:

  - You are about to drop the column `departamento_id` on the `usuarios` table. All the data in the column will be lost.

  Existing single-department assignments are migrated to the new N:M pivot
  table BEFORE the column is dropped. Runs identically in dev and production.
*/

-- CreateTable
CREATE TABLE "departamentos_usuarios" (
    "id" SERIAL NOT NULL,
    "departamento_id" INTEGER NOT NULL,
    "usuario_id" UUID NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departamentos_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_usuarios_departamento_id_usuario_id_key" ON "departamentos_usuarios"("departamento_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "departamentos_usuarios" ADD CONSTRAINT "departamentos_usuarios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamentos_usuarios" ADD CONSTRAINT "departamentos_usuarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataBackfill: move every existing single-department assignment into the pivot
INSERT INTO "departamentos_usuarios" ("departamento_id", "usuario_id")
SELECT "departamento_id", "id"
FROM "usuarios"
WHERE "departamento_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_departamento_id_fkey";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "departamento_id";
