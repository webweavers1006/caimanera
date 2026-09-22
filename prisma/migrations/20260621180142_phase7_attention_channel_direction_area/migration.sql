/*
  Warnings:

  - You are about to drop the column `red_social_id` on the `casos` table. All the data in the column will be lost.
  - You are about to drop the `redes_sociales` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "casos" DROP CONSTRAINT "casos_red_social_id_fkey";

-- AlterTable
ALTER TABLE "casos" DROP COLUMN "red_social_id",
ADD COLUMN     "canal_atencion_id" INTEGER;

-- AlterTable
ALTER TABLE "direcciones_administrativas" ADD COLUMN     "area_caso_defecto_id" INTEGER;

-- AlterTable
ALTER TABLE "seguimientos_caso" ADD COLUMN     "direccion_actual_id" INTEGER;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "area_caso_id" INTEGER,
ADD COLUMN     "canal_atencion_id" INTEGER,
ADD COLUMN     "direccion_administrativa_id" INTEGER;

-- DropTable
DROP TABLE "redes_sociales";

-- CreateTable
CREATE TABLE "canales_atencion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(48) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "canales_atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direccion_area" (
    "directionId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,

    CONSTRAINT "direccion_area_pkey" PRIMARY KEY ("directionId","areaId")
);

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_area_caso_id_fkey" FOREIGN KEY ("area_caso_id") REFERENCES "areas_caso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_direccion_administrativa_id_fkey" FOREIGN KEY ("direccion_administrativa_id") REFERENCES "direcciones_administrativas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_canal_atencion_id_fkey" FOREIGN KEY ("canal_atencion_id") REFERENCES "canales_atencion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "direccion_area" ADD CONSTRAINT "direccion_area_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "direcciones_administrativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direccion_area" ADD CONSTRAINT "direccion_area_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas_caso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones_administrativas" ADD CONSTRAINT "direcciones_administrativas_area_caso_defecto_id_fkey" FOREIGN KEY ("area_caso_defecto_id") REFERENCES "areas_caso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_canal_atencion_id_fkey" FOREIGN KEY ("canal_atencion_id") REFERENCES "canales_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_caso" ADD CONSTRAINT "seguimientos_caso_direccion_actual_id_fkey" FOREIGN KEY ("direccion_actual_id") REFERENCES "direcciones_administrativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
