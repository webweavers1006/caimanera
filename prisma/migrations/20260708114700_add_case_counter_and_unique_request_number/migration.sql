/*
  Warnings:

  - A unique constraint covering the columns `[numero_solicitud]` on the table `casos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "contador_casos" (
    "ano" INTEGER NOT NULL,
    "ultimo_numero" INTEGER NOT NULL,

    CONSTRAINT "contador_casos_pkey" PRIMARY KEY ("ano")
);

-- CreateIndex
CREATE UNIQUE INDEX "casos_numero_solicitud_key" ON "casos"("numero_solicitud");
