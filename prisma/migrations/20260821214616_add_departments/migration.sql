-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "departamento_id" INTEGER;

-- CreateTable
CREATE TABLE "departamentos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "unidad_organizativa_id" INTEGER NOT NULL,
    "departamento_padre_id" INTEGER,
    "lider_id" UUID,
    "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6),
    "eliminado_en" TIMESTAMPTZ(6),

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_unidad_organizativa_id_fkey" FOREIGN KEY ("unidad_organizativa_id") REFERENCES "unidades_organizativas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_departamento_padre_id_fkey" FOREIGN KEY ("departamento_padre_id") REFERENCES "departamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_lider_id_fkey" FOREIGN KEY ("lider_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- DataBackfill: create one default department ("General") per existing active unit
INSERT INTO "departamentos" ("nombre", "unidad_organizativa_id", "creado_en", "actualizado_en")
SELECT 'General', "id", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "unidades_organizativas"
WHERE "eliminado_en" IS NULL;

-- DataBackfill: assign each unit member to its unit's default department
UPDATE "usuarios" u
SET "departamento_id" = d."id"
FROM "departamentos" d
WHERE d."unidad_organizativa_id" = u."unidad_organizativa_id"
  AND u."departamento_id" IS NULL;
