-- CreateTable
CREATE TABLE "denuncias_caso" (
    "id" SERIAL NOT NULL,
    "caso_id" INTEGER,
    "afecta_persona" BOOLEAN NOT NULL DEFAULT false,
    "afecta_comunidad" BOOLEAN NOT NULL DEFAULT false,
    "afecta_terceros" BOOLEAN NOT NULL DEFAULT false,
    "involucrados" TEXT,
    "fecha_hechos" DATE,
    "instancia_popular" TEXT,
    "rif_instancia" TEXT,
    "ente_financiador" TEXT,
    "nombre_proyecto" TEXT,
    "monto_aprobado" TEXT,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "denuncias_caso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordenadas_caso" (
    "id" SERIAL NOT NULL,
    "caso_id" INTEGER,
    "usuario_id" UUID,
    "nombre" VARCHAR(255),
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "coordenadas_caso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remisiones_caso" (
    "id" SERIAL NOT NULL,
    "caso_id" INTEGER,
    "direccion_administrativa_id" INTEGER,
    "usuario_id" UUID,
    "vigencia" BOOLEAN NOT NULL DEFAULT true,
    "fecha" DATE,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "remisiones_caso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_caso" (
    "id" SERIAL NOT NULL,
    "caso_id" INTEGER,
    "ruta_archivo" TEXT NOT NULL,
    "descripcion" TEXT,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "documentos_caso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguimientos_caso" (
    "id" SERIAL NOT NULL,
    "caso_id" INTEGER,
    "estatus_llamada_id" INTEGER,
    "comentario" VARCHAR(512),
    "fecha" DATE,
    "usuario_id" UUID,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "seguimientos_caso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediaciones" (
    "id" SERIAL NOT NULL,
    "caso_id" INTEGER,
    "apoyo_solicitante_id" INTEGER,
    "contraparte_id" INTEGER,
    "apoyo_contraparte_id" INTEGER,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "mediaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participantes_caso" (
    "id" SERIAL NOT NULL,
    "caso_id" INTEGER,
    "persona_id" INTEGER,
    "org_popular_id" INTEGER,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "participantes_caso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_cgr" (
    "id" SERIAL NOT NULL,
    "caso_id" INTEGER,
    "tiene_competencia" BOOLEAN NOT NULL DEFAULT false,
    "asume_caso" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "registros_cgr_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participantes_caso_caso_id_persona_id_key" ON "participantes_caso"("caso_id", "persona_id");

-- AddForeignKey
ALTER TABLE "denuncias_caso" ADD CONSTRAINT "denuncias_caso_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordenadas_caso" ADD CONSTRAINT "coordenadas_caso_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordenadas_caso" ADD CONSTRAINT "coordenadas_caso_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remisiones_caso" ADD CONSTRAINT "remisiones_caso_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remisiones_caso" ADD CONSTRAINT "remisiones_caso_direccion_administrativa_id_fkey" FOREIGN KEY ("direccion_administrativa_id") REFERENCES "direcciones_administrativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remisiones_caso" ADD CONSTRAINT "remisiones_caso_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_caso" ADD CONSTRAINT "documentos_caso_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_caso" ADD CONSTRAINT "seguimientos_caso_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_caso" ADD CONSTRAINT "seguimientos_caso_estatus_llamada_id_fkey" FOREIGN KEY ("estatus_llamada_id") REFERENCES "estatus_llamada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_caso" ADD CONSTRAINT "seguimientos_caso_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediaciones" ADD CONSTRAINT "mediaciones_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediaciones" ADD CONSTRAINT "mediaciones_apoyo_solicitante_id_fkey" FOREIGN KEY ("apoyo_solicitante_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediaciones" ADD CONSTRAINT "mediaciones_contraparte_id_fkey" FOREIGN KEY ("contraparte_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediaciones" ADD CONSTRAINT "mediaciones_apoyo_contraparte_id_fkey" FOREIGN KEY ("apoyo_contraparte_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_caso" ADD CONSTRAINT "participantes_caso_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_caso" ADD CONSTRAINT "participantes_caso_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_caso" ADD CONSTRAINT "participantes_caso_org_popular_id_fkey" FOREIGN KEY ("org_popular_id") REFERENCES "org_poder_popular"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_cgr" ADD CONSTRAINT "registros_cgr_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;
