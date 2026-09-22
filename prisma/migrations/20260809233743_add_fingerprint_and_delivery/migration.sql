-- CreateTable
CREATE TABLE "plantillas_huellas" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "imagen_huella" BYTEA,
    "formato_imagen" VARCHAR(10),
    "plantilla_minucias" TEXT NOT NULL,
    "calidad" INTEGER,
    "posicion_dedo" VARCHAR(20),
    "serial_dispositivo" VARCHAR(50),
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "plantillas_huellas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas_documentos" (
    "id" SERIAL NOT NULL,
    "numero_entrega" TEXT NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "caso_id" INTEGER,
    "tipo_documento" VARCHAR(100) NOT NULL,
    "detalle_documento" VARCHAR(255),
    "huella_id" INTEGER,
    "porcentaje_coincidencia" DECIMAL(5,2),
    "hash_verificacion" VARCHAR(64) NOT NULL,
    "operador_id" UUID NOT NULL,
    "ruta_pdf" VARCHAR(500),
    "entregado_en" TIMESTAMPTZ(6) NOT NULL,
    "oficina_id" INTEGER,
    "observaciones" TEXT,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "entregas_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contador_entregas" (
    "ano" INTEGER NOT NULL,
    "ultimo_numero" INTEGER NOT NULL,

    CONSTRAINT "contador_entregas_pkey" PRIMARY KEY ("ano")
);

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_huellas_persona_id_key" ON "plantillas_huellas"("persona_id");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_documentos_numero_entrega_key" ON "entregas_documentos"("numero_entrega");

-- AddForeignKey
ALTER TABLE "plantillas_huellas" ADD CONSTRAINT "plantillas_huellas_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entregas_documentos" ADD CONSTRAINT "entregas_documentos_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entregas_documentos" ADD CONSTRAINT "entregas_documentos_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entregas_documentos" ADD CONSTRAINT "entregas_documentos_huella_id_fkey" FOREIGN KEY ("huella_id") REFERENCES "plantillas_huellas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entregas_documentos" ADD CONSTRAINT "entregas_documentos_operador_id_fkey" FOREIGN KEY ("operador_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entregas_documentos" ADD CONSTRAINT "entregas_documentos_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
