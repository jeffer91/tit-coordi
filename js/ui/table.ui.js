/*
  Archivo: table.ui.js
  Ruta: /js/ui/table.ui.js
  Funciones principales:
  - Renderizar la tabla de estudiantes por menú.
  - Mostrar estado dentro de Aprobados.
  - Mantener Pendientes y Devueltos con tabla simple.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.UI = window.TitCoordi.UI || {};

  var dom = window.TitCoordi.Utils.dom;
  var constants = window.TitCoordi.Constants;

  function render(estudiantes, menuActivo) {
    var tbody = dom.qs('#tablaEstudiantesBody');
    var theadRow = dom.qs('.review-table thead tr');
    var esAprobados = menuActivo === constants.MENUS.aprobados;

    if (!tbody) return;

    renderHeader(theadRow, esAprobados);
    tbody.innerHTML = '';

    if (!estudiantes || !estudiantes.length) {
      tbody.appendChild(crearFilaVacia(textoVacio(menuActivo), esAprobados));
      return;
    }

    estudiantes.forEach(function (estudiante) {
      tbody.appendChild(crearFila(estudiante, esAprobados));
    });
  }

  function renderHeader(row, esAprobados) {
    if (!row) return;

    row.innerHTML = '';
    row.appendChild(th('Cédula'));
    row.appendChild(th('Estudiante'));
    row.appendChild(th('Carrera'));
    if (esAprobados) row.appendChild(th('Estado'));

    var accion = th('Acción');
    accion.className = 'text-right';
    row.appendChild(accion);
  }

  function crearFila(estudiante, esAprobados) {
    var tr = document.createElement('tr');

    tr.appendChild(td(estudiante.cedula || '—'));
    tr.appendChild(td(estudiante.nombres || 'Sin nombres'));
    tr.appendChild(td(estudiante.carrera || 'Sin carrera'));
    if (esAprobados) tr.appendChild(tdEstado(estudiante.estadoRevision));

    var accion = document.createElement('td');
    accion.className = 'text-right';
    accion.appendChild(btnVerMas(estudiante));
    tr.appendChild(accion);

    return tr;
  }

  function btnVerMas(estudiante) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--secondary';
    btn.textContent = 'Ver más';
    btn.dataset.action = 'ver-mas';
    btn.dataset.estudianteId = estudiante.id || estudiante.cedula || '';
    return btn;
  }

  function crearFilaVacia(mensaje, esAprobados) {
    var tr = document.createElement('tr');
    var cell = document.createElement('td');
    cell.colSpan = esAprobados ? 5 : 4;
    cell.className = 'empty-cell';
    cell.textContent = mensaje;
    tr.appendChild(cell);
    return tr;
  }

  function th(text) {
    var cell = document.createElement('th');
    cell.textContent = text || '—';
    return cell;
  }

  function td(text) {
    var cell = document.createElement('td');
    cell.textContent = text || '—';
    return cell;
  }

  function tdEstado(estado) {
    var cell = document.createElement('td');
    var badge = document.createElement('span');

    if (estado === constants.ESTADOS.aprobadoCorrecciones) {
      badge.className = 'badge badge--corrected';
      badge.textContent = 'Aprobado con correcciones';
    } else {
      badge.className = 'badge badge--approved';
      badge.textContent = 'Aprobado';
    }

    cell.appendChild(badge);
    return cell;
  }

  function textoVacio(menuActivo) {
    if (menuActivo === constants.MENUS.aprobados) return constants.MENSAJES.sinAprobados;
    if (menuActivo === constants.MENUS.devueltos) return constants.MENSAJES.sinDevueltos;
    return constants.MENSAJES.sinPendientes;
  }

  window.TitCoordi.UI.Table = Object.freeze({ render: render });
})(window);
