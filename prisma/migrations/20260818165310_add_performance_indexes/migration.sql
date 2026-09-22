-- CreateIndex
CREATE INDEX "casos_creado_en_idx" ON "casos"("creado_en");

-- CreateIndex
CREATE INDEX "casos_actualizado_en_idx" ON "casos"("actualizado_en");

-- CreateIndex
CREATE INDEX "documentos_caso_caso_id_eliminado_en_idx" ON "documentos_caso"("caso_id", "eliminado_en");

-- CreateIndex
CREATE INDEX "remisiones_caso_unidad_organizativa_id_vigencia_eliminado_e_idx" ON "remisiones_caso"("unidad_organizativa_id", "vigencia", "eliminado_en");

-- CreateIndex
CREATE INDEX "turnos_oficina_id_estatus_creado_en_idx" ON "turnos"("oficina_id", "estatus", "creado_en");

-- ── Trigram search support (pg_trgm) ─────────────────────────────────
-- Speeds up `contains`/ILIKE searches on case request numbers, ID cards
-- and person names used by case lists and person lookups.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "casos_numero_solicitud_trgm_idx"
  ON "casos" USING gin ("numero_solicitud" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "personas_cedula_trgm_idx"
  ON "personas" USING gin ("cedula" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "personas_nombre_trgm_idx"
  ON "personas" USING gin ("nombre" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "personas_apellido_trgm_idx"
  ON "personas" USING gin ("apellido" gin_trgm_ops);
