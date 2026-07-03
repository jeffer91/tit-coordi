/*
  Archivo: firebase.service.js
  Ruta: /js/services/firebase.service.js
  Funciones principales:
  - Usar Firebase como tercera fuente de consulta.
  - Guardar respaldos finales si Google Sheets y Supabase lo requieren.
  - Cargar Firebase SDK solo cuando exista configuración válida.
*/
(function (window, document) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Services = window.TitCoordi.Services || {};

  var config = window.TitCoordi.Config;
  var normalizers = window.TitCoordi.Utils && window.TitCoordi.Utils.normalizers;
  var app = null;
  var db = null;
  var iniciado = false;

  function configurado() {
    var firebaseConfig = config && config.firebase && config.firebase.config;
    return Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
  }

  function iniciar() {
    if (iniciado && db) return Promise.resolve(db);
    if (!configurado()) return Promise.reject(new Error('Firebase no está configurado.'));

    return cargarScript(config.firebase.sdkAppUrl, 'tit-coordi-firebase-app')
      .then(function () {
        return cargarScript(config.firebase.sdkFirestoreUrl, 'tit-coordi-firebase-firestore');
      })
      .then(function () {
        if (!window.firebase.apps.length) {
          app = window.firebase.initializeApp(config.firebase.config);
        } else {
          app = window.firebase.app();
        }

        db = window.firebase.firestore();
        iniciado = true;
        return db;
      });
  }

  function cargarScript(src, id) {
    return new Promise(function (resolve, reject) {
      var existente = document.getElementById(id);
      if (existente && existente.dataset.loaded === 'true') return resolve();
      if (existente) {
        existente.addEventListener('load', resolve, { once: true });
        existente.addEventListener('error', reject, { once: true });
        return;
      }

      var script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = false;
      script.onload = function () {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = function () {
        reject(new Error('No se pudo cargar Firebase SDK.'));
      };
      document.head.appendChild(script);
    });
  }

  function listarColeccion(collectionName) {
    return iniciar().then(function (database) {
      return database.collection(collectionName).get().then(function (snapshot) {
        var rows = [];
        snapshot.forEach(function (doc) {
          rows.push(Object.assign({}, doc.data() || {}, { id: doc.id }));
        });
        return rows;
      });
    });
  }

  function listarCoordinadoresActivos() {
    return listarColeccion(config.firebase.collections.coordinadores).then(function (rows) {
      return rows.map(normalizers.normalizarCoordinador).filter(function (coordinador) {
        return coordinador.activo;
      });
    });
  }

  function listarEstudiantesCoordinador(coordinador) {
    return listarColeccion(config.firebase.collections.titulos).then(function (rows) {
      var estudiantes = rows.map(normalizers.normalizarEstudiante);
      if (!coordinador || !coordinador.carreras || !coordinador.carreras.length) return estudiantes;
      return estudiantes.filter(function (estudiante) {
        return normalizers.perteneceCarrera(estudiante, coordinador);
      });
    });
  }

  function guardarRevision(revision) {
    return iniciar().then(function (database) {
      var id = revision.id || revision.revisionId || String(Date.now());
      return database.collection(config.firebase.collections.logs).doc(id).set(Object.assign({}, revision, {
        respaldoFirebaseEn: window.firebase.firestore.FieldValue.serverTimestamp()
      }), { merge: true }).then(function () {
        return {
          ok: true,
          fuente: 'FIREBASE',
          id: id
        };
      });
    });
  }

  window.TitCoordi.Services.Firebase = Object.freeze({
    configurado: configurado,
    iniciar: iniciar,
    listarCoordinadoresActivos: listarCoordinadoresActivos,
    listarEstudiantesCoordinador: listarEstudiantesCoordinador,
    guardarRevision: guardarRevision
  });
})(window, document);
