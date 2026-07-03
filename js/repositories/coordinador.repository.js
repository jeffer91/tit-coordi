/*
  Archivo: coordinador.repository.js
  Ruta: /js/repositories/coordinador.repository.js
  Funciones principales:
  - Conectar controladores con servicios de datos.
  - Obtener coordinadores y estudiantes normalizados.
  - Guardar revisiones usando Google Sheets como principal y respaldos posteriores.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Repositories = window.TitCoordi.Repositories || {};

  var C = window.TitCoordi.Constants;
  var services = window.TitCoordi.Services;
  var utils = window.TitCoordi.Utils;
  var normalizers = utils.normalizers;
  var validators = utils.validators;
  var dates = utils.dates;

  function obtenerCoordinadores() {
    return services.DataSource.listarCoordinadoresActivos().then(function (resultado) {
      return {
        fuente: resultado.fuente,
        coordinadores: (resultado.data || []).slice().sort(ordenarPorNombre),
        advertencias: resultado.advertencias || []
      };
    });
  }

  function cargarDatosCoordinador(coordinador) {
    var validacion = validators.validarCoordinador(coordinador);
    if (!validacion.ok) return Promise.reject(new Error(validacion.mensaje));

    return services.DataSource.listarEstudiantesCoordinador(coordinador).then(function (resultado) {
      var estudiantes = (resultado.data || [])
        .map(normalizers.normalizarEstudiante)
        .filter(function (estudiante) {
          return !coordinador.carreras.length || normalizers.perteneceCarrera(estudiante, coordinador);
        })
        .sort(ordenarPorCarreraYNombre);

      return {
        fuente: resultado.fuente,
        estudiantes: estudiantes,
        advertencias: resultado.advertencias || []
      };
    });
  }

  function guardarDecision(datos) {
    var revision = construirRevision(datos || {});
    var validacion = validators.validarDecision({
      accion: revision.accion,
      estudiante: datos.estudiante,
      tituloNumero: revision.tituloDefinitivoNumero,
      observacion: revision.observacion
    });

    if (!validacion.ok) return Promise.reject(new Error(validacion.mensaje));

    return services.RevisionSync.guardarRevision(revision).then(function (sync) {
      return {
        ok: true,
        revision: revision,
        sync: sync
      };
    });
  }

  function construirRevision(datos) {
    var estudiante = datos.estudiante || {};
    var coordinador = datos.coordinador || {};
    var titulos = Array.isArray(datos.titulos) ? datos.titulos : estudiante.titulos || [];
    var accion = datos.accion;
    var numero = Number(datos.tituloNumero || 0);
    var elegido = buscarTitulo(titulos, numero);
    var marca = dates.crearMarcaRevision();

    return {
      revisionId: crearRevisionId(estudiante, marca.fechaIso),
      accion: accion,
      estadoRevision: estadoDesdeAccion(accion),
      cedula: estudiante.cedula || '',
      nombres: estudiante.nombres || '',
      carrera: estudiante.carrera || '',
      coordinadorId: coordinador.id || '',
      coordinadorNombre: coordinador.nombre || '',
      tituloDefinitivoNumero: numero || '',
      tituloDefinitivoTexto: elegido ? elegido.tituloOficial : '',
      observacion: normalizers.limpiarTexto(datos.observacion || ''),
      huboCorrecciones: titulos.some(function (t) { return Boolean(t.editado); }),
      titulosRevisados: titulos.map(function (t) {
        return {
          numero: t.numero,
          tituloOriginal: t.tituloOriginal,
          tituloCorregido: t.tituloCorregido || '',
          tituloOficial: t.tituloOficial || t.tituloOriginal,
          editado: Boolean(t.editado)
        };
      }),
      fechaRevisionIso: marca.fechaIso,
      fechaRevisionCliente: marca.fechaCliente,
      zona: marca.zona,
      origen: 'tit-coordi-web'
    };
  }

  function crearRevisionId(estudiante, fechaIso) {
    return String(estudiante.cedula || estudiante.id || 'registro') + '__' + String(fechaIso || Date.now()).replace(/[^0-9A-Za-z]+/g, '_');
  }

  function estadoDesdeAccion(accion) {
    if (accion === C.ACCIONES.aprobar) return C.ESTADOS.aprobado;
    if (accion === C.ACCIONES.aprobarCorrecciones) return C.ESTADOS.aprobadoCorrecciones;
    if (accion === C.ACCIONES.devolver) return C.ESTADOS.devuelto;
    return C.ESTADOS.pendiente;
  }

  function buscarTitulo(titulos, numero) {
    for (var i = 0; i < titulos.length; i += 1) {
      if (Number(titulos[i].numero) === Number(numero)) return titulos[i];
    }
    return null;
  }

  function ordenarPorNombre(a, b) {
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
  }

  function ordenarPorCarreraYNombre(a, b) {
    var carrera = String(a.carrera || '').localeCompare(String(b.carrera || ''), 'es');
    if (carrera !== 0) return carrera;
    return String(a.nombres || '').localeCompare(String(b.nombres || ''), 'es');
  }

  window.TitCoordi.Repositories.Coordinador = Object.freeze({
    obtenerCoordinadores: obtenerCoordinadores,
    cargarDatosCoordinador: cargarDatosCoordinador,
    guardarDecision: guardarDecision,
    construirRevision: construirRevision
  });
})(window);
