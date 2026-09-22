-- AlterTable
ALTER TABLE "casos" ADD COLUMN     "ultima_remision_en" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "casos_ultima_remision_en_idx" ON "casos"("ultima_remision_en");
