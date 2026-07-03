/*
  Archivo: table.ui.js
  Ruta: /js/ui/table.ui.js
  Funciones principales:
  - Renderizar la tabla simple de estudiantes.
  - Mostrar cédula, estudiante, carrera y botón Ver más.
  - Soportar los menús Pendientes, Aprobados y Devueltos.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.UI = window.TitCoordi.UI || {};

  var dom = window.TitCoordi.Utils.dom;
  var constants = window.TitCoordi.Constants;

  function render(estudiantes, menuActivo) {
    var tbody = dom.qs('#tablaEstudiantesBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!estudiantes || !estudiantes.length) {
      tbody.appendChild(crearFilaVacia(textoVacio(menuActivo)));
      return;
    }

    estudiantes.forEach(function (estudiante) {
      tbody.appendChild(crearFila(estudiante));
    });
  }

  function crearFila(estudiante) {
    var tr = document.createElement('tr');

    tr.appendChild(td(estudiante.cedula || '—'));
    tr.appendChild(td(estudiante.nombres || 'Sin nombres'));
    tr.appendChild(td(estudiante.carrera || 'Sin carrera'));

    var accion = document.createElement('td');
    accion.className = 'text-right';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--secondary';
    btn.textContent = 'Ver más';
    btn.dataset.action = 'ver-mas';
    btn.dataset.estudianteId = estudiante.id || estudiante.cedula || '';

    accion.appendChild(btn);
    tr.appendChild(accion);

    return tr;
  }

  function crearFilaVacia(mensaje) {
    var tr = document.createElement('tr');
    var cell = document.createElement('td');
    cell.colSpan = 4;
    cell.className = 'empty-cell';
    cell.textContent = mensaje;
    tr.appendChild(cell);
    return tr;
  }

  function td(text) {
    var cell = document.createElement('td');
    cell.textContent = text || '—';
    return cell;
  }

  function textoVacio(menuActivo) {
    if (menuActivo === constants.MENUS.aprobados) return constants.MENSAJES.sinAprobados;
    if (menuActivo === constants.MENUS.devueltos) return constants.MENSAJES.sinDevueltos;
    return constants.MENSAJES.sinPendientes;
  }

  window.TitCoordi.UI.Table = Object.freeze({
    render: render
  });
})(window);
