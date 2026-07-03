/*
  Archivo: messages.ui.js
  Ruta: /js/ui/messages.ui.js
  Funciones principales:
  - Mostrar mensajes de carga, éxito, advertencia y error.
  - Mantener una forma única de informar al coordinador.
  - Evitar duplicar lógica de mensajes en controladores.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.UI = window.TitCoordi.UI || {};

  var dom = window.TitCoordi.Utils.dom;

  function mostrar(selector, mensaje, tipo) {
    var element = dom.qs(selector || '#mensajeGeneral');
    if (!element) return;

    element.classList.remove('is-info', 'is-success', 'is-warning', 'is-error');
    if (tipo) element.classList.add('is-' + tipo);
    element.textContent = mensaje || '';
  }

  function info(mensaje, selector) {
    mostrar(selector, mensaje, 'info');
  }

  function exito(mensaje, selector) {
    mostrar(selector, mensaje, 'success');
  }

  function advertencia(mensaje, selector) {
    mostrar(selector, mensaje, 'warning');
  }

  function error(mensaje, selector) {
    mostrar(selector, mensaje, 'error');
  }

  function limpiar(selector) {
    mostrar(selector, '', '');
  }

  function textoError(errorValue, fallback) {
    return errorValue && errorValue.message ? errorValue.message : fallback || String(errorValue || 'Error desconocido');
  }

  window.TitCoordi.UI.Messages = Object.freeze({
    mostrar: mostrar,
    info: info,
    exito: exito,
    advertencia: advertencia,
    error: error,
    limpiar: limpiar,
    textoError: textoError
  });
})(window);
