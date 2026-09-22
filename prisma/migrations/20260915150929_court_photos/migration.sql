-- CreateTable
CREATE TABLE "fotos_cancha" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cancha_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "fotos_cancha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fotos_cancha_cancha_id_orden_idx" ON "fotos_cancha"("cancha_id", "orden");

-- AddForeignKey
ALTER TABLE "fotos_cancha" ADD CONSTRAINT "fotos_cancha_cancha_id_fkey" FOREIGN KEY ("cancha_id") REFERENCES "canchas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
