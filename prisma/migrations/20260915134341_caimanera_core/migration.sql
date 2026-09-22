-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PAY_PER_MATCH', 'SUBSCRIPTION_CREDIT');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC_PASS', 'PRO_MONTHLY', 'VIP_ANNUAL');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('OPEN', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('CONFIRMED', 'WAITLIST');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "confiabilidad" SMALLINT,
ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ADD COLUMN     "nivel_habilidad" SMALLINT;

-- CreateTable
CREATE TABLE "canchas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "deporte" VARCHAR(100) NOT NULL,
    "direccion" TEXT,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "tarifa_hora" DOUBLE PRECISION,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "encargado_id" UUID,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "canchas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titulo" VARCHAR(255) NOT NULL,
    "deporte" VARCHAR(100) NOT NULL,
    "programado_para" TIMESTAMPTZ(6) NOT NULL,
    "duracion_min" INTEGER NOT NULL DEFAULT 60,
    "cupos" INTEGER NOT NULL,
    "precio_por_cupo" DOUBLE PRECISION NOT NULL,
    "permite_suscripcion" BOOLEAN NOT NULL DEFAULT true,
    "estado" "MatchStatus" NOT NULL DEFAULT 'OPEN',
    "organizador_id" UUID NOT NULL,
    "cancha_id" UUID NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "partidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participantes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "partido_id" UUID NOT NULL,
    "estado" "ParticipantStatus" NOT NULL DEFAULT 'WAITLIST',
    "posicion" VARCHAR(50),
    "tipo_pago" "PaymentType" NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),

    CONSTRAINT "participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes_suscripcion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(255) NOT NULL,
    "nivel" "SubscriptionTier" NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "partidos_incluidos" INTEGER NOT NULL,
    "reserva_prioritaria" BOOLEAN NOT NULL DEFAULT true,
    "descripcion" TEXT,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "planes_suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suscripciones_usuario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "fecha_inicio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMPTZ(6) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "partidos_restantes" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "suscripciones_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "partido_id" UUID,
    "monto" DOUBLE PRECISION NOT NULL,
    "tipo" "PaymentType" NOT NULL,
    "estado" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "referencia" VARCHAR(255),
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partidos_cancha_id_programado_para_idx" ON "partidos"("cancha_id", "programado_para");

-- CreateIndex
CREATE INDEX "partidos_estado_programado_para_idx" ON "partidos"("estado", "programado_para");

-- CreateIndex
CREATE INDEX "participantes_partido_id_idx" ON "participantes"("partido_id");

-- CreateIndex
CREATE UNIQUE INDEX "participantes_usuario_id_partido_id_key" ON "participantes"("usuario_id", "partido_id");

-- CreateIndex
CREATE INDEX "suscripciones_usuario_usuario_id_activo_idx" ON "suscripciones_usuario"("usuario_id", "activo");

-- CreateIndex
CREATE INDEX "transacciones_usuario_id_idx" ON "transacciones"("usuario_id");

-- AddForeignKey
ALTER TABLE "canchas" ADD CONSTRAINT "canchas_encargado_id_fkey" FOREIGN KEY ("encargado_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_organizador_id_fkey" FOREIGN KEY ("organizador_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_cancha_id_fkey" FOREIGN KEY ("cancha_id") REFERENCES "canchas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participantes" ADD CONSTRAINT "participantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes" ADD CONSTRAINT "participantes_partido_id_fkey" FOREIGN KEY ("partido_id") REFERENCES "partidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones_usuario" ADD CONSTRAINT "suscripciones_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones_usuario" ADD CONSTRAINT "suscripciones_usuario_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes_suscripcion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
