/*
  Archivo: normalizers.js
  Ruta: /js/utils/normalizers.js
  Funciones principales:
  - Normalizar datos que lleguen desde Google Sheets, Supabase o Firebase.
  - Leer columnas aunque cambien mayúsculas, espacios o tildes.
  - Mantener estados, cédulas, carreras, títulos y coordinadores activos en formato consistente.
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
    return limpiarTexto(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  function claveComparable(value) {
    return normalizarComparacion(value).replace(/[^A-Z0-9]+/g, '');
  }

  function pick(source, keys, fallback) {
    var data = source || {};
    var i;
    var key;

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];
      if (tieneValor(data[key])) return data[key];
    }

    var mapa = {};
    Object.keys(data).forEach(function (realKey) {
      mapa[claveComparable(realKey)] = realKey;
    });

    for (i = 0; i < keys.length; i += 1) {
      key = mapa[claveComparable(keys[i])];
      if (key && tieneValor(data[key])) return data[key];
    }

    return fallback == null ? '' : fallback;
  }

  function tieneValor(value) {
    return value !== undefined && value !== null && String(value).trim() !== '';
  }

  function normalizarEstado(value) {
    var raw = normalizarComparacion(value).replace(/\s+/g, '_');
    if (!raw || raw === 'ENVIADO' || raw === 'PENDIENTE_REVISION') return ESTADOS.pendiente || 'PENDIENTE';
    if (raw === 'APROBADO') return ESTADOS.aprobado || 'APROBADO';
    if (raw === 'APROBADO_CON_OBSERVACION' || raw === 'APROBADO_CON_CORRECCION' || raw === 'APROBADO_CON_CORRECCIONES') return ESTADOS.aprobadoCorrecciones || 'APROBADO_CON_CORRECCIONES';
    if (raw === 'DEVUELTO' || raw === 'RECHAZADO') return ESTADOS.devuelto || 'DEVUELTO';
    return raw;
  }

  function normalizarActivo(value, estado) {
    var estadoTexto = normalizarComparacion(estado);
    var activoTexto = normalizarComparacion(value);

    if (estadoTexto === 'INACTIVO' || estadoTexto === 'DESACTIVADO') return false;
    if (value === false) return false;
    if (activoTexto === 'NO' || activoTexto === 'FALSE' || activoTexto === 'FALSO' || activoTexto === '0' || activoTexto === 'INACTIVO') return false;
    return true;
  }

  function normalizarCoordinador(data) {
    var source = data || {};
    var nombre = limpiarTexto(pick(source, ['nombre', 'nombres', 'coordinador', 'nombreCoordinador', 'Nombre Coordinador']));
    var id = limpiarTexto(pick(source, ['id', 'coordinadorId', 'codigo', 'email', 'correo'], nombre));
    var carrerasRaw = pick(source, ['carreras', 'carrerasAsignadas', 'carrera', 'Carreras', 'Carrera'], '');
    var activoRaw = pick(source, ['activo', 'habilitado', 'estadoActivo'], '');
    var estadoRaw = pick(source, ['estado'], '');

    return {
      id: id || nombre,
      nombre: nombre || id,
      email: limpiarTexto(pick(source, ['email', 'correo'], '')),
      activo: normalizarActivo(activoRaw, estadoRaw),
      carreras: normalizarLista(carrerasRaw),
      raw: source
    };
  }

  function normalizarEstudiante(data) {
    var source = data || {};
    var cedula = normalizarCedula(pick(source, ['cedula', 'cédula', 'numeroIdentificacion', 'identificacion', 'documento']));
    var nombres = limpiarTexto(pick(source, ['nombres', 'nombre', 'estudiante', 'nombreEstudiante', 'Nombre Estudiante', 'NombreCompleto']));
    var carrera = limpiarTexto(pick(source, ['carrera', 'nombreCarrera', 'Nombre Carrera']));
    var estado = normalizarEstado(pick(source, ['estadoRevision', 'estado', 'revisionEstado'], 'PENDIENTE'));
    var titulos = normalizarTitulos(source);

    return {
      id: limpiarTexto(pick(source, ['id', '_docId', 'tituloId'], '')) || cedula,
      cedula: cedula,
      nombres: nombres,
      carrera: carrera,
      coordinadorId: limpiarTexto(pick(source, ['coordinadorId', 'idCoordinador'], '')),
      coordinadorNombre: limpiarTexto(pick(source, ['coordinador', 'coordinadorNombre', 'Nombre Coordinador'], '')),
      estadoRevision: estado,
      tituloAprobadoNumero: Number(pick(source, ['tituloAprobadoNumero', 'tituloDefinitivoNumero'], 0)) || 0,
      tituloAprobadoTexto: limpiarTexto(pick(source, ['tituloAprobadoTexto', 'tituloDefinitivo', 'tituloOficial'], '')),
      observacionRevision: limpiarTexto(pick(source, ['observacionRevision', 'observacion'], '')),
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
          'titulo ' + numero,
          'titulo_' + numero,
          'Título ' + numero,
          'Titulo ' + numero,
          'TITULO ' + numero,
          'tituloFinal' + numero,
          'tituloFinal ' + numero
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
