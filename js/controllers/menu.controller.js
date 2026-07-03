/*
  Archivo: menu.controller.js
  Ruta: /js/controllers/menu.controller.js
  Funciones principales:
  - Manejar el menú Pendientes, Aprobados y Devueltos.
  - Actualizar tabla según el estado seleccionado.
  - Mantener activa la pestaña visual correcta.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Controllers = window.TitCoordi.Controllers || {};

  var dom = window.TitCoordi.Utils.dom;
  var State = window.TitCoordi.State;
  var Table = window.TitCoordi.UI.Table;

  function iniciar() {
    dom.qsa('[data-menu]').forEach(function (button) {
      button.addEventListener('click', function () {
        cambiar(button.dataset.menu);
      });
    });
  }

  function cambiar(menu) {
    State.setMenuActivo(menu);
    activarTab(menu);
    render();
  }

  function activarTab(menu) {
    dom.qsa('[data-menu]').forEach(function (button) {
      if (button.dataset.menu === menu) button.classList.add('is-active');
      else button.classList.remove('is-active');
    });
  }

  function render() {
    var estado = State.getState();
    var estudiantes = State.obtenerEstudiantesPorMenu(estado.menuActivo);
    Table.render(estudiantes, estado.menuActivo);
  }

  window.TitCoordi.Controllers.Menu = Object.freeze({
    iniciar: iniciar,
    cambiar: cambiar,
    render: render
  });
})(window);
