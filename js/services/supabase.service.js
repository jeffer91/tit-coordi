/*
  Archivo: supabase.service.js
  Ruta: /js/services/supabase.service.js
  Funciones principales:
  - Consultar datos desde Supabase si Google Sheets falla.
  - Filtrar estudiantes por carreras asignadas al coordinador.
  - Guardar respaldo de revisiones en Supabase.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Services = window.TitCoordi.Services || {};

  var config = window.TitCoordi.Config;
  var normalizers = window.TitCoordi.Utils && window.TitCoordi.Utils.normalizers;

  function configurado() {
    return Boolean(config && config.supabase && config.supabase.url && config.supabase.anonKey);
  }

  function request(path, options) {
    if (!configurado()) return Promise.reject(new Error('Supabase no está configurado.'));

    var opts = options || {};
    var headers = Object.assign({
      apikey: config.supabase.anonKey,
      Authorization: 'Bearer ' + config.supabase.anonKey,
      'Content-Type': 'application/json'
    }, opts.headers || {});

    return fetch(config.supabase.url.replace(/\/$/, '') + '/rest/v1/' + path, Object.assign({}, opts, { headers: headers }))
      .then(function (response) {
        if (!response.ok) throw new Error('Supabase respondió con error HTTP ' + response.status + '.');
        if (response.status === 204) return null;
        return response.json();
      });
  }

  function listarCoordinadoresActivos() {
    var table = config.supabase.tablas.coordinadores;
    return request(table + '?select=*', { method: 'GET' }).then(function (rows) {
      return (rows || []).map(normalizers.normalizarCoordinador).filter(function (coordinador) {
        return coordinador.activo;
      });
    });
  }

  function listarEstudiantesCoordinador(coordinador) {
    var table = config.supabase.tablas.titulos;

    return request(table + '?select=*', { method: 'GET' }).then(function (rows) {
      var estudiantes = (rows || []).map(normalizers.normalizarEstudiante);

      if (!coordinador || !coordinador.carreras || !coordinador.carreras.length) return estudiantes;

      return estudiantes.filter(function (estudiante) {
        return normalizers.perteneceCarrera(estudiante, coordinador);
      });
    });
  }

  function guardarRevision(revision) {
    var table = config.supabase.tablas.revisiones;
    return request(table, {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(revision)
    }).then(function (data) {
      return { ok: true, fuente: 'SUPABASE', data: data };
    });
  }

  window.TitCoordi.Services.Supabase = Object.freeze({
    configurado: configurado,
    listarCoordinadoresActivos: listarCoordinadoresActivos,
    listarEstudiantesCoordinador: listarEstudiantesCoordinador,
    guardarRevision: guardarRevision
  });
})(window);
