-- CreateTable
CREATE TABLE "personas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "apellido" VARCHAR(255),
    "cedula" VARCHAR(20),
    "telefono" VARCHAR(20),
    "correo" TEXT,
    "direccion" TEXT,
    "nacionalidad" CHAR(1),
    "sexo" CHAR(1),
    "edad" INTEGER,
    "fecha_nacimiento" DATE,
    "profesion" TEXT,
    "tipo_persona" VARCHAR(20),
    "info_legal" TEXT,
    "pais_id" INTEGER,
    "estado_id" INTEGER,
    "municipio_id" INTEGER,
    "parroquia_id" INTEGER,
    "tipo_beneficiario_id" INTEGER,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_pais_id_fkey" FOREIGN KEY ("pais_id") REFERENCES "paises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_parroquia_id_fkey" FOREIGN KEY ("parroquia_id") REFERENCES "parroquias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_tipo_beneficiario_id_fkey" FOREIGN KEY ("tipo_beneficiario_id") REFERENCES "tipos_beneficiario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
