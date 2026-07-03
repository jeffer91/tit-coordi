# Configuración de datos

Este archivo explica qué falta configurar para que Tit Coordi lea y guarde datos reales.

## Archivo principal

La configuración se realiza en:

```text
js/config/app.config.js
```

## Prioridad de consulta

La app busca datos en este orden:

1. Google Sheets
2. Supabase
3. Firebase

## Prioridad de guardado

La revisión se guarda así:

1. Google Sheets es obligatorio.
2. Supabase es respaldo.
3. Firebase es respaldo.

Si Google Sheets falla, la revisión no se cierra.

## Google Sheets

Debes colocar la URL del Web App de Apps Script:

```js
webAppUrl: 'AQUI_URL_DEL_WEB_APP'
```

El Apps Script debe responder a estas acciones:

```text
listarCoordinadoresActivos
listarEstudiantesCoordinador
guardarRevisionCoordinador
```

## Supabase

Debes colocar:

```js
url: 'AQUI_URL_SUPABASE'
anonKey: 'AQUI_ANON_KEY'
```

Tablas esperadas:

```text
coordinadores
titulos
titulos_revisiones
```

## Firebase

Debes colocar la configuración web de Firebase:

```js
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

Colecciones esperadas:

```text
coordinadores
titulos
titulos_logs
```

## Estado actual

La estructura y lógica ya están listas. La app abrirá en navegador, pero no cargará datos reales hasta completar esta configuración.
