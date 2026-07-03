# Tit Coordi

Aplicación web independiente para revisión de títulos académicos por coordinadores.

## Objetivo

Esta app permite que un coordinador seleccione su nombre, vea únicamente los estudiantes pendientes que le corresponden y revise los títulos enviados.

## Flujo principal

1. El coordinador selecciona su nombre.
2. La app carga los pendientes asignados.
3. Se muestran tarjetas de resumen.
4. Se usa el menú: Pendientes, Aprobados y Devueltos.
5. En la tabla se muestra: cédula, estudiante, carrera y Ver más.
6. En Ver más se revisan los tres títulos enviados.
7. El coordinador selecciona un título definitivo.
8. Puede aprobar, devolver o aprobar con correcciones.

## Orden de bases de datos

La app consulta y guarda con esta prioridad:

1. Google Sheets: base principal.
2. Supabase: respaldo secundario.
3. Firebase: último respaldo.

## Estados de revisión

- PENDIENTE
- APROBADO
- APROBADO_CON_CORRECCIONES
- DEVUELTO

## Estructura modular

```text
css/
js/config/
js/state/
js/services/
js/repositories/
js/controllers/
js/ui/
js/utils/
assets/
```

## Estado de construcción

- Bloque 1: limpieza completada.
- Bloque 2: estructura visual base.
- Bloque 3: configuración, estado, utilidades y servicios de datos.
- Bloque 4: repositorio, UI y controladores.
