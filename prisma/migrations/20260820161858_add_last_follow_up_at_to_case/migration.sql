-- AlterTable
ALTER TABLE "casos" ADD COLUMN     "ultimo_seguimiento_en" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "casos_ultimo_seguimiento_en_idx" ON "casos"("ultimo_seguimiento_en");

-- DataBackfill: populate lastFollowUpAt from existing (non-deleted) follow-ups
UPDATE "casos" c
SET "ultimo_seguimiento_en" = s.max_fecha::timestamptz
FROM (
  SELECT "caso_id", MAX("fecha") AS max_fecha
  FROM "seguimientos_caso"
  WHERE "eliminado_en" IS NULL
  GROUP BY "caso_id"
) s
WHERE c."id_caso" = s."caso_id";
