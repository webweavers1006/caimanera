-- CreateIndex
CREATE INDEX "casos_estatus_caso_id_idx" ON "casos"("estatus_caso_id");

-- CreateIndex
CREATE INDEX "casos_usuario_id_idx" ON "casos"("usuario_id");

-- CreateIndex
CREATE INDEX "casos_tipo_atencion_id_idx" ON "casos"("tipo_atencion_id");

-- CreateIndex
CREATE INDEX "casos_area_caso_id_idx" ON "casos"("area_caso_id");

-- CreateIndex
CREATE INDEX "casos_persona_id_idx" ON "casos"("persona_id");

-- CreateIndex
CREATE INDEX "casos_fecha_caso_idx" ON "casos"("fecha_caso");

-- CreateIndex
CREATE INDEX "notificaciones_usuario_destino_id_leida_eliminado_en_idx" ON "notificaciones"("usuario_destino_id", "leida", "eliminado_en");

-- CreateIndex
CREATE INDEX "remisiones_caso_caso_id_vigencia_eliminado_en_idx" ON "remisiones_caso"("caso_id", "vigencia", "eliminado_en");

-- CreateIndex
CREATE INDEX "remisiones_caso_direccion_administrativa_id_vigencia_elimin_idx" ON "remisiones_caso"("direccion_administrativa_id", "vigencia", "eliminado_en");

-- CreateIndex
CREATE INDEX "seguimientos_caso_caso_id_eliminado_en_idx" ON "seguimientos_caso"("caso_id", "eliminado_en");
