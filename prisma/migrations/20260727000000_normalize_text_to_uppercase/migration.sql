-- ============================================================================
-- Normalización de texto a MAYÚSCULAS
-- Fecha: 2026-07-26
-- 
-- Estandariza todos los campos de texto descriptivo (nombres, direcciones,
-- motivos, estatus, etc.) a UPPERCASE en la base de datos.
--
-- Los campos técnicos (emails, slugs, códigos, cédulas, teléfonos, rutas
-- de archivo, etc.) NO se modifican.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. USUARIOS Y ROLES
-- ---------------------------------------------------------------------------

UPDATE usuarios
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE usuarios
SET apellido = UPPER(apellido)
WHERE apellido IS NOT NULL AND apellido != '';

UPDATE roles
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE roles
SET descripcion = UPPER(descripcion)
WHERE descripcion IS NOT NULL AND descripcion != '';

UPDATE permisos
SET descripcion = UPPER(descripcion)
WHERE descripcion IS NOT NULL AND descripcion != '';

-- ---------------------------------------------------------------------------
-- 2. CATÁLOGOS BASE
-- ---------------------------------------------------------------------------

UPDATE paises
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE estatus_caso
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE estatus_llamada
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE canales_atencion
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE entes_adscritos
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE org_poder_popular
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE tipos_beneficiario
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE areas_caso
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE motivos
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE tipos_atencion
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE tipos_atencion
SET plantilla_descripcion = UPPER(plantilla_descripcion)
WHERE plantilla_descripcion IS NOT NULL AND plantilla_descripcion != '';

UPDATE tipos_atencion_detalle
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE direcciones_administrativas
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE unidades_organizativas
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE tramites
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

-- ---------------------------------------------------------------------------
-- 3. GEOGRAFÍA
-- ---------------------------------------------------------------------------

UPDATE estados
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE municipios
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE parroquias
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

-- ---------------------------------------------------------------------------
-- 4. OFICINAS
-- ---------------------------------------------------------------------------

UPDATE oficinas
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE oficinas
SET direccion = UPPER(direccion)
WHERE direccion IS NOT NULL AND direccion != '';

UPDATE oficinas
SET nombre_jefe = UPPER(nombre_jefe)
WHERE nombre_jefe IS NOT NULL AND nombre_jefe != '';

UPDATE oficinas
SET observacion = UPPER(observacion)
WHERE observacion IS NOT NULL AND observacion != '';

-- ---------------------------------------------------------------------------
-- 5. PERSONAS
-- ---------------------------------------------------------------------------

UPDATE personas
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE personas
SET apellido = UPPER(apellido)
WHERE apellido IS NOT NULL AND apellido != '';

UPDATE personas
SET direccion = UPPER(direccion)
WHERE direccion IS NOT NULL AND direccion != '';

UPDATE personas
SET profesion = UPPER(profesion)
WHERE profesion IS NOT NULL AND profesion != '';

UPDATE personas
SET info_legal = UPPER(info_legal)
WHERE info_legal IS NOT NULL AND info_legal != '';

-- ---------------------------------------------------------------------------
-- 6. CASOS
-- ---------------------------------------------------------------------------

UPDATE casos
SET descripcion = UPPER(descripcion)
WHERE descripcion IS NOT NULL AND descripcion != '';

-- ---------------------------------------------------------------------------
-- 7. HIJOS DE CASO
-- ---------------------------------------------------------------------------

UPDATE denuncias_caso
SET involucrados = UPPER(involucrados)
WHERE involucrados IS NOT NULL AND involucrados != '';

UPDATE denuncias_caso
SET instancia_popular = UPPER(instancia_popular)
WHERE instancia_popular IS NOT NULL AND instancia_popular != '';

UPDATE denuncias_caso
SET rif_instancia = UPPER(rif_instancia)
WHERE rif_instancia IS NOT NULL AND rif_instancia != '';

UPDATE denuncias_caso
SET ente_financiador = UPPER(ente_financiador)
WHERE ente_financiador IS NOT NULL AND ente_financiador != '';

UPDATE denuncias_caso
SET nombre_proyecto = UPPER(nombre_proyecto)
WHERE nombre_proyecto IS NOT NULL AND nombre_proyecto != '';

UPDATE denuncias_caso
SET monto_aprobado = UPPER(monto_aprobado)
WHERE monto_aprobado IS NOT NULL AND monto_aprobado != '';

UPDATE coordenadas_caso
SET nombre = UPPER(nombre)
WHERE nombre IS NOT NULL AND nombre != '';

UPDATE remisiones_caso
SET descripcion = UPPER(descripcion)
WHERE descripcion IS NOT NULL AND descripcion != '';

UPDATE documentos_caso
SET descripcion = UPPER(descripcion)
WHERE descripcion IS NOT NULL AND descripcion != '';

UPDATE seguimientos_caso
SET comentario = UPPER(comentario)
WHERE comentario IS NOT NULL AND comentario != '';

-- ---------------------------------------------------------------------------
-- 8. NOTIFICACIONES Y AUDITORÍA
-- ---------------------------------------------------------------------------

UPDATE notificaciones
SET mensaje = UPPER(mensaje)
WHERE mensaje IS NOT NULL AND mensaje != '';

UPDATE auditoria
SET accion = UPPER(accion)
WHERE accion IS NOT NULL AND accion != '';

-- ---------------------------------------------------------------------------
-- 9. CORREOS Y TURNOS
-- ---------------------------------------------------------------------------

UPDATE correos_enviados
SET motivo = UPPER(motivo)
WHERE motivo IS NOT NULL AND motivo != '';

UPDATE turnos
SET notas = UPPER(notas)
WHERE notas IS NOT NULL AND notas != '';

COMMIT;
