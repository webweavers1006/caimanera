-- CreateTable
CREATE TABLE "correos_enviados" (
    "id" SERIAL NOT NULL,
    "destinatario" VARCHAR(255) NOT NULL,
    "asunto" VARCHAR(255) NOT NULL,
    "motivo" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "caso_id" INTEGER,
    "usuario_id" UUID,
    "mensaje_error" TEXT,
    "enviado_en" TIMESTAMPTZ(6),
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),

    CONSTRAINT "correos_enviados_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "correos_enviados" ADD CONSTRAINT "correos_enviados_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correos_enviados" ADD CONSTRAINT "correos_enviados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
