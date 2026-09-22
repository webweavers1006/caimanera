-- CreateTable
CREATE TABLE "contadores_turnos" (
    "id" SERIAL NOT NULL,
    "oficina_id" INTEGER NOT NULL,
    "tipo_atencion_id" INTEGER,
    "prefijo" VARCHAR(5) NOT NULL,
    "numero_actual" INTEGER NOT NULL DEFAULT 0,
    "ultimo_reinicio" DATE,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),

    CONSTRAINT "contadores_turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" SERIAL NOT NULL,
    "numero_turno" VARCHAR(20) NOT NULL,
    "estatus" VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    "oficina_id" INTEGER,
    "tipo_atencion_id" INTEGER,
    "usuario_id" UUID,
    "persona_id" INTEGER,
    "caso_id" INTEGER,
    "numero_escritorio" VARCHAR(10),
    "notas" TEXT,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "llamado_en" TIMESTAMPTZ(6),
    "iniciado_en" TIMESTAMPTZ(6),
    "finalizado_en" TIMESTAMPTZ(6),
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contadores_turnos_oficina_id_tipo_atencion_id_key" ON "contadores_turnos"("oficina_id", "tipo_atencion_id");

-- CreateIndex
CREATE UNIQUE INDEX "turnos_numero_turno_key" ON "turnos"("numero_turno");

-- CreateIndex
CREATE UNIQUE INDEX "turnos_caso_id_key" ON "turnos"("caso_id");

-- CreateIndex
CREATE INDEX "turnos_oficina_id_estatus_idx" ON "turnos"("oficina_id", "estatus");

-- CreateIndex
CREATE INDEX "turnos_usuario_id_estatus_idx" ON "turnos"("usuario_id", "estatus");

-- AddForeignKey
ALTER TABLE "contadores_turnos" ADD CONSTRAINT "contadores_turnos_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contadores_turnos" ADD CONSTRAINT "contadores_turnos_tipo_atencion_id_fkey" FOREIGN KEY ("tipo_atencion_id") REFERENCES "tipos_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_tipo_atencion_id_fkey" FOREIGN KEY ("tipo_atencion_id") REFERENCES "tipos_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;
