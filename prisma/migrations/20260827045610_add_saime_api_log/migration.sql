-- CreateTable
CREATE TABLE "registro_peticiones_saime" (
    "id" SERIAL NOT NULL,
    "origen" VARCHAR(50) NOT NULL,
    "letra" VARCHAR(1),
    "estatus" VARCHAR(20) NOT NULL,
    "codigo_http" INTEGER,
    "mensaje_error" VARCHAR(255),
    "duracion_ms" INTEGER,
    "usuario_id" UUID,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "registro_peticiones_saime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registro_peticiones_saime_creado_en_idx" ON "registro_peticiones_saime"("creado_en");

-- CreateIndex
CREATE INDEX "registro_peticiones_saime_estatus_idx" ON "registro_peticiones_saime"("estatus");

-- CreateIndex
CREATE INDEX "registro_peticiones_saime_origen_idx" ON "registro_peticiones_saime"("origen");

-- AddForeignKey
ALTER TABLE "registro_peticiones_saime" ADD CONSTRAINT "registro_peticiones_saime_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
