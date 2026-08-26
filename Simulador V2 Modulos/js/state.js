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

/* Produto de locação — decidido uma vez no login, motor RAC × motor GF.
   Não é mais um campo do wizard: todas as abas leem este estado global. */
let loginProduto = "rac"; // 'rac' | 'gf'
let loginPrazoContratoMeses = 36;

/* ══════════════════════════════════════════
   SIMULADOR EV — ESTADO
══════════════════════════════════════════ */
let evPerfil    = "real";
let lastCalcEV  = {};

let frota    = [];
let fcPerfil = "real";
let fcEditId = null;

