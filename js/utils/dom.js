/*
  Archivo: dom.js
  Ruta: /js/utils/dom.js
  Funciones principales:
  - Simplificar lectura y escritura de elementos HTML.
  - Centralizar operaciones comunes de DOM.
  - Evitar errores si un elemento no existe en pantalla.
*/
(function (window, document) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Utils = window.TitCoordi.Utils || {};

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setText(selector, text) {
    var element = typeof selector === 'string' ? qs(selector) : selector;
    if (element) element.textContent = text == null ? '' : String(text);
  }

  function getValue(selector) {
    var element = typeof selector === 'string' ? qs(selector) : selector;
    return element ? String(element.value || '').trim() : '';
  }

  function setValue(selector, value) {
    var element = typeof selector === 'string' ? qs(selector) : selector;
    if (element) element.value = value == null ? '' : String(value);
  }

  function show(selector) {
    var element = typeof selector === 'string' ? qs(selector) : selector;
    if (element) element.classList.remove('is-hidden');
  }

  function hide(selector) {
    var element = typeof selector === 'string' ? qs(selector) : selector;
    if (element) element.classList.add('is-hidden');
  }

  function disable(selector, disabled) {
    var element = typeof selector === 'string' ? qs(selector) : selector;
    if (element) element.disabled = Boolean(disabled);
  }

  function create(tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    if (text != null) element.textContent = String(text);
    return element;
  }

  function clear(elementOrSelector) {
    var element = typeof elementOrSelector === 'string' ? qs(elementOrSelector) : elementOrSelector;
    if (element) element.innerHTML = '';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.TitCoordi.Utils.dom = Object.freeze({
    qs: qs,
    qsa: qsa,
    setText: setText,
    getValue: getValue,
    setValue: setValue,
    show: show,
    hide: hide,
    disable: disable,
    create: create,
    clear: clear,
    escapeHtml: escapeHtml
  });
})(window, document);
