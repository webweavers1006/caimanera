-- AlterTable
ALTER TABLE "casos" ADD COLUMN     "reclamado_en" TIMESTAMPTZ(6),
ADD COLUMN     "reclamado_por" UUID;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_reclamado_por_fkey" FOREIGN KEY ("reclamado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
