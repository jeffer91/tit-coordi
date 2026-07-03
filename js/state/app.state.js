/*
  Archivo: app.state.js
  Ruta: /js/state/app.state.js
  Funciones principales:
  - Guardar el estado temporal de la app Tit Coordi.
  - Mantener coordinador seleccionado, estudiantes cargados, menú activo y fuente usada.
  - Exponer funciones seguras para leer, actualizar y resetear estado.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};

  var constants = window.TitCoordi.Constants || {};
  var MENUS = constants.MENUS || { pendientes: 'PENDIENTE' };
  var ESTADOS = constants.ESTADOS || {};

  var state = {
    coordinadores: [],
    coordinadorActivo: null,
    estudiantes: [],
    menuActivo: MENUS.pendientes,
    fuenteDatos: '',
    cargando: false,
    estudianteModal: null,
    ultimaActualizacion: null
  };

  function getState() {
    return Object.assign({}, state, {
      coordinadores: state.coordinadores.slice(),
      estudiantes: state.estudiantes.slice()
    });
  }

  function setState(partial) {
    state = Object.assign({}, state, partial || {});
    return getState();
  }

  function resetRevision() {
    state.estudiantes = [];
    state.estudianteModal = null;
    state.menuActivo = MENUS.pendientes;
    state.fuenteDatos = '';
    state.ultimaActualizacion = null;
    return getState();
  }

  function setCoordinadores(coordinadores) {
    state.coordinadores = Array.isArray(coordinadores) ? coordinadores.slice() : [];
    return getState();
  }

  function setCoordinadorActivo(coordinador) {
    state.coordinadorActivo = coordinador || null;
    return getState();
  }

  function setEstudiantes(estudiantes, fuente) {
    state.estudiantes = Array.isArray(estudiantes) ? estudiantes.slice() : [];
    state.fuenteDatos = fuente || state.fuenteDatos;
    state.ultimaActualizacion = new Date().toISOString();
    return getState();
  }

  function setMenuActivo(menu) {
    state.menuActivo = menu || MENUS.pendientes;
    return getState();
  }

  function setEstudianteModal(estudiante) {
    state.estudianteModal = estudiante || null;
    return getState();
  }

  function obtenerEstudiantesPorMenu(menu) {
    var menuActual = menu || state.menuActivo;

    if (menuActual === MENUS.aprobados) {
      return state.estudiantes.filter(function (item) {
        return item.estadoRevision === ESTADOS.aprobado || item.estadoRevision === ESTADOS.aprobadoCorrecciones;
      });
    }

    if (menuActual === MENUS.devueltos) {
      return state.estudiantes.filter(function (item) {
        return item.estadoRevision === ESTADOS.devuelto;
      });
    }

    return state.estudiantes.filter(function (item) {
      return !item.estadoRevision || item.estadoRevision === ESTADOS.pendiente;
    });
  }

  function actualizarEstudiante(id, cambios) {
    state.estudiantes = state.estudiantes.map(function (item) {
      if (item.id === id || item.cedula === id) {
        return Object.assign({}, item, cambios || {});
      }
      return item;
    });
    return getState();
  }

  function obtenerResumen() {
    var pendientes = 0;
    var aprobados = 0;
    var devueltos = 0;

    state.estudiantes.forEach(function (item) {
      if (item.estadoRevision === ESTADOS.aprobado || item.estadoRevision === ESTADOS.aprobadoCorrecciones) {
        aprobados += 1;
        return;
      }

      if (item.estadoRevision === ESTADOS.devuelto) {
        devueltos += 1;
        return;
      }

      pendientes += 1;
    });

    return {
      pendientes: pendientes,
      aprobados: aprobados,
      devueltos: devueltos,
      total: state.estudiantes.length
    };
  }

  window.TitCoordi.State = Object.freeze({
    getState: getState,
    setState: setState,
    resetRevision: resetRevision,
    setCoordinadores: setCoordinadores,
    setCoordinadorActivo: setCoordinadorActivo,
    setEstudiantes: setEstudiantes,
    setMenuActivo: setMenuActivo,
    setEstudianteModal: setEstudianteModal,
    obtenerEstudiantesPorMenu: obtenerEstudiantesPorMenu,
    actualizarEstudiante: actualizarEstudiante,
    obtenerResumen: obtenerResumen
  });
})(window);
