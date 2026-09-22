-- CreateIndex
CREATE INDEX "entregas_documentos_eliminado_en_entregado_en_idx" ON "entregas_documentos"("eliminado_en", "entregado_en" DESC);

-- CreateIndex
CREATE INDEX "entregas_documentos_tipo_documento_idx" ON "entregas_documentos"("tipo_documento");

-- CreateIndex
CREATE INDEX "entregas_documentos_tipo_entrega_id_idx" ON "entregas_documentos"("tipo_entrega_id");

-- CreateIndex
CREATE INDEX "entregas_documentos_oficina_id_idx" ON "entregas_documentos"("oficina_id");

-- CreateIndex
CREATE INDEX "entregas_documentos_operador_id_idx" ON "entregas_documentos"("operador_id");

-- CreateIndex
CREATE INDEX "entregas_documentos_tipo_retiro_idx" ON "entregas_documentos"("tipo_retiro");
