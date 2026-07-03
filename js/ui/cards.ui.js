/*
  Archivo: cards.ui.js
  Ruta: /js/ui/cards.ui.js
  Funciones principales:
  - Pintar las tarjetas superiores de resumen.
  - Actualizar pendientes, aprobados, devueltos y total de estudiantes.
  - Reflejar cambios después de cada revisión guardada.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.UI = window.TitCoordi.UI || {};

  var dom = window.TitCoordi.Utils.dom;

  function render(resumen) {
    var data = resumen || {};
    dom.setText('#contadorPendientes', data.pendientes || 0);
    dom.setText('#contadorAprobados', data.aprobados || 0);
    dom.setText('#contadorDevueltos', data.devueltos || 0);
    dom.setText('#contadorTotal', data.total || 0);
  }

  function reset() {
    render({ pendientes: 0, aprobados: 0, devueltos: 0, total: 0 });
  }

  window.TitCoordi.UI.Cards = Object.freeze({
    render: render,
    reset: reset
  });
})(window);
