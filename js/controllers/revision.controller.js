/*
  Archivo: revision.controller.js
  Ruta: /js/controllers/revision.controller.js
  Funciones principales:
  - Abrir/cerrar modal Ver más.
  - Seleccionar, editar y restaurar títulos.
  - Guardar aprobación, devolución o corrección respetando el flujo definido.
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
    escuchar('#tablaEstudiantesBody', 'click', manejarTabla);
    escuchar('#modalTitulosLista', 'click', manejarTitulos);
    escuchar('#modalTitulosLista', 'input', manejarTextoEditado);
    escuchar('#btnCerrarModal', 'click', cerrar);
    escuchar('#btnCancelarRevision', 'click', cerrar);
    escuchar('#btnAprobarTitulo', 'click', function () { guardar(C.ACCIONES.aprobar); });
    escuchar('#btnAprobarCorrecciones', 'click', function () { guardar(C.ACCIONES.aprobarCorrecciones); });
    escuchar('#btnDevolverTitulos', 'click', function () { guardar(C.ACCIONES.devolver); });
  }

  function escuchar(selector, evento, handler) {
    var el = dom.qs(selector);
    if (el) el.addEventListener(evento, handler);
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

    if (!estudiante) return Messages.error('No se encontró el estudiante seleccionado.');

    State.setEstudianteModal(estudiante);
    Modal.abrir(estudiante, Editor.crearDraft(estudiante));
  }

  function manejarTitulos(event) {
    var button = event.target.closest('[data-action]');
    if (!button) return;

    var action = button.dataset.action;
    var numero = Number(button.dataset.numero || 0);
    var estudiante = State.getState().estudianteModal;

    if (action === 'seleccionar-titulo') {
      if (!confirm('¿Confirmas seleccionar este título como definitivo?')) return;
      Editor.seleccionarTitulo(numero);
    }

    if (action === 'editar-titulo') Editor.activarEdicion(numero);
    if (action === 'volver-original') Editor.volverOriginal(numero);

    Modal.render(estudiante, Editor.obtenerDraft());
  }

  function manejarTextoEditado(event) {
    if (!event.target || event.target.dataset.action !== 'texto-editado') return;
    Editor.actualizarTexto(event.target.dataset.numero, event.target.value);
  }

  function guardar(accion) {
    var estado = State.getState();
    var draft = Editor.cerrarEdicion();
    var observacion = dom.getValue('#observacionRevision');
    var hayCorrecciones = Editor.tieneCorrecciones();

    if (!estado.estudianteModal || !estado.coordinadorActivo || !draft) return Messages.error('No hay una revisión activa.');
    if (accion === C.ACCIONES.aprobar && hayCorrecciones) return Messages.error('Hay títulos editados. Usa Aprobar con correcciones.');
    if (accion === C.ACCIONES.aprobarCorrecciones && !hayCorrecciones) return Messages.error('Primero edita al menos un título.');
    if ((accion === C.ACCIONES.devolver || accion === C.ACCIONES.aprobarCorrecciones) && !observacion) return Messages.error('La observación global es obligatoria.');
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
      State.actualizarEstudiante(resultado.revision.cedula, {
        estadoRevision: resultado.revision.estadoRevision,
        tituloAprobadoNumero: resultado.revision.tituloDefinitivoNumero,
        tituloAprobadoTexto: resultado.revision.tituloDefinitivoTexto,
        observacionRevision: resultado.revision.observacion,
        titulos: resultado.revision.titulosRevisados
      });

      cerrar();
      Coordinador.refrescarPantalla();

      if (resultado.sync && resultado.sync.respaldoCompleto === false) Messages.advertencia('Guardado principal correcto, respaldo pendiente.');
      else Messages.exito('Revisión guardada correctamente.');
    }).catch(function (error) {
      Messages.error(Messages.textoError(error, 'No se pudo guardar la revisión.'));
    }).finally(function () {
      Modal.setLoading(false);
    });
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

  window.TitCoordi.Controllers.Revision = Object.freeze({ iniciar: iniciar, abrirPorId: abrirPorId, cerrar: cerrar, guardar: guardar });
})(window);
