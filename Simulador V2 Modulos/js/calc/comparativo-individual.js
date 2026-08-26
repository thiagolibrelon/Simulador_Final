// Comparativo Individual (EV) tab: calcEV() and ev_-prefixed handlers, localStorage persistence
const nEV  = id => { const e = el("ev_" + id); return e ? (Number(e.value) || 0) : 0; };
const setEV = (id, v) => set("ev_" + id, v);

function barEV(id, v, max, neg = false) {
  const w = max <= 0 ? 0 : Math.max(2, Math.min(100, Math.abs(v) / max * 100));
  const b = el(id); if (!b) return;
  b.style.width = w.toFixed(1) + "%";
  b.classList.toggle("neg", neg);
}

function autoDeprEV() {
  const isReal = el("ev_modoDepreciacao").value === "real";
  el("ev_boxDeprReal").style.display = isReal ? "block" : "none";
}

function selectRegimeEV(r) {
  evPerfil = r;
  document.querySelectorAll(".ev-pb").forEach(b => b.classList.toggle("active", b.dataset.ep === r));
  const w = el("ev_tributosNote");
  if (w) w.style.display = r === "presumido" ? "block" : "none";
  saveLSEV();
  calcEV();
}

function evTogglePrazo() {
  const isGf = loginProduto === "gf";
  const wrap = el("ev_prazoWrap");
  if (wrap) wrap.style.display = isGf ? "grid" : "none";
  if (el("ev_prazoContratoMeses")) el("ev_prazoContratoMeses").value = isGf ? loginPrazoContratoMeses : 12;
  const gfWrap = el("ev_gfCamposWrap");
  if (gfWrap) gfWrap.style.display = isGf ? "block" : "none";
  const ipcaWrap = el("ev_ipcaWrap");
  if (ipcaWrap) ipcaWrap.style.display = isGf ? "block" : "none";
  const badge = el("ev_produtoLocacaoBadge");
  if (badge) badge.textContent = isGf ? ("GF · " + loginPrazoContratoMeses + " meses") : "RAC PJ · 12 meses";
  calcEV();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ev-pb").forEach(b => {
    b.addEventListener("click", () => selectRegimeEV(b.dataset.ep));
  });
});

/* ── CALC EV ── */
function calcEV() {
  const eEl    = el("ev_estado");
  const ipvaRatePct = parseFloat(eEl.options[eEl.selectedIndex].value) || 0;

  const c = calcCusto({
    valorVeiculoBruto: nEV("valorVeiculoBruto"),
    descontoPct: nEV("descontoPct"),
    entradaPct: nEV("entradaPct"),
    parcelas: nEV("parcelas"),
    jurosMensalPct: nEV("jurosMensalPct"),
    oportunidadePct: nEV("oportunidadePct"),
    manutencaoPct: nEV("manutencaoPct"),
    seguroPct: nEV("seguroPct"),
    ipvaRatePct,
    licenciamentoAno: nEV("licenciamentoAno"),
    indisponibilidadeAno: nEV("indisponibilidadeAno"),
    admFrotaMensal: nEV("admFrotaMensal"),
    custoAtivacao: nEV("custoAtivacao"),
    custoDesativacao: nEV("custoDesativacao"),
    modoDepreciacao: el("ev_modoDepreciacao").value,
    depreciacaoPct: nEV("depreciacaoPct"),
    precoRevendaEstimado: nEV("precoRevendaEstimado"),
    pisPropPct: nEV("pisPropPct"),
    irpjPropPct: nEV("irpjPropPct"),
    csllPropPct: nEV("csllPropPct"),
    aluguelMensal: nEV("aluguelMensal"),
    admAluguel: nEV("admAluguel"),
    adicSeguroTotal: nEV("adicSeguroTotal"),
    adicVidros: nEV("adicVidros"),
    adicTelemetria: nEV("adicTelemetria"),
    atividadeFim: el("ev_atividadeFim").value,
    perfil: evPerfil,
    produtoLocacao: loginProduto,
    prazoContratoMeses: nEV("prazoContratoMeses"),
    pneusAnual: nEV("pneusAnual"),
    franquiaKm: el("ev_franquiaKm")?.value || "",
    ipcaRef: nEV("ipcaRef")
  });

  lastCalcEV = c;

  /* ── Outputs Coluna Esquerda ── */
  setEV("outValorFinal", R(c.vV));
  setEV("outDesconto",   R(c.desc));
  setEV("outEntrada",    R(c.entr));
  setEV("outParcela",    R2(c.parc));
  setEV("outJuros",      R(c.jTot));
  setEV("outAqAno",      R(c.aqAno));
  setEV("outDepr",       R(c.deprA));
  setEV("outValorContabil", R(c.valorContabil));
  setEV("outImpGanhoCap",   R(c.impGanhoCap));
  setEV("vManut",        R(c.manut));
  setEV("vSeguro",       R(c.seg));
  setEV("vIpva",         R(c.ipva));
  setEV("outOpAno",      R(c.opAno));
  setEV("outTribProp",   R(c.tribP));
  setEV("outTribAluguel",R(c.tribA));

  /* ── Outputs Aluguel ── */
  setEV("outAluguelAnual",    R(c.valP));
  setEV("outAdmAluguel",      R(c.admA));
  setEV("outTotalBruto",      R(c.totAlq));
  setEV("outValorTotalContrato", R(c.valorTotalContrato));
  setEV("outPisAluguel",      R(c.pisA));
  setEV("outIrpjAluguel",     R(c.irjA));
  setEV("outCsllAluguel",     R(c.cslA));
  setEV("outTributosAlgTotal",R(c.tribA));
  if (el("ev_outPneusAnual")) setEV("outPneusAnual", R(c.pneusAnual));

  /* ── Comparativo ── */
  const maxB = Math.max(c.aqAno, c.opAno, c.tribP, c.revnd, c.totAlq, c.tribA, c.fAno, c.cAlq, 1);
  setEV("cmpAq",       R(c.aqAno));    barEV("ev_barAq",    c.aqAno,  maxB);
  setEV("cmpOp",       R(c.opAno));    barEV("ev_barOp",    c.opAno,  maxB);
  setEV("cmpTribF",    R(c.tribP));    barEV("ev_barTribF", c.tribP,  maxB, true);
  setEV("cmpRevnd",    R(c.revnd));    barEV("ev_barRevnd", c.revnd,  maxB, true);
  setEV("cmpFAno",     R(c.fAno));     setEV("cmpFMes",  R(c.fAno / 12));
  setEV("cmpAlgBruto", R(c.totAlq));   barEV("ev_barAlg",   c.totAlq, maxB);
  setEV("cmpTribA",    R(c.tribA));    barEV("ev_barTribA", c.tribA,  maxB, true);
  setEV("cmpAAno",     R(c.cAlq));     setEV("cmpAMes",  R(c.cAlq / 12));

  const cf = el("ev_totalFrota"),  ca = el("ev_totalAluguel");
  if (cf) cf.className = "ev-ctotal" + (c.venc === "propria" ? " winner" : "");
  if (ca) ca.className = "ev-ctotal" + (c.venc === "aluguel" ? " winner" : "");

  /* ── Hero KPIs ── */
  const evCF = el("evCardFrota"), evCA = el("evCardAluguel"), evCE = el("evCardEcon");
  [evCF, evCA, evCE].forEach(cc => { if (cc) cc.className = "ev-kpi-card"; });

  set("evKpiFrota",    R(c.fAno));   set("evKpiFrotaMes",   R(c.fAno / 12));
  set("evKpiAluguel",  R(c.cAlq));   set("evKpiAluguelMes", R(c.cAlq / 12));
  set("evKpiEcon",     R(c.econAbs));

  const pctNum = c.fAno > 0 ? (c.econAbs / c.fAno * 100).toFixed(1).replace(".",",") + "%" : "—";
  const venc = c.venc, econAbs = c.econAbs;

  if (venc === "aluguel") {
    if (evCA) evCA.className = "ev-kpi-card winner";
    set("evBadgeAluguel",   "🏆 Locação — Vencedor");
    set("evKpiAluguelSub",  "✅ opção mais econômica");
    set("evBadgeFrota",     "🚗 Frota Própria");
    set("evKpiFrotaSub",    "custo efetivo / ano");
    set("evBadgeEcon",      "💰 Economia com Locação");
    set("evKpiEconSub",     "economia anual estimada");
    set("evKpiEconPer",     pctNum + " de redução");
    const vEl = el("evKpiEcon"); if (vEl) vEl.style.color = "var(--green-l)";
  } else if (venc === "propria") {
    if (evCF) evCF.className = "ev-kpi-card winner";
    set("evBadgeFrota",     "🏆 Frota Própria — Vencedor");
    set("evKpiFrotaSub",    "✅ opção mais econômica");
    set("evBadgeAluguel",   "🔑 Locação");
    set("evKpiAluguelSub",  "custo efetivo / ano");
    set("evBadgeEcon",      "🚗 Vantagem Frota Própria");
    set("evKpiEconSub",     "diferença favorável / ano");
    set("evKpiEconPer",     pctNum + " mais barato");
    const vEl = el("evKpiEcon"); if (vEl) vEl.style.color = "var(--red)";
  } else {
    set("evBadgeFrota",    "🚗 Frota Própria");
    set("evKpiFrotaSub",   "custo efetivo / ano");
    set("evBadgeAluguel",  "🔑 Locação");
    set("evKpiAluguelSub", "custo efetivo / ano");
    set("evBadgeEcon",     "⚖ Equivalência Econômica");
    set("evKpiEconSub",    "empate técnico");
    set("evKpiEconPer",    "—");
    const vEl = el("evKpiEcon"); if (vEl) vEl.style.color = "var(--muted)";
  }

  saveLSEV();
}

/* ── EV localStorage ── */
const EV_LS_IDS = [
  "valorVeiculoBruto","descontoPct","entradaPct","parcelas","jurosMensalPct",
  "oportunidadePct","manutencaoPct","seguroPct","estado","licenciamentoAno",
  "indisponibilidadeAno","admFrotaMensal","modoDepreciacao","depreciacaoPct",
  "custoAtivacao","custoDesativacao",
  "pisPropPct","irpjPropPct","csllPropPct","aluguelMensal","admAluguel","atividadeFim",
  "prazoContratoMeses","categoriaVeiculo","precoRevendaEstimado",
  "adicSeguroTotal","adicVidros","adicTelemetria",
  "franquiaKm","pneusAnual","ipcaRef"
];

function saveLSEV() {
  try {
    const d = {};
    EV_LS_IDS.forEach(id => { const e = el("ev_" + id); if (e) d[id] = e.value; });
    d._perfil = evPerfil;
    localStorage.setItem("sim-ev-inputs", JSON.stringify(d));
  } catch(e) {}
}

function restoreEVState() {
  try {
    const d = JSON.parse(localStorage.getItem("sim-ev-inputs") || "{}");
    EV_LS_IDS.forEach(id => {
      const e = el("ev_" + id);
      if (e && d[id] !== undefined) e.value = d[id];
    });
    if (d._perfil) selectRegimeEV(d._perfil);
  } catch(e) {}
  autoDeprEV();
  evTogglePrazo();
}

