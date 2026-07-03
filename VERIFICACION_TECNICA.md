# Verificación técnica

Fecha: 2026-07-03

## Estado general

La app `tit-coordi` fue revisada en GitHub después de completar los cinco bloques principales.

## Verificado

- Estructura modular creada.
- `index.html` carga los scripts en orden correcto.
- `js/app.js` inicializa menú, revisión y coordinador.
- La app no contiene ramas de estudiante ni administrador.
- Los estados principales están definidos:
  - PENDIENTE
  - APROBADO
  - APROBADO_CON_CORRECCIONES
  - DEVUELTO
- El guardado respeta Google Sheets como base principal.
- Supabase y Firebase quedan como respaldos.
- La tabla de Aprobados muestra estado.
- La tabla de Pendientes y Devueltos se mantiene simple.
- El modal permite seleccionar, editar y restaurar títulos.
- La observación es obligatoria para devolver y aprobar con correcciones.

## Correcciones aplicadas durante la verificación

### 1. Fallback por fuente vacía

Antes, la app cambiaba a Supabase/Firebase si Google Sheets fallaba, pero no si respondía sin datos.

Ahora, si Google Sheets responde vacío, la app intenta Supabase. Si Supabase responde vacío, intenta Firebase.

Archivo corregido:

```text
js/services/data-source.service.js
```

### 2. Estudiantes vacíos sin error final

Si ninguna fuente tiene estudiantes para el coordinador seleccionado, la app ahora permite lista vacía y muestra el mensaje correspondiente, en vez de tratarlo como error crítico.

Archivo corregido:

```text
js/services/data-source.service.js
```

### 3. Estado en tabla de Aprobados

La tabla de Aprobados ahora muestra una columna Estado con:

- Aprobado
- Aprobado con correcciones

Archivo corregido:

```text
js/ui/table.ui.js
```

### 4. Normalización flexible de columnas

La app ahora puede leer columnas aunque cambien mayúsculas, espacios o tildes.

Ejemplos aceptados:

- cedula
- Cédula
- Título 1
- titulo 1
- TITULO 1
- titulo_1

Archivo corregido:

```text
js/utils/normalizers.js
```

## Pendiente antes de producción

Falta completar datos reales en:

```text
js/config/app.config.js
```

Y crear/configurar el Apps Script de Google Sheets con estas acciones:

```text
listarCoordinadoresActivos
listarEstudiantesCoordinador
guardarRevisionCoordinador
```

## Conclusión

Frontend modular listo.

La app puede abrir en navegador, pero no cargará datos reales hasta configurar Google Sheets, Supabase y Firebase según corresponda.
