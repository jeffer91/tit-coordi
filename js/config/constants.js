/*
  Archivo: constants.js
  Ruta: /js/config/constants.js
  Funciones principales:
  - Definir estados, menús, acciones y fuentes de datos de Tit Coordi.
  - Evitar textos mágicos repetidos en controladores y servicios.
  - Mantener una referencia única para aprobación, devolución y correcciones.
*/
(function (window) {
  'use strict';

  window.TitCoordi = window.TitCoordi || {};

  var ESTADOS = Object.freeze({
    pendiente: 'PENDIENTE',
    aprobado: 'APROBADO',
    aprobadoCorrecciones: 'APROBADO_CON_CORRECCIONES',
    devuelto: 'DEVUELTO'
  });

  var MENUS = Object.freeze({
    pendientes: 'PENDIENTE',
    aprobados: 'APROBADOS',
    devueltos: 'DEVUELTO'
  });

  var ACCIONES = Object.freeze({
    aprobar: 'APROBAR',
    aprobarCorrecciones: 'APROBAR_CON_CORRECCIONES',
    devolver: 'DEVOLVER'
  });

  var FUENTES = Object.freeze({
    googleSheets: 'GOOGLE_SHEETS',
    supabase: 'SUPABASE',
    firebase: 'FIREBASE',
    ninguna: 'NINGUNA'
  });

  var MENSAJES = Object.freeze({
    seleccionarCoordinador: 'Selecciona un coordinador para iniciar.',
    cargandoCoordinadores: 'Cargando coordinadores...',
    cargandoDatos: 'Cargando estudiantes asignados...',
    sinPendientes: 'No hay estudiantes pendientes para este coordinador.',
    sinAprobados: 'No hay estudiantes aprobados para este coordinador.',
    sinDevueltos: 'No hay estudiantes devueltos para este coordinador.',
    sheetsPrincipalOk: 'Guardado principal correcto en Google Sheets.',
    respaldoPendiente: 'Guardado principal correcto, respaldo pendiente.',
    sheetsError: 'No se pudo guardar en Google Sheets. La revisión no se cerró.'
  });

  window.TitCoordi.Constants = Object.freeze({
    ESTADOS: ESTADOS,
    MENUS: MENUS,
    ACCIONES: ACCIONES,
    FUENTES: FUENTES,
    MENSAJES: MENSAJES
  });
})(window);
