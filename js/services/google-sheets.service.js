/*
  Archivo: google-sheets.service.js
  Ruta: /js/services/google-sheets.service.js
  Funciones principales:
  - Consultar coordinadores y estudiantes desde Google Sheets como base principal.
  - Guardar la revisión principal en Google Sheets.
  - Usar un Web App de Apps Script como puente seguro entre la app y la hoja.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Services = window.TitCoordi.Services || {};

  var config = window.TitCoordi.Config;
  var normalizers = window.TitCoordi.Utils && window.TitCoordi.Utils.normalizers;

  function configurado() {
    return Boolean(config && config.googleSheets && config.googleSheets.webAppUrl);
  }

  function post(action, payload) {
    if (!configurado()) {
      return Promise.reject(new Error('Google Sheets no está configurado. Falta webAppUrl en app.config.js.'));
    }

    var body = Object.assign({}, payload || {}, {
      action: action,
      token: config.googleSheets.token || ''
    });

    return fetch(config.googleSheets.webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(body)
    }).then(parseResponse);
  }

  function parseResponse(response) {
    if (!response.ok) {
      throw new Error('Google Sheets respondió con error HTTP ' + response.status + '.');
    }

    return response.text().then(function (text) {
      var data = text ? JSON.parse(text) : {};
      if (data.ok === false) throw new Error(data.mensaje || data.error || 'Google Sheets devolvió error.');
      return data;
    });
  }

  function listarCoordinadoresActivos() {
    return post(config.googleSheets.acciones.listarCoordinadores, {})
      .then(function (data) {
        var rows = data.coordinadores || data.data || data.rows || [];
        return rows.map(normalizers.normalizarCoordinador).filter(function (coordinador) {
          return coordinador.activo;
        });
      });
  }

  function listarEstudiantesCoordinador(coordinador) {
    return post(config.googleSheets.acciones.listarEstudiantes, {
      coordinadorId: coordinador && coordinador.id,
      coordinadorNombre: coordinador && coordinador.nombre,
      carreras: coordinador && coordinador.carreras
    }).then(function (data) {
      var rows = data.estudiantes || data.data || data.rows || [];
      return rows.map(normalizers.normalizarEstudiante);
    });
  }

  function guardarRevision(revision) {
    return post(config.googleSheets.acciones.guardarRevision, {
      revision: revision
    }).then(function (data) {
      return {
        ok: true,
        fuente: 'GOOGLE_SHEETS',
        data: data
      };
    });
  }

  window.TitCoordi.Services.GoogleSheets = Object.freeze({
    configurado: configurado,
    listarCoordinadoresActivos: listarCoordinadoresActivos,
    listarEstudiantesCoordinador: listarEstudiantesCoordinador,
    guardarRevision: guardarRevision
  });
})(window);
