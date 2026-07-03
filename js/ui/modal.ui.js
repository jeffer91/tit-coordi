/*
  Archivo: modal.ui.js
  Ruta: /js/ui/modal.ui.js
  Funciones principales:
  - Renderizar el modal Ver más con los tres títulos del estudiante.
  - Mostrar controles para seleccionar, editar con lapicito y volver al original.
  - Mantener el modal visualmente sincronizado con el borrador de revisión.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.UI = window.TitCoordi.UI || {};

  var dom = window.TitCoordi.Utils.dom;

  function abrir(estudiante, draft) {
    render(estudiante, draft);
    dom.show('#modalRevision');
    var modal = dom.qs('#modalRevision');
    if (modal) modal.setAttribute('aria-hidden', 'false');
  }

  function cerrar() {
    dom.hide('#modalRevision');
    var modal = dom.qs('#modalRevision');
    if (modal) modal.setAttribute('aria-hidden', 'true');
    dom.setValue('#observacionRevision', '');
  }

  function render(estudiante, draft) {
    var lista = dom.qs('#modalTitulosLista');
    var titulos = draft && draft.titulos ? draft.titulos : [];

    dom.setText('#modalTitulo', estudiante && estudiante.nombres ? estudiante.nombres : 'Revisión de títulos');
    dom.setText('#modalCarreraTexto', 'Carrera: ' + ((estudiante && estudiante.carrera) || '—'));

    if (!lista) return;
    lista.innerHTML = '';

    if (!titulos.length) {
      var empty = document.createElement('article');
      empty.className = 'proposal-card';
      empty.textContent = 'Este estudiante no tiene títulos cargados.';
      lista.appendChild(empty);
      return;
    }

    titulos.forEach(function (titulo) {
      lista.appendChild(crearTituloCard(titulo, draft));
    });
  }

  function crearTituloCard(titulo, draft) {
    var card = document.createElement('article');
    card.className = 'proposal-card';
    card.dataset.numero = titulo.numero;

    if (Number(draft.tituloSeleccionado) === Number(titulo.numero)) card.classList.add('is-selected');
    if (titulo.editado) card.classList.add('is-edited');

    var header = document.createElement('div');
    header.className = 'proposal-card__header';

    var strong = document.createElement('strong');
    strong.textContent = 'Título ' + titulo.numero;

    var badge = document.createElement('span');
    badge.className = titulo.editado ? 'badge badge--corrected' : 'badge badge--pending';
    badge.textContent = titulo.editado ? 'Editado' : 'Original';

    header.appendChild(strong);
    header.appendChild(badge);

    var text = document.createElement('p');
    text.className = 'proposal-card__text';
    text.textContent = titulo.tituloOficial || 'Sin título registrado';

    var actions = document.createElement('div');
    actions.className = 'proposal-card__actions';

    actions.appendChild(boton('Seleccionar este título', 'seleccionar-titulo', titulo.numero, 'btn--primary'));
    actions.appendChild(boton('✏️ Editar', 'editar-titulo', titulo.numero, 'btn--secondary'));
    actions.appendChild(boton('Volver al original', 'volver-original', titulo.numero, 'btn--ghost'));

    if (titulo.editando) {
      var editor = document.createElement('textarea');
      editor.className = 'proposal-card__editor';
      editor.rows = 3;
      editor.value = titulo.tituloOficial || '';
      editor.dataset.action = 'texto-editado';
      editor.dataset.numero = titulo.numero;
      card.appendChild(header);
      card.appendChild(editor);
    } else {
      card.appendChild(header);
      card.appendChild(text);
    }

    if (titulo.editado) {
      var note = document.createElement('p');
      note.className = 'editor-note';
      note.textContent = 'Este título tiene correcciones del coordinador.';
      card.appendChild(note);
    }

    card.appendChild(actions);
    return card;
  }

  function boton(texto, accion, numero, clase) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn ' + clase;
    button.textContent = texto;
    button.dataset.action = accion;
    button.dataset.numero = numero;
    return button;
  }

  function setLoading(loading) {
    ['#btnDevolverTitulos', '#btnAprobarCorrecciones', '#btnAprobarTitulo'].forEach(function (selector) {
      dom.disable(selector, loading);
    });
  }

  window.TitCoordi.UI.Modal = Object.freeze({
    abrir: abrir,
    cerrar: cerrar,
    render: render,
    setLoading: setLoading
  });
})(window);
