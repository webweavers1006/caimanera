-- CreateTable
CREATE TABLE "tramites" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion_administrativa_id" INTEGER,
    "recaudos" JSONB NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "tramites_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_direccion_administrativa_id_fkey" FOREIGN KEY ("direccion_administrativa_id") REFERENCES "direcciones_administrativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
