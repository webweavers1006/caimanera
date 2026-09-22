-- CreateTable
CREATE TABLE "tipos_entrega_tipos_documento" (
    "tipo_entrega_id" INTEGER NOT NULL,
    "tipo_documento_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),

    CONSTRAINT "tipos_entrega_tipos_documento_pkey" PRIMARY KEY ("tipo_entrega_id","tipo_documento_id")
);

-- AddForeignKey
ALTER TABLE "tipos_entrega_tipos_documento" ADD CONSTRAINT "tipos_entrega_tipos_documento_tipo_entrega_id_fkey" FOREIGN KEY ("tipo_entrega_id") REFERENCES "tipos_entrega"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_entrega_tipos_documento" ADD CONSTRAINT "tipos_entrega_tipos_documento_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipos_documento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
