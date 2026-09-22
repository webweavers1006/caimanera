-- AlterTable
ALTER TABLE "remisiones_caso" ADD COLUMN     "unidad_organizativa_id" INTEGER;

-- AddForeignKey
ALTER TABLE "remisiones_caso" ADD CONSTRAINT "remisiones_caso_unidad_organizativa_id_fkey" FOREIGN KEY ("unidad_organizativa_id") REFERENCES "unidades_organizativas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
