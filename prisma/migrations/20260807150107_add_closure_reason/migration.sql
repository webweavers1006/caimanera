-- AlterTable
ALTER TABLE "estatus_llamada" ADD COLUMN     "motivo_cierre_id" INTEGER;

-- AlterTable
ALTER TABLE "seguimientos_caso" ADD COLUMN     "motivo_cierre_id" INTEGER;

-- CreateTable
CREATE TABLE "motivos_cierre" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "motivos_cierre_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "estatus_llamada" ADD CONSTRAINT "estatus_llamada_motivo_cierre_id_fkey" FOREIGN KEY ("motivo_cierre_id") REFERENCES "motivos_cierre"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seguimientos_caso" ADD CONSTRAINT "seguimientos_caso_motivo_cierre_id_fkey" FOREIGN KEY ("motivo_cierre_id") REFERENCES "motivos_cierre"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
