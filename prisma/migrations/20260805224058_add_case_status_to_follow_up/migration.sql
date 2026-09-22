-- AlterTable
ALTER TABLE "seguimientos_caso" ADD COLUMN     "estatus_caso_id" INTEGER;

-- AddForeignKey
ALTER TABLE "seguimientos_caso" ADD CONSTRAINT "seguimientos_caso_estatus_caso_id_fkey" FOREIGN KEY ("estatus_caso_id") REFERENCES "estatus_caso"("id") ON DELETE SET NULL ON UPDATE CASCADE;
