/*
  Archivo: validators.js
  Ruta: /js/utils/validators.js
  Funciones principales:
  - Validar selección de coordinador y estudiante.
  - Validar decisiones de aprobación, devolución y corrección.
  - Garantizar que observaciones obligatorias se cumplan antes de guardar.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Utils = window.TitCoordi.Utils || {};

  var constants = window.TitCoordi.Constants || {};
  var ACCIONES = constants.ACCIONES || {};

  function resultado(ok, mensaje) {
    return {
      ok: Boolean(ok),
      mensaje: mensaje || ''
    };
  }

  function validarCoordinador(coordinador) {
    if (!coordinador || !coordinador.id) return resultado(false, 'Selecciona un coordinador.');
    if (coordinador.activo === false) return resultado(false, 'El coordinador seleccionado está inactivo.');
    return resultado(true, 'Coordinador válido.');
  }

  function validarEstudiante(estudiante) {
    if (!estudiante) return resultado(false, 'No se encontró el estudiante seleccionado.');
    if (!estudiante.cedula) return resultado(false, 'El estudiante no tiene cédula registrada.');
    if (!estudiante.titulos || !estudiante.titulos.length) return resultado(false, 'El estudiante no tiene títulos para revisar.');
    return resultado(true, 'Estudiante válido.');
  }

  function validarTituloSeleccionado(estudiante, tituloNumero) {
    var estudianteValido = validarEstudiante(estudiante);
    if (!estudianteValido.ok) return estudianteValido;

    var numero = Number(tituloNumero || 0);
    var existe = estudiante.titulos.some(function (titulo) {
      return Number(titulo.numero) === numero;
    });

    if (!numero || !existe) return resultado(false, 'Selecciona uno de los títulos como definitivo.');
    return resultado(true, 'Título seleccionado correctamente.');
  }

  function validarObservacion(observacion, accion) {
    var texto = String(observacion || '').trim();

    if (accion === ACCIONES.devolver && !texto) {
      return resultado(false, 'La observación global es obligatoria para devolver.');
    }

    if (accion === ACCIONES.aprobarCorrecciones && !texto) {
      return resultado(false, 'La observación es obligatoria si apruebas con correcciones.');
    }

    return resultado(true, 'Observación válida.');
  }

  function validarDecision(params) {
    var data = params || {};
    var accion = data.accion;
    var estudiante = data.estudiante;
    var tituloNumero = data.tituloNumero;
    var observacion = data.observacion;

    var estudianteValido = validarEstudiante(estudiante);
    if (!estudianteValido.ok) return estudianteValido;

    if (accion === ACCIONES.aprobar || accion === ACCIONES.aprobarCorrecciones) {
      var tituloValido = validarTituloSeleccionado(estudiante, tituloNumero);
      if (!tituloValido.ok) return tituloValido;
    }

    var observacionValida = validarObservacion(observacion, accion);
    if (!observacionValida.ok) return observacionValida;

    return resultado(true, 'Decisión válida.');
  }

  window.TitCoordi.Utils.validators = Object.freeze({
    validarCoordinador: validarCoordinador,
    validarEstudiante: validarEstudiante,
    validarTituloSeleccionado: validarTituloSeleccionado,
    validarObservacion: validarObservacion,
    validarDecision: validarDecision
  });
})(window);
