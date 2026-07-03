/*
  Archivo: coordinador.controller.js
  Ruta: /js/controllers/coordinador.controller.js
  Funciones principales:
  - Cargar coordinadores activos.
  - Cargar estudiantes del coordinador seleccionado.
  - Actualizar fuente, tarjetas y tabla.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Controllers = window.TitCoordi.Controllers || {};

  var State = window.TitCoordi.State;
  var Repo = window.TitCoordi.Repositories.Coordinador;
  var UI = window.TitCoordi.UI.Coordinador;
  var Cards = window.TitCoordi.UI.Cards;
  var Messages = window.TitCoordi.UI.Messages;
  var Menu = window.TitCoordi.Controllers.Menu;
  var dom = window.TitCoordi.Utils.dom;

  function iniciar() {
    conectarEventos();
    cargarCoordinadores();
  }

  function conectarEventos() {
    var btnCargar = dom.qs('#btnCargarCoordinador');
    var btnActualizar = dom.qs('#btnActualizarDatos');
    if (btnCargar) btnCargar.addEventListener('click', cargarSeleccionado);
    if (btnActualizar) btnActualizar.addEventListener('click', actualizarDatos);
  }

  function cargarCoordinadores() {
    UI.setLoading(true);
    Messages.info('Cargando coordinadores...');

    return Repo.obtenerCoordinadores()
      .then(function (resultado) {
        State.setCoordinadores(resultado.coordinadores);
        UI.llenarCoordinadores(resultado.coordinadores);
        UI.mostrarFuente(resultado.fuente);
        Messages.exito('Coordinadores cargados.');
      })
      .catch(function (error) {
        UI.llenarCoordinadores([]);
        Messages.error(Messages.textoError(error, 'No se pudieron cargar coordinadores.'));
      })
      .finally(function () {
        UI.setLoading(false);
      });
  }

  function cargarSeleccionado() {
    var estado = State.getState();
    var coordinador = UI.obtenerCoordinadorSeleccionado(estado.coordinadores);

    if (!coordinador) {
      Messages.error('Selecciona un coordinador válido.');
      return Promise.resolve();
    }

    State.setCoordinadorActivo(coordinador);
    UI.setLoading(true);
    Cards.reset();
    Messages.info('Cargando estudiantes asignados...');

    return Repo.cargarDatosCoordinador(coordinador)
      .then(function (resultado) {
        State.setEstudiantes(resultado.estudiantes, resultado.fuente);
        UI.mostrarFuente(resultado.fuente);
        refrescarPantalla();
        Messages.exito('Estudiantes cargados correctamente.');
      })
      .catch(function (error) {
        State.resetRevision();
        refrescarPantalla();
        Messages.error(Messages.textoError(error, 'No se pudieron cargar estudiantes.'));
      })
      .finally(function () {
        UI.setLoading(false);
      });
  }

  function actualizarDatos() {
    var estado = State.getState();
    if (!estado.coordinadorActivo) return cargarCoordinadores();
    return cargarSeleccionado();
  }

  function refrescarPantalla() {
    var estado = State.getState();
    UI.renderPantalla(State.obtenerResumen(), State.obtenerEstudiantesPorMenu(estado.menuActivo), estado.menuActivo);
    Menu.render();
  }

  window.TitCoordi.Controllers.Coordinador = Object.freeze({
    iniciar: iniciar,
    cargarCoordinadores: cargarCoordinadores,
    cargarSeleccionado: cargarSeleccionado,
    actualizarDatos: actualizarDatos,
    refrescarPantalla: refrescarPantalla
  });
})(window);
