# BLOQUE 3 - Configuración y servicios de datos

Estado: COMPLETADO

Fecha: 2026-07-03

## Archivos creados

### Configuración

- `js/config/app.config.js`
- `js/config/constants.js`

### Estado

- `js/state/app.state.js`

### Utilidades

- `js/utils/dom.js`
- `js/utils/normalizers.js`
- `js/utils/validators.js`
- `js/utils/dates.js`

### Servicios

- `js/services/google-sheets.service.js`
- `js/services/supabase.service.js`
- `js/services/firebase.service.js`
- `js/services/data-source.service.js`
- `js/services/revision-sync.service.js`

## Lógica definida

### Consulta

1. Google Sheets primero.
2. Si falla o no está configurado, Supabase.
3. Si Supabase falla o no está configurado, Firebase.

### Guardado

1. Google Sheets es obligatorio.
2. Supabase y Firebase son respaldos.
3. Si Google Sheets guarda, la revisión queda válida.
4. Si un respaldo falla, se informa advertencia.
5. Si Google Sheets falla, la revisión no se cierra.

## Pendiente para el siguiente bloque

BLOQUE 4: crear repositorio, UI y controladores para conectar la pantalla con los servicios.
