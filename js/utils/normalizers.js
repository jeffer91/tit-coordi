/*
  Archivo: normalizers.js
  Ruta: /js/utils/normalizers.js
  Funciones principales:
  - Normalizar datos que lleguen desde Google Sheets, Supabase o Firebase.
  - Convertir diferentes nombres de columnas/campos a una estructura común.
  - Mantener estados, cédulas, carreras y títulos en formato consistente.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Utils = window.TitCoordi.Utils || {};

  var constants = window.TitCoordi.Constants || {};
  var ESTADOS = constants.ESTADOS || {};

  function limpiarTexto(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function soloNumeros(value) {
    return String(value == null ? '' : value).replace(/\D+/g, '');
  }

  function normalizarCedula(value) {
    var limpia = soloNumeros(value);
    if (limpia.length === 9) return '0' + limpia;
    return limpia;
  }

  function normalizarComparacion(value) {
    return limpiarTexto(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  function pick(source, keys, fallback) {
    var data = source || {};
    for (var i = 0; i < keys.length; i += 1) {
      if (data[keys[i]] !== undefined && data[keys[i]] !== null && String(data[keys[i]]).trim() !== '') {
        return data[keys[i]];
      }
    }
    return fallback == null ? '' : fallback;
  }

  function normalizarEstado(value) {
    var raw = normalizarComparacion(value).replace(/\s+/g, '_');

    if (!raw || raw === 'ENVIADO' || raw === 'PENDIENTE_REVISION') return ESTADOS.pendiente || 'PENDIENTE';
    if (raw === 'APROBADO') return ESTADOS.aprobado || 'APROBADO';
    if (raw === 'APROBADO_CON_OBSERVACION' || raw === 'APROBADO_CON_CORRECCION' || raw === 'APROBADO_CON_CORRECCIONES') {
      return ESTADOS.aprobadoCorrecciones || 'APROBADO_CON_CORRECCIONES';
    }
    if (raw === 'DEVUELTO' || raw === 'RECHAZADO') return ESTADOS.devuelto || 'DEVUELTO';

    return raw;
  }

  function normalizarCoordinador(data) {
    var source = data || {};
    var nombre = limpiarTexto(pick(source, ['nombre', 'nombres', 'coordinador', 'nombreCoordinador', 'NombreCoordinador']));
    var id = limpiarTexto(pick(source, ['id', 'coordinadorId', 'codigo', 'email', 'correo'], nombre));
    var carrerasRaw = pick(source, ['carreras', 'carrerasAsignadas', 'carrera', 'Carreras', 'Carrera'], '');

    return {
      id: id || nombre,
      nombre: nombre || id,
      email: limpiarTexto(pick(source, ['email', 'correo', 'Correo'], '')),
      activo: source.activo === false || normalizarComparacion(source.estado) === 'INACTIVO' ? false : true,
      carreras: normalizarLista(carrerasRaw),
      raw: source
    };
  }

  function normalizarEstudiante(data) {
    var source = data || {};
    var cedula = normalizarCedula(pick(source, ['cedula', 'cédula', 'Cedula', 'Cédula', 'numeroIdentificacion', 'identificacion', 'documento']));
    var nombres = limpiarTexto(pick(source, ['nombres', 'nombre', 'estudiante', 'nombreEstudiante', 'NombreEstudiante', 'NombreCompleto']));
    var carrera = limpiarTexto(pick(source, ['carrera', 'nombreCarrera', 'NombreCarrera', 'Carrera']));
    var estado = normalizarEstado(pick(source, ['estadoRevision', 'estado', 'Estado', 'revisionEstado'], 'PENDIENTE'));
    var titulos = normalizarTitulos(source);

    return {
      id: limpiarTexto(pick(source, ['id', '_docId', 'tituloId'], '')) || cedula,
      cedula: cedula,
      nombres: nombres,
      carrera: carrera,
      coordinadorId: limpiarTexto(pick(source, ['coordinadorId', 'idCoordinador'], '')),
      coordinadorNombre: limpiarTexto(pick(source, ['coordinador', 'coordinadorNombre', 'NombreCoordinador'], '')),
      estadoRevision: estado,
      tituloAprobadoNumero: Number(pick(source, ['tituloAprobadoNumero', 'tituloDefinitivoNumero'], 0)) || 0,
      tituloAprobadoTexto: limpiarTexto(pick(source, ['tituloAprobadoTexto', 'tituloDefinitivo', 'tituloOficial'], '')),
      observacionRevision: limpiarTexto(pick(source, ['observacionRevision', 'observacion', 'Observacion'], '')),
      titulos: titulos,
      raw: source
    };
  }

  function normalizarTitulos(source) {
    if (Array.isArray(source.titulos)) return source.titulos.map(normalizarTituloItem);
    if (Array.isArray(source.titulosEnviados)) return source.titulosEnviados.map(normalizarTituloItem);
    if (Array.isArray(source.propuestas)) return source.propuestas.map(normalizarTituloItem);

    return [1, 2, 3].map(function (numero) {
      return normalizarTituloItem({
        numero: numero,
        tituloOriginal: pick(source, [
          'titulo' + numero,
          'titulo_' + numero,
          'Titulo' + numero,
          'Título ' + numero,
          'tituloFinal' + numero
        ], '')
      });
    }).filter(function (item) {
      return item.tituloOriginal;
    });
  }

  function normalizarTituloItem(item) {
    var source = item || {};
    var numero = Number(pick(source, ['numero', 'n', 'orden'], 0)) || 0;
    var original = limpiarTexto(pick(source, ['tituloOriginal', 'tituloFinal', 'titulo', 'texto', 'nombre'], ''));
    var corregido = limpiarTexto(pick(source, ['tituloCorregido', 'corregido', 'textoCorregido'], ''));

    return {
      numero: numero,
      tituloOriginal: original,
      tituloCorregido: corregido,
      tituloOficial: corregido || original,
      editado: Boolean(corregido && corregido !== original),
      raw: source
    };
  }

  function normalizarLista(value) {
    if (Array.isArray(value)) {
      return value.map(function (item) {
        if (typeof item === 'object' && item !== null) return limpiarTexto(item.nombreCarrera || item.carrera || item.nombre || '');
        return limpiarTexto(item);
      }).filter(Boolean);
    }

    return String(value || '').split(/[,;|]/).map(limpiarTexto).filter(Boolean);
  }

  function perteneceCarrera(estudiante, coordinador) {
    var carreraEstudiante = normalizarComparacion(estudiante && estudiante.carrera);
    var carreras = coordinador && Array.isArray(coordinador.carreras) ? coordinador.carreras : [];

    if (!carreraEstudiante) return false;

    return carreras.some(function (carrera) {
      var carreraCoord = normalizarComparacion(carrera);
      if (!carreraCoord) return false;
      if (carreraCoord === '*' || carreraCoord === 'TODAS' || carreraCoord === 'TODOS' || carreraCoord === 'ALL') return true;
      return carreraEstudiante === carreraCoord || carreraEstudiante.indexOf(carreraCoord) !== -1 || carreraCoord.indexOf(carreraEstudiante) !== -1;
    });
  }

  window.TitCoordi.Utils.normalizers = Object.freeze({
    limpiarTexto: limpiarTexto,
    soloNumeros: soloNumeros,
    normalizarCedula: normalizarCedula,
    normalizarComparacion: normalizarComparacion,
    normalizarEstado: normalizarEstado,
    normalizarCoordinador: normalizarCoordinador,
    normalizarEstudiante: normalizarEstudiante,
    normalizarTituloItem: normalizarTituloItem,
    normalizarLista: normalizarLista,
    perteneceCarrera: perteneceCarrera,
    pick: pick
  });
})(window);
