/*
  Archivo: data-source.service.js
  Ruta: /js/services/data-source.service.js
  Funciones principales:
  - Consultar datos respetando la prioridad Google Sheets, Supabase y Firebase.
  - Intentar la siguiente fuente si la anterior falla o responde sin datos.
  - Permitir lista vacía de estudiantes cuando ninguna fuente tiene registros.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Services = window.TitCoordi.Services || {};

  var constants = window.TitCoordi.Constants || {};
  var FUENTES = constants.FUENTES || {};
  var services = window.TitCoordi.Services;

  function intentarFuentes(nombreMetodo, args, permitirVacioFinal) {
    var errores = [];
    var orden = [
      { nombre: FUENTES.googleSheets || 'GOOGLE_SHEETS', service: services.GoogleSheets },
      { nombre: FUENTES.supabase || 'SUPABASE', service: services.Supabase },
      { nombre: FUENTES.firebase || 'FIREBASE', service: services.Firebase }
    ];

    return probarFuente(orden, 0, nombreMetodo, args || [], errores, Boolean(permitirVacioFinal));
  }

  function probarFuente(orden, index, nombreMetodo, args, errores, permitirVacioFinal) {
    var fuente = orden[index];

    if (!fuente) {
      if (permitirVacioFinal) {
        return Promise.resolve({ ok: true, fuente: FUENTES.ninguna || 'NINGUNA', data: [], advertencias: errores.slice() });
      }
      return Promise.reject(new Error('No se pudo obtener información desde ninguna fuente. ' + errores.join(' | ')));
    }

    if (!fuente.service || typeof fuente.service[nombreMetodo] !== 'function') {
      errores.push(fuente.nombre + ': servicio no disponible.');
      return probarFuente(orden, index + 1, nombreMetodo, args, errores, permitirVacioFinal);
    }

    if (typeof fuente.service.configurado === 'function' && !fuente.service.configurado()) {
      errores.push(fuente.nombre + ': no configurado.');
      return probarFuente(orden, index + 1, nombreMetodo, args, errores, permitirVacioFinal);
    }

    return fuente.service[nombreMetodo].apply(null, args).then(function (data) {
      if (estaVacio(data)) {
        errores.push(fuente.nombre + ': sin datos.');
        return probarFuente(orden, index + 1, nombreMetodo, args, errores, permitirVacioFinal);
      }

      return { ok: true, fuente: fuente.nombre, data: data, advertencias: errores.slice() };
    }).catch(function (error) {
      errores.push(fuente.nombre + ': ' + obtenerMensaje(error));
      return probarFuente(orden, index + 1, nombreMetodo, args, errores, permitirVacioFinal);
    });
  }

  function estaVacio(data) {
    if (Array.isArray(data)) return data.length === 0;
    if (!data) return true;
    if (Array.isArray(data.data)) return data.data.length === 0;
    if (Array.isArray(data.rows)) return data.rows.length === 0;
    if (Array.isArray(data.estudiantes)) return data.estudiantes.length === 0;
    if (Array.isArray(data.coordinadores)) return data.coordinadores.length === 0;
    return false;
  }

  function listarCoordinadoresActivos() {
    return intentarFuentes('listarCoordinadoresActivos', [], false);
  }

  function listarEstudiantesCoordinador(coordinador) {
    return intentarFuentes('listarEstudiantesCoordinador', [coordinador], true);
  }

  function obtenerMensaje(error) {
    return error && error.message ? error.message : String(error || 'Error desconocido');
  }

  window.TitCoordi.Services.DataSource = Object.freeze({
    listarCoordinadoresActivos: listarCoordinadoresActivos,
    listarEstudiantesCoordinador: listarEstudiantesCoordinador
  });
})(window);
