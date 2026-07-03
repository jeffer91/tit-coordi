/*
  Archivo: revision-sync.service.js
  Ruta: /js/services/revision-sync.service.js
  Funciones principales:
  - Guardar la revisión primero en Google Sheets como base principal.
  - Respaldar la misma revisión en Supabase y Firebase.
  - Devolver advertencias si los respaldos fallan sin anular el guardado principal.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Services = window.TitCoordi.Services || {};

  var services = window.TitCoordi.Services;
  var constants = window.TitCoordi.Constants || {};
  var FUENTES = constants.FUENTES || {};

  function guardarRevision(revision) {
    if (!services.GoogleSheets || !services.GoogleSheets.configurado || !services.GoogleSheets.configurado()) {
      return Promise.reject(new Error('Google Sheets no está configurado. No se puede cerrar la revisión.'));
    }

    return services.GoogleSheets.guardarRevision(revision)
      .then(function (principal) {
        return respaldar(revision).then(function (respaldos) {
          var advertencias = respaldos.filter(function (item) { return !item.ok; });

          return {
            ok: true,
            fuentePrincipal: FUENTES.googleSheets || 'GOOGLE_SHEETS',
            principal: principal,
            respaldos: respaldos,
            respaldoCompleto: advertencias.length === 0,
            advertencias: advertencias
          };
        });
      });
  }

  function respaldar(revision) {
    var tareas = [];

    tareas.push(respaldarEn('SUPABASE', services.Supabase, revision));
    tareas.push(respaldarEn('FIREBASE', services.Firebase, revision));

    return Promise.all(tareas);
  }

  function respaldarEn(nombre, service, revision) {
    if (!service || typeof service.guardarRevision !== 'function') {
      return Promise.resolve({ ok: false, fuente: nombre, mensaje: 'Servicio no disponible.' });
    }

    if (typeof service.configurado === 'function' && !service.configurado()) {
      return Promise.resolve({ ok: false, fuente: nombre, mensaje: 'Servicio no configurado.' });
    }

    return service.guardarRevision(revision)
      .then(function (resultado) {
        return Object.assign({ ok: true, fuente: nombre }, resultado || {});
      })
      .catch(function (error) {
        return {
          ok: false,
          fuente: nombre,
          mensaje: error && error.message ? error.message : String(error || 'Error desconocido')
        };
      });
  }

  window.TitCoordi.Services.RevisionSync = Object.freeze({
    guardarRevision: guardarRevision,
    respaldar: respaldar
  });
})(window);
