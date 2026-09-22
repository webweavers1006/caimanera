-- CreateTable
CREATE TABLE "paises" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(48) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "paises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estatus_caso" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(48) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "estatus_caso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estatus_llamada" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(48) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "estatus_llamada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redes_sociales" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(48) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "redes_sociales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entes_adscritos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "entes_adscritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_poder_popular" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "org_poder_popular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_beneficiario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "requiere_cedula" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "tipos_beneficiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas_caso" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(48) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "areas_caso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motivos" (
    "id" SERIAL NOT NULL,
    "area_caso_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "motivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_atencion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "mostrar_area_caso" BOOLEAN NOT NULL DEFAULT false,
    "mostrar_participantes" BOOLEAN NOT NULL DEFAULT false,
    "enviar_correo" BOOLEAN NOT NULL DEFAULT false,
    "mostrar_org_popular" BOOLEAN NOT NULL DEFAULT false,
    "mostrar_coordenadas" BOOLEAN NOT NULL DEFAULT false,
    "mostrar_punto_cuenta" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "tipos_atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_atencion_detalle" (
    "id" SERIAL NOT NULL,
    "tipo_atencion_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "tipos_atencion_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones_administrativas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT,
    "es_auditoria" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "direcciones_administrativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oficinas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(48) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "oficinas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "motivos" ADD CONSTRAINT "motivos_area_caso_id_fkey" FOREIGN KEY ("area_caso_id") REFERENCES "areas_caso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_atencion_detalle" ADD CONSTRAINT "tipos_atencion_detalle_tipo_atencion_id_fkey" FOREIGN KEY ("tipo_atencion_id") REFERENCES "tipos_atencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
