// shared global mutable state and cross-tab config
/* ══════════════════════════════════════════
   ESTADO GLOBAL
══════════════════════════════════════════ */
let perfil = "real";
let currentStep = 0;
let clientName = "";
let clientLogoData = null;
let loginMatricula = "";
let loginCodigo = "";
let veiculoSimulado = "";
let qtdVeiculos = 1;
let clientPanelOpen = false;
let presMode = false;
let lastCalc = {};

const MANUT_REF = { novo: 1.5, usado: 2.8 };
/* ══════════════════════════════════════════
   SIMULADOR EV — ESTADO
══════════════════════════════════════════ */
let evPerfil    = "real";
let lastCalcEV  = {};

let frota    = [];
let fcPerfil = "real";
let fcEditId = null;

