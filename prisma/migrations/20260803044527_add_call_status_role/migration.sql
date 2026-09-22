-- CreateTable
CREATE TABLE "estatus_llamada_rol" (
    "estatus_llamada_id" INTEGER NOT NULL,
    "rol_id" INTEGER NOT NULL,

    CONSTRAINT "estatus_llamada_rol_pkey" PRIMARY KEY ("estatus_llamada_id","rol_id")
);

-- AddForeignKey
ALTER TABLE "estatus_llamada_rol" ADD CONSTRAINT "estatus_llamada_rol_estatus_llamada_id_fkey" FOREIGN KEY ("estatus_llamada_id") REFERENCES "estatus_llamada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estatus_llamada_rol" ADD CONSTRAINT "estatus_llamada_rol_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
