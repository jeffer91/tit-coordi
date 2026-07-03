/*
  Archivo: title-editor.controller.js
  Ruta: /js/controllers/title-editor.controller.js
  Funciones principales:
  - Manejar el borrador de títulos dentro del modal.
  - Activar edición con lapicito y volver al texto original.
  - Detectar si existe aprobación con correcciones.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Controllers = window.TitCoordi.Controllers || {};

  var normalizers = window.TitCoordi.Utils.normalizers;

  var draft = null;

  function crearDraft(estudiante) {
    var titulos = Array.isArray(estudiante && estudiante.titulos) ? estudiante.titulos : [];

    draft = {
      estudianteId: estudiante && (estudiante.id || estudiante.cedula),
      tituloSeleccionado: Number(estudiante && estudiante.tituloAprobadoNumero || 0) || 0,
      titulos: titulos.map(function (titulo, index) {
        var item = normalizers.normalizarTituloItem(titulo);
        if (!item.numero) item.numero = index + 1;
        item.editando = false;
        return item;
      })
    };

    return obtenerDraft();
  }

  function obtenerDraft() {
    if (!draft) return null;
    return {
      estudianteId: draft.estudianteId,
      tituloSeleccionado: draft.tituloSeleccionado,
      titulos: draft.titulos.map(clonarTitulo)
    };
  }

  function seleccionarTitulo(numero) {
    if (!draft) return null;
    draft.tituloSeleccionado = Number(numero || 0);
    return obtenerDraft();
  }

  function activarEdicion(numero) {
    if (!draft) return null;
    draft.titulos = draft.titulos.map(function (titulo) {
      titulo.editando = Number(titulo.numero) === Number(numero);
      return titulo;
    });
    return obtenerDraft();
  }

  function actualizarTexto(numero, texto) {
    if (!draft) return null;
    draft.titulos = draft.titulos.map(function (titulo) {
      if (Number(titulo.numero) === Number(numero)) {
        var nuevoTexto = normalizers.limpiarTexto(texto);
        titulo.tituloCorregido = nuevoTexto && nuevoTexto !== titulo.tituloOriginal ? nuevoTexto : '';
        titulo.tituloOficial = titulo.tituloCorregido || titulo.tituloOriginal;
        titulo.editado = Boolean(titulo.tituloCorregido);
      }
      return titulo;
    });
    return obtenerDraft();
  }

  function volverOriginal(numero) {
    if (!draft) return null;
    draft.titulos = draft.titulos.map(function (titulo) {
      if (Number(titulo.numero) === Number(numero)) {
        titulo.tituloCorregido = '';
        titulo.tituloOficial = titulo.tituloOriginal;
        titulo.editado = false;
        titulo.editando = false;
      }
      return titulo;
    });
    return obtenerDraft();
  }

  function tieneCorrecciones() {
    return Boolean(draft && draft.titulos.some(function (titulo) { return titulo.editado; }));
  }

  function cerrarEdicion() {
    if (!draft) return null;
    draft.titulos.forEach(function (titulo) {
      titulo.editando = false;
    });
    return obtenerDraft();
  }

  function limpiar() {
    draft = null;
  }

  function clonarTitulo(titulo) {
    return Object.assign({}, titulo);
  }

  window.TitCoordi.Controllers.TitleEditor = Object.freeze({
    crearDraft: crearDraft,
    obtenerDraft: obtenerDraft,
    seleccionarTitulo: seleccionarTitulo,
    activarEdicion: activarEdicion,
    actualizarTexto: actualizarTexto,
    volverOriginal: volverOriginal,
    tieneCorrecciones: tieneCorrecciones,
    cerrarEdicion: cerrarEdicion,
    limpiar: limpiar
  });
})(window);
