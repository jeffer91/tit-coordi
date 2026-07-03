/*
  Archivo: data-source.service.js
  Ruta: /js/services/data-source.service.js
  Funciones principales:
  - Consultar datos respetando la prioridad Google Sheets, Supabase y Firebase.
  - Entregar a la app una respuesta normalizada sin importar la fuente usada.
  - Ocultar a los controladores la complejidad de múltiples bases de datos.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Services = window.TitCoordi.Services || {};

  var constants = window.TitCoordi.Constants || {};
  var FUENTES = constants.FUENTES || {};
  var services = window.TitCoordi.Services;

  function intentarFuentes(nombreMetodo, args) {
    var errores = [];
    var orden = [
      { nombre: FUENTES.googleSheets || 'GOOGLE_SHEETS', service: services.GoogleSheets },
      { nombre: FUENTES.supabase || 'SUPABASE', service: services.Supabase },
      { nombre: FUENTES.firebase || 'FIREBASE', service: services.Firebase }
    ];

    var cadena = Promise.reject(new Error('INICIO_CADENA'));

    orden.forEach(function (fuente) {
      cadena = cadena.catch(function () {
        if (!fuente.service || typeof fuente.service[nombreMetodo] !== 'function') {
          errores.push(fuente.nombre + ': servicio no disponible.');
          return Promise.reject(new Error('Servicio no disponible'));
        }

        if (typeof fuente.service.configurado === 'function' && !fuente.service.configurado()) {
          errores.push(fuente.nombre + ': no configurado.');
          return Promise.reject(new Error('No configurado'));
        }

        return fuente.service[nombreMetodo].apply(null, args || []).then(function (data) {
          return {
            ok: true,
            fuente: fuente.nombre,
            data: data,
            advertencias: errores.slice()
          };
        }).catch(function (error) {
          errores.push(fuente.nombre + ': ' + obtenerMensaje(error));
          return Promise.reject(error);
        });
      });
    });

    return cadena.catch(function () {
      return Promise.reject(new Error('No se pudo obtener información desde ninguna fuente. ' + errores.join(' | ')));
    });
  }

  function listarCoordinadoresActivos() {
    return intentarFuentes('listarCoordinadoresActivos', []);
  }

  function listarEstudiantesCoordinador(coordinador) {
    return intentarFuentes('listarEstudiantesCoordinador', [coordinador]);
  }

  function obtenerMensaje(error) {
    return error && error.message ? error.message : String(error || 'Error desconocido');
  }

  window.TitCoordi.Services.DataSource = Object.freeze({
    listarCoordinadoresActivos: listarCoordinadoresActivos,
    listarEstudiantesCoordinador: listarEstudiantesCoordinador
  });
})(window);
