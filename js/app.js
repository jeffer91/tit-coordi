/*
  Archivo: app.js
  Ruta: /js/app.js
  Funciones principales:
  - Inicializar Tit Coordi cuando cargue la página.
  - Arrancar controladores de menú, coordinador y revisión.
  - Detectar errores graves de inicio y mostrarlos en pantalla.
*/
(function (window, document) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};

  function iniciarApp() {
    try {
      validarDependencias();
      window.TitCoordi.Controllers.Menu.iniciar();
      window.TitCoordi.Controllers.Revision.iniciar();
      window.TitCoordi.Controllers.Coordinador.iniciar();
      console.info('Tit Coordi iniciado correctamente.');
    } catch (error) {
      mostrarErrorInicio(error);
    }
  }

  function validarDependencias() {
    var faltantes = [];

    if (!window.TitCoordi.Constants) faltantes.push('Constants');
    if (!window.TitCoordi.Config) faltantes.push('Config');
    if (!window.TitCoordi.State) faltantes.push('State');
    if (!window.TitCoordi.Utils) faltantes.push('Utils');
    if (!window.TitCoordi.Services) faltantes.push('Services');
    if (!window.TitCoordi.Repositories) faltantes.push('Repositories');
    if (!window.TitCoordi.UI) faltantes.push('UI');
    if (!window.TitCoordi.Controllers) faltantes.push('Controllers');

    if (faltantes.length) {
      throw new Error('Faltan módulos: ' + faltantes.join(', '));
    }
  }

  function mostrarErrorInicio(error) {
    var mensaje = error && error.message ? error.message : 'No se pudo iniciar la app.';
    var element = document.getElementById('mensajeGeneral');

    if (element) {
      element.classList.remove('is-info', 'is-success', 'is-warning');
      element.classList.add('is-error');
      element.textContent = 'Error de inicio: ' + mensaje;
    }

    console.error('Error iniciando Tit Coordi:', error);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarApp);
  } else {
    iniciarApp();
  }
})(window, document);
