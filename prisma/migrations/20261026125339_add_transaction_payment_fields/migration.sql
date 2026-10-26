-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BDT', 'MOBILE_PAYMENT', 'BINANCE', 'CARD', 'SUBSCRIPTION_CREDIT', 'STAFF_BYPASS');

-- AlterTable
ALTER TABLE "transacciones" ADD COLUMN     "metadatos" JSONB,
ADD COLUMN     "metodo" "PaymentMethod",
ADD COLUMN     "moneda" VARCHAR(3) NOT NULL DEFAULT 'USD',
ADD COLUMN     "monto_ves" DOUBLE PRECISION;
