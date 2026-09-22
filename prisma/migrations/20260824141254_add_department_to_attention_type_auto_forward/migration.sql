-- AlterTable
ALTER TABLE "tipos_atencion" ADD COLUMN     "remision_automatica_departamento_id" INTEGER;

-- AddForeignKey
ALTER TABLE "tipos_atencion" ADD CONSTRAINT "tipos_atencion_remision_automatica_departamento_id_fkey" FOREIGN KEY ("remision_automatica_departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
