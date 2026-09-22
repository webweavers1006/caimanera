-- AlterTable
ALTER TABLE "tipos_atencion" ADD COLUMN     "etiqueta_remision_automatica" VARCHAR(100),
ADD COLUMN     "remision_automatica_direccion_id" INTEGER,
ADD COLUMN     "remision_automatica_unidad_id" INTEGER;

-- AddForeignKey
ALTER TABLE "tipos_atencion" ADD CONSTRAINT "tipos_atencion_remision_automatica_direccion_id_fkey" FOREIGN KEY ("remision_automatica_direccion_id") REFERENCES "direcciones_administrativas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tipos_atencion" ADD CONSTRAINT "tipos_atencion_remision_automatica_unidad_id_fkey" FOREIGN KEY ("remision_automatica_unidad_id") REFERENCES "unidades_organizativas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
