-- CreateTable
CREATE TABLE "casos" (
    "id_caso" SERIAL NOT NULL,
    "numero_solicitud" VARCHAR(48),
    "descripcion" TEXT,
    "fecha_caso" DATE,
    "hora_caso" VARCHAR(20),
    "persona_id" INTEGER,
    "usuario_id" UUID,
    "estatus_caso_id" INTEGER,
    "area_caso_id" INTEGER,
    "motivo_id" INTEGER,
    "tipo_atencion_id" INTEGER,
    "tipo_atencion_detalle_id" INTEGER,
    "red_social_id" INTEGER,
    "ente_adscrito_id" INTEGER,
    "org_popular_id" INTEGER,
    "oficina_id" INTEGER,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "casos_pkey" PRIMARY KEY ("id_caso")
);

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_estatus_caso_id_fkey" FOREIGN KEY ("estatus_caso_id") REFERENCES "estatus_caso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_area_caso_id_fkey" FOREIGN KEY ("area_caso_id") REFERENCES "areas_caso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_motivo_id_fkey" FOREIGN KEY ("motivo_id") REFERENCES "motivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_tipo_atencion_id_fkey" FOREIGN KEY ("tipo_atencion_id") REFERENCES "tipos_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_tipo_atencion_detalle_id_fkey" FOREIGN KEY ("tipo_atencion_detalle_id") REFERENCES "tipos_atencion_detalle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_red_social_id_fkey" FOREIGN KEY ("red_social_id") REFERENCES "redes_sociales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_ente_adscrito_id_fkey" FOREIGN KEY ("ente_adscrito_id") REFERENCES "entes_adscritos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_org_popular_id_fkey" FOREIGN KEY ("org_popular_id") REFERENCES "org_poder_popular"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
