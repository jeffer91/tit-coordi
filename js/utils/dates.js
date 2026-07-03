/*
  Archivo: dates.js
  Ruta: /js/utils/dates.js
  Funciones principales:
  - Centralizar fechas usadas en revisiones y respaldos.
  - Generar fechas ISO y fechas visibles para el usuario.
  - Evitar formatos mezclados entre Google Sheets, Supabase y Firebase.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Utils = window.TitCoordi.Utils || {};

  function ahoraIso() {
    return new Date().toISOString();
  }

  function fechaVisible(value) {
    if (!value) return '';

    try {
      return new Date(value).toLocaleString('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return String(value || '');
    }
  }

  function crearMarcaRevision() {
    return {
      fechaIso: ahoraIso(),
      zona: 'America/Guayaquil',
      fechaCliente: fechaVisible(new Date().toISOString())
    };
  }

  window.TitCoordi.Utils.dates = Object.freeze({
    ahoraIso: ahoraIso,
    fechaVisible: fechaVisible,
    crearMarcaRevision: crearMarcaRevision
  });
})(window);
