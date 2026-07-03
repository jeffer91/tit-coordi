# Revisión exhaustiva de flujos y subprocesos

Fecha: 2026-07-03

## Objetivo

Revisar el flujo completo de Tit Coordi después de los cinco bloques de construcción y de la primera verificación técnica.

Esta revisión se enfocó en cada subproceso:

1. Inicio de la app.
2. Carga de coordinadores.
3. Selección de coordinador.
4. Consulta de estudiantes.
5. Menú Pendientes, Aprobados y Devueltos.
6. Modal Ver más.
7. Selección de título definitivo.
8. Edición con lapicito.
9. Aprobación normal.
10. Aprobación con correcciones.
11. Devolución.
12. Bloqueo de revisiones ya guardadas.
13. Sincronización con Google Sheets, Supabase y Firebase.
14. Normalización de columnas.

## Resultado general

El flujo principal quedó correcto después de aplicar ajustes.

La app mantiene:

- Google Sheets como base principal.
- Supabase como segunda fuente/respaldo.
- Firebase como tercera fuente/respaldo.
- Revisión bloqueada después de guardar.
- Aprobación con correcciones obligatoria si hubo edición.
- Observación obligatoria para devolución y aprobación con correcciones.

## Correcciones aplicadas en esta revisión

### 1. Selección de título con confirmación

Se ajustó el flujo para que, al seleccionar un título como definitivo, el sistema pida confirmación.

Archivo corregido:

```text
js/controllers/revision.controller.js
```

### 2. Edición obliga a usar Aprobar con correcciones

Antes, si el coordinador editaba un título y luego presionaba Aprobar normal, podía guardar como APROBADO.

Ahora, si hay títulos editados, el botón Aprobar normal muestra error y obliga a usar Aprobar con correcciones.

Archivo corregido:

```text
js/controllers/revision.controller.js
```

### 3. Observación validada antes de confirmar

Para devolución y aprobación con correcciones, la observación global se valida antes de pedir confirmación final.

Archivo corregido:

```text
js/controllers/revision.controller.js
```

### 4. Revisión guardada queda bloqueada

Antes, desde Aprobados o Devueltos se podía abrir Ver más y los botones seguían disponibles.

Ahora los registros ya revisados se muestran en modo solo lectura.

Archivos corregidos:

```text
js/ui/modal.ui.js
js/controllers/revision.controller.js
```

### 5. Supabase filtra por carrera

Antes, Supabase intentaba filtrar estudiantes por `coordinadorNombre`. Eso podía fallar si la tabla no tenía esa columna o si el nombre no coincidía exactamente.

Ahora Supabase trae los títulos y filtra por carrera asignada al coordinador.

Archivo corregido:

```text
js/services/supabase.service.js
```

### 6. Coordinadores activos más robustos

Antes, si Google Sheets enviaba `activo` como texto, por ejemplo NO, FALSE, FALSO o 0, podía interpretarse como activo.

Ahora esos valores se interpretan correctamente como inactivos.

Archivo corregido:

```text
js/utils/normalizers.js
```

## Revisión por subproceso

### Subproceso 1: Inicio de la app

Estado: correcto.

Flujo:

1. Abre `index.html`.
2. Carga CSS.
3. Carga scripts en orden.
4. Ejecuta `js/app.js`.
5. Inicia menú, revisión y coordinador.

### Subproceso 2: Carga de coordinadores

Estado: correcto.

Flujo:

1. Intenta Google Sheets.
2. Si falla o no trae coordinadores, intenta Supabase.
3. Si falla o no trae coordinadores, intenta Firebase.
4. Normaliza coordinadores.
5. Muestra solo coordinadores activos.

### Subproceso 3: Selección de coordinador

Estado: correcto.

Flujo:

1. El usuario selecciona un coordinador.
2. Se valida que exista y esté activo.
3. Se guarda como coordinador activo en estado global.
4. Se cargan estudiantes asignados.

### Subproceso 4: Consulta de estudiantes

Estado: correcto.

Flujo:

1. Intenta Google Sheets.
2. Si falla o responde vacío, intenta Supabase.
3. Si falla o responde vacío, intenta Firebase.
4. Si ninguna fuente tiene estudiantes, muestra lista vacía sin error crítico.
5. Ordena por carrera y luego por nombre.

### Subproceso 5: Menú de estados

Estado: correcto.

Flujo:

- Pendientes muestra solo no revisados.
- Aprobados muestra APROBADO y APROBADO_CON_CORRECCIONES.
- Devueltos muestra DEVUELTO.
- Aprobados muestra etiqueta de estado.

### Subproceso 6: Modal Ver más

Estado: correcto.

Flujo:

1. Abre datos del estudiante.
2. Muestra carrera y títulos.
3. Si está pendiente, muestra acciones.
4. Si ya está revisado, muestra solo lectura.

### Subproceso 7: Selección de título definitivo

Estado: correcto.

Flujo:

1. Coordinador presiona Seleccionar este título.
2. Sistema pide confirmación.
3. Marca el título como definitivo.

### Subproceso 8: Edición con lapicito

Estado: correcto.

Flujo:

1. Coordinador presiona Editar.
2. Se abre textarea.
3. Se guarda borrador local mientras escribe.
4. Si cambia el texto, queda marcado como editado.
5. Puede volver al original.

### Subproceso 9: Aprobar normal

Estado: correcto.

Reglas:

- Requiere título seleccionado.
- No permite guardar si hubo edición.
- Pide confirmación antes de guardar.

### Subproceso 10: Aprobar con correcciones

Estado: correcto.

Reglas:

- Requiere al menos un título editado.
- Requiere observación global.
- Requiere título seleccionado.
- Guarda original y corregido.

### Subproceso 11: Devolver

Estado: correcto.

Reglas:

- No requiere título seleccionado.
- Devuelve los tres títulos.
- Requiere observación global.
- Pide confirmación antes de guardar.

### Subproceso 12: Guardado y sincronización

Estado: correcto.

Flujo:

1. Guarda primero en Google Sheets.
2. Si Google Sheets falla, no cierra revisión.
3. Si Google Sheets guarda, la revisión es válida.
4. Luego intenta respaldar en Supabase y Firebase.
5. Si un respaldo falla, muestra advertencia.

### Subproceso 13: Desaparición de Pendientes

Estado: correcto.

Después de guardar:

1. Cambia estado local del estudiante.
2. Refresca tarjetas.
3. Refresca tabla.
4. Si estaba en Pendientes, desaparece de esa vista.

### Subproceso 14: Revisión ya guardada

Estado: corregido.

Regla final:

Una revisión guardada no puede cambiarse desde coordinador.

## Conclusión

La revisión exhaustiva de flujo quedó completada.

El frontend está listo para continuar con la configuración real de datos.

Pendiente externo al frontend:

```text
js/config/app.config.js
Apps Script de Google Sheets
Supabase real
Firebase real
```
