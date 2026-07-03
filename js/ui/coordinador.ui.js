/*
  Archivo: coordinador.ui.js
  Ruta: /js/ui/coordinador.ui.js
  Funciones principales:
  - Llenar selector de coordinadores.
  - Mostrar la fuente de datos usada.
  - Actualizar la pantalla completa con tarjetas y tabla.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.UI = window.TitCoordi.UI || {};

  var dom = window.TitCoordi.Utils.dom;
  var Cards = window.TitCoordi.UI.Cards;
  var Table = window.TitCoordi.UI.Table;

  function llenarCoordinadores(coordinadores) {
    var select = dom.qs('#coordinadorSelect');
    if (!select) return;

    select.innerHTML = '';
    select.appendChild(option('', 'Seleccione coordinador'));

    (coordinadores || []).forEach(function (coordinador) {
      select.appendChild(option(coordinador.id, coordinador.nombre));
    });
  }

  function option(value, label) {
    var item = document.createElement('option');
    item.value = value || '';
    item.textContent = label || '—';
    return item;
  }

  function obtenerCoordinadorSeleccionado(coordinadores) {
    var id = dom.getValue('#coordinadorSelect');
    return (coordinadores || []).filter(function (coordinador) {
      return String(coordinador.id) === String(id);
    })[0] || null;
  }

  function mostrarFuente(fuente) {
    dom.setText('#fuenteDatosTexto', 'Fuente: ' + (fuente || 'pendiente'));
  }

  function renderPantalla(resumen, estudiantes, menuActivo) {
    Cards.render(resumen);
    Table.render(estudiantes, menuActivo);
  }

  function setLoading(loading) {
    dom.disable('#btnCargarCoordinador', loading);
    dom.disable('#btnActualizarDatos', loading);
    dom.disable('#coordinadorSelect', loading);
  }

  window.TitCoordi.UI.Coordinador = Object.freeze({
    llenarCoordinadores: llenarCoordinadores,
    obtenerCoordinadorSeleccionado: obtenerCoordinadorSeleccionado,
    mostrarFuente: mostrarFuente,
    renderPantalla: renderPantalla,
    setLoading: setLoading
  });
})(window);
