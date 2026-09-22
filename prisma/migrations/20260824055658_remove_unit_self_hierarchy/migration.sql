/*
  Warnings:

  - You are about to drop the column `unidad_padre_id` on the `unidades_organizativas` table. All the data in the column will be lost.

  Sub-units are converted into departments before the column is dropped.
  This block runs identically in dev and production (migrate deploy).
*/

-- 1) Reserve department IDs for every active sub-unit.
CREATE TEMP TABLE _subunit_map AS
SELECT
  u."id" AS unit_id,
  u."unidad_padre_id" AS parent_unit_id,
  nextval(pg_get_serial_sequence('departamentos', 'id')) AS department_id
FROM "unidades_organizativas" u
WHERE u."unidad_padre_id" IS NOT NULL AND u."eliminado_en" IS NULL;

-- 2) Create a department per sub-unit (keeps name + leader).
INSERT INTO "departamentos" ("id", "nombre", "unidad_organizativa_id", "lider_id", "creado_en", "actualizado_en")
SELECT m.department_id, u."nombre", m.parent_unit_id, u."lider_id", u."creado_en", u."actualizado_en"
FROM _subunit_map m
JOIN "unidades_organizativas" u ON u."id" = m.unit_id;

-- 3) Re-parent departments that belonged to converted units onto the new
--    department (they become sub-departments of it).
UPDATE "departamentos" dep
SET "unidad_organizativa_id" = m.parent_unit_id,
    "departamento_padre_id" = m.department_id
FROM _subunit_map m
WHERE dep."unidad_organizativa_id" = m.unit_id
  AND dep."id" <> m.department_id;

-- 4) Move members of converted units into the new department, deriving
--    unit and direction from the parent unit.
UPDATE "usuarios" usr
SET "unidad_organizativa_id" = m.parent_unit_id,
    "departamento_id" = CASE
      WHEN usr."departamento_id" IS NULL THEN m.department_id
      ELSE usr."departamento_id"
    END,
    "direccion_administrativa_id" = (
      SELECT pu."direccion_administrativa_id"
      FROM "unidades_organizativas" pu
      WHERE pu."id" = m.parent_unit_id
    )
FROM _subunit_map m
WHERE usr."unidad_organizativa_id" = m.unit_id;

-- 5) Soft-delete the converted units (they are departments now).
UPDATE "unidades_organizativas"
SET "eliminado_en" = CURRENT_TIMESTAMP
WHERE "id" IN (SELECT unit_id FROM _subunit_map);

DROP TABLE _subunit_map;

-- DropForeignKey
ALTER TABLE "unidades_organizativas" DROP CONSTRAINT "unidades_organizativas_unidad_padre_id_fkey";

-- AlterTable
ALTER TABLE "unidades_organizativas" DROP COLUMN "unidad_padre_id";
