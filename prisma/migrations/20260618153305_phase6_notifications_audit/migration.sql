-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "caso_id" INTEGER,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'REMISION',
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "usuario_destino_id" UUID,
    "usuario_accion_id" UUID,
    "rol_accion_id" INTEGER,
    "caso_autor_id" UUID,
    "direccion_origen_id" INTEGER,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" VARCHAR(11),
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_caso_id_fkey" FOREIGN KEY ("caso_id") REFERENCES "casos"("id_caso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_destino_id_fkey" FOREIGN KEY ("usuario_destino_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_accion_id_fkey" FOREIGN KEY ("usuario_accion_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_rol_accion_id_fkey" FOREIGN KEY ("rol_accion_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_caso_autor_id_fkey" FOREIGN KEY ("caso_autor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_direccion_origen_id_fkey" FOREIGN KEY ("direccion_origen_id") REFERENCES "direcciones_administrativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
