-- CreateTable
CREATE TABLE "vistas_casos" (
    "usuario_id" UUID NOT NULL,
    "caso_id" INTEGER NOT NULL,
    "visto_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vistas_casos_pkey" PRIMARY KEY ("usuario_id","caso_id")
);

-- CreateIndex
CREATE INDEX "vistas_casos_caso_id_idx" ON "vistas_casos"("caso_id");

-- AddForeignKey
ALTER TABLE "vistas_casos" ADD CONSTRAINT "vistas_casos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vistas_casos" ADD CONSTRAINT "vistas_casos_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE CASCADE ON UPDATE CASCADE;
