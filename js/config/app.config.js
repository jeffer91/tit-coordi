/*
  Archivo: app.config.js
  Ruta: /js/config/app.config.js
  Funciones principales:
  - Centralizar la configuración pública de Google Sheets, Supabase y Firebase.
  - Definir nombres de acciones, tablas y colecciones usadas por Tit Coordi.
  - Permitir que la app funcione con prioridad Google Sheets, Supabase y Firebase.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};

  window.TitCoordi.Config = Object.freeze({
    app: Object.freeze({
      nombre: 'Tit Coordi',
      version: '0.1.0-bloque-3',
      modo: 'coordinador-web',
      permitirDatosDemo: false
    }),

    googleSheets: Object.freeze({
      activo: true,
      webAppUrl: '',
      token: '',
      acciones: Object.freeze({
        listarCoordinadores: 'listarCoordinadoresActivos',
        listarEstudiantes: 'listarEstudiantesCoordinador',
        guardarRevision: 'guardarRevisionCoordinador'
      })
    }),

    supabase: Object.freeze({
      activo: true,
      url: '',
      anonKey: '',
      tablas: Object.freeze({
        coordinadores: 'coordinadores',
        titulos: 'titulos',
        revisiones: 'titulos_revisiones'
      })
    }),

    firebase: Object.freeze({
      activo: true,
      sdkAppUrl: 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js',
      sdkFirestoreUrl: 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js',
      config: Object.freeze({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
      }),
      collections: Object.freeze({
        coordinadores: 'coordinadores',
        titulos: 'titulos',
        logs: 'titulos_logs'
      })
    })
  });
})(window);
