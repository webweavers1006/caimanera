/*
  Warnings:

  - You are about to drop the column `area_caso_defecto_id` on the `direcciones_administrativas` table. All the data in the column will be lost.
  - You are about to drop the column `area_caso_id` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `direccion_area` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "direccion_area" DROP CONSTRAINT "direccion_area_areaId_fkey";

-- DropForeignKey
ALTER TABLE "direccion_area" DROP CONSTRAINT "direccion_area_directionId_fkey";

-- DropForeignKey
ALTER TABLE "direcciones_administrativas" DROP CONSTRAINT "direcciones_administrativas_area_caso_defecto_id_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_area_caso_id_fkey";

-- AlterTable
ALTER TABLE "direcciones_administrativas" DROP COLUMN "area_caso_defecto_id",
ADD COLUMN     "lider_id" UUID;

-- AlterTable
ALTER TABLE "oficinas" ADD COLUMN     "lider_id" UUID;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "area_caso_id",
ADD COLUMN     "unidad_organizativa_id" INTEGER;

-- DropTable
DROP TABLE "direccion_area";

-- CreateTable
CREATE TABLE "supervision_usuarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supervisor_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supervision_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_organizativas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "direccion_administrativa_id" INTEGER,
    "unidad_padre_id" INTEGER,
    "lider_id" UUID,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "unidades_organizativas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supervision_usuarios_supervisor_id_usuario_id_key" ON "supervision_usuarios"("supervisor_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_unidad_organizativa_id_fkey" FOREIGN KEY ("unidad_organizativa_id") REFERENCES "unidades_organizativas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supervision_usuarios" ADD CONSTRAINT "supervision_usuarios_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervision_usuarios" ADD CONSTRAINT "supervision_usuarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones_administrativas" ADD CONSTRAINT "direcciones_administrativas_lider_id_fkey" FOREIGN KEY ("lider_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unidades_organizativas" ADD CONSTRAINT "unidades_organizativas_direccion_administrativa_id_fkey" FOREIGN KEY ("direccion_administrativa_id") REFERENCES "direcciones_administrativas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unidades_organizativas" ADD CONSTRAINT "unidades_organizativas_unidad_padre_id_fkey" FOREIGN KEY ("unidad_padre_id") REFERENCES "unidades_organizativas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unidades_organizativas" ADD CONSTRAINT "unidades_organizativas_lider_id_fkey" FOREIGN KEY ("lider_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "oficinas" ADD CONSTRAINT "oficinas_lider_id_fkey" FOREIGN KEY ("lider_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
