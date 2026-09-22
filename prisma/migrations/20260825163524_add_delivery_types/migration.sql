-- AlterTable
ALTER TABLE "entregas_documentos" ADD COLUMN     "tipo_entrega_id" INTEGER;

-- CreateTable
CREATE TABLE "tipos_entrega" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "tipos_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_entrega_nombre_key" ON "tipos_entrega"("nombre");

-- AddForeignKey
ALTER TABLE "entregas_documentos" ADD CONSTRAINT "entregas_documentos_tipo_entrega_id_fkey" FOREIGN KEY ("tipo_entrega_id") REFERENCES "tipos_entrega"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
