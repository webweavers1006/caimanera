-- AlterTable
ALTER TABLE "oficinas" ADD COLUMN     "identificaciones" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificacion" BOOLEAN NOT NULL DEFAULT false;
