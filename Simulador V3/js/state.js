// shared global mutable state and cross-tab config
/* ══════════════════════════════════════════
   ESTADO GLOBAL
══════════════════════════════════════════ */
let perfil = "real";
let currentStep = 0;
let clientName = "";
let clientLogoData = null;
let loginMatricula = "";   // nome do executivo (rótulo herdado)
let loginExecMatricula = ""; // matrícula do executivo (Parecer 13, item 07)
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

let frota    = [];
let fcPerfil = "real";
let fcEditId = null;

