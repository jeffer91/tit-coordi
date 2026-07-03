/*
  Archivo: revision.controller.js
  Ruta: /js/controllers/revision.controller.js
  Funciones principales:
  - Abrir y cerrar el modal Ver más.
  - Seleccionar título definitivo, editar con lapicito y volver al original.
  - Guardar aprobación, devolución o aprobación con correcciones.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};
  window.TitCoordi.Controllers = window.TitCoordi.Controllers || {};

  var C = window.TitCoordi.Constants;
  var State = window.TitCoordi.State;
  var Repo = window.TitCoordi.Repositories.Coordinador;
  var Modal = window.TitCoordi.UI.Modal;
  var Messages = window.TitCoordi.UI.Messages;
  var Editor = window.TitCoordi.Controllers.TitleEditor;
  var Coordinador = window.TitCoordi.Controllers.Coordinador;
  var dom = window.TitCoordi.Utils.dom;

  function iniciar() {
    var tabla = dom.qs('#tablaEstudiantesBody');
    var lista = dom.qs('#modalTitulosLista');

    if (tabla) tabla.addEventListener('click', manejarTabla);
    if (lista) {
      lista.addEventListener('click', manejarTitulos);
      lista.addEventListener('input', manejarTextoEditado);
    }

    conectarBoton('#btnCerrarModal', cerrar);
    conectarBoton('#btnCancelarRevision', cerrar);
    conectarBoton('#btnAprobarTitulo', function () { guardar(C.ACCIONES.aprobar); });
    conectarBoton('#btnAprobarCorrecciones', function () { guardar(C.ACCIONES.aprobarCorrecciones); });
    conectarBoton('#btnDevolverTitulos', function () { guardar(C.ACCIONES.devolver); });
  }

  function conectarBoton(selector, handler) {
    var button = dom.qs(selector);
    if (button) button.addEventListener('click', handler);
  }

  function manejarTabla(event) {
    var button = event.target.closest('[data-action="ver-mas"]');
    if (!button) return;
    abrirPorId(button.dataset.estudianteId);
  }

  function abrirPorId(id) {
    var estado = State.getState();
    var estudiante = estado.estudiantes.filter(function (item) {
      return String(item.id) === String(id) || String(item.cedula) === String(id);
    })[0];

    if (!estudiante) {
      Messages.error('No se encontró el estudiante seleccionado.');
      return;
    }

    State.setEstudianteModal(estudiante);
    Modal.abrir(estudiante, Editor.crearDraft(estudiante));
  }

  function manejarTitulos(event) {
    var button = event.target.closest('[data-action]');
    if (!button) return;

    var action = button.dataset.action;
    var numero = Number(button.dataset.numero || 0);
    var estado = State.getState();

    if (action === 'seleccionar-titulo') Editor.seleccionarTitulo(numero);
    if (action === 'editar-titulo') Editor.activarEdicion(numero);
    if (action === 'volver-original') Editor.volverOriginal(numero);

    Modal.render(estado.estudianteModal, Editor.obtenerDraft());
  }

  function manejarTextoEditado(event) {
    if (!event.target || event.target.dataset.action !== 'texto-editado') return;
    var estado = State.getState();
    Editor.actualizarTexto(event.target.dataset.numero, event.target.value);
    Modal.render(estado.estudianteModal, Editor.obtenerDraft());
  }

  function guardar(accion) {
    var estado = State.getState();
    var draft = Editor.cerrarEdicion();
    var observacion = dom.getValue('#observacionRevision');

    if (!estado.estudianteModal || !estado.coordinadorActivo || !draft) {
      Messages.error('No hay una revisión activa.');
      return;
    }

    if (accion === C.ACCIONES.aprobarCorrecciones && !Editor.tieneCorrecciones()) {
      Messages.error('Para aprobar con correcciones primero edita al menos un título.');
      return;
    }

    if (!confirm(mensajeConfirmacion(accion))) return;

    Modal.setLoading(true);
    Messages.info('Guardando revisión...');

    Repo.guardarDecision({
      accion: accion,
      estudiante: estado.estudianteModal,
      coordinador: estado.coordinadorActivo,
      tituloNumero: draft.tituloSeleccionado,
      titulos: draft.titulos,
      observacion: observacion
    }).then(function (resultado) {
      aplicarRevisionLocal(resultado.revision);
      cerrar();
      Coordinador.refrescarPantalla();

      if (resultado.sync && resultado.sync.respaldoCompleto === false) {
        Messages.advertencia('Guardado principal correcto, respaldo pendiente.');
        return;
      }

      Messages.exito('Revisión guardada correctamente.');
    }).catch(function (error) {
      Messages.error(Messages.textoError(error, 'No se pudo guardar la revisión.'));
    }).finally(function () {
      Modal.setLoading(false);
    });
  }

  function aplicarRevisionLocal(revision) {
    var cambios = {
      estadoRevision: revision.estadoRevision,
      tituloAprobadoNumero: revision.tituloDefinitivoNumero,
      tituloAprobadoTexto: revision.tituloDefinitivoTexto,
      observacionRevision: revision.observacion,
      titulos: revision.titulosRevisados
    };

    State.actualizarEstudiante(revision.cedula, cambios);
  }

  function mensajeConfirmacion(accion) {
    if (accion === C.ACCIONES.devolver) return '¿Confirmas devolver los tres títulos?';
    if (accion === C.ACCIONES.aprobarCorrecciones) return '¿Confirmas aprobar con correcciones?';
    return '¿Confirmas aprobar el título seleccionado?';
  }

  function cerrar() {
    Modal.cerrar();
    Editor.limpiar();
    State.setEstudianteModal(null);
  }

  window.TitCoordi.Controllers.Revision = Object.freeze({
    iniciar: iniciar,
    abrirPorId: abrirPorId,
    cerrar: cerrar,
    guardar: guardar
  });
})(window);
