-- AlterTable
ALTER TABLE "remisiones_caso" ADD COLUMN     "departamento_id" INTEGER;

-- CreateIndex
CREATE INDEX "remisiones_caso_departamento_id_vigencia_eliminado_en_idx" ON "remisiones_caso"("departamento_id", "vigencia", "eliminado_en");

-- AddForeignKey
ALTER TABLE "remisiones_caso" ADD CONSTRAINT "remisiones_caso_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
