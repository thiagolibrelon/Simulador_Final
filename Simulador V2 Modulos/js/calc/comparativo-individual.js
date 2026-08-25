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

function setManutCenarioEV(tipo) {
  el("ev_manutencaoPct").value = MANUT_REF[tipo];
  el("ev_mscNovo").classList.toggle("active", tipo === "novo");
  el("ev_mscUsado").classList.toggle("active", tipo === "usado");
  calcEV();
}

function evTogglePrazo() {
  const p = el("ev_produtoLocacao")?.value || "rac";
  const wrap = el("ev_prazoWrap");
  if (wrap) wrap.style.display = p === "gf" ? "grid" : "none";
  if (p === "rac" && el("ev_prazoContratoMeses")) el("ev_prazoContratoMeses").value = "12";
  calcEV();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ev-pb").forEach(b => {
    b.addEventListener("click", () => selectRegimeEV(b.dataset.ep));
  });
});

/* ── CALC EV ── */
function calcEV() {
  /* Aquisição */
  const vBruto = nEV("valorVeiculoBruto");
  const desc   = vBruto * pc(nEV("descontoPct"));
  const vV     = vBruto - desc;
  const entr   = vV * pc(nEV("entradaPct"));
  const fin    = Math.max(0, vV - entr);
  const np     = nEV("parcelas");
  const jm     = pc(nEV("jurosMensalPct"));
  const parc   = pmt(fin, jm, np);
  const totP   = parc * np;
  const jTot   = Math.max(0, totP - fin);
  const gParc  = np <= 12 ? totP : parc * 12;
  const saldo  = np <= 12 ? 0    : Math.max(0, totP - gParc);
  const baseOp = entr + gParc;
  const opor   = baseOp * pc(nEV("oportunidadePct"));
  const aqAno  = entr + gParc + opor;

  /* Operacional */
  const manut  = vV * pc(nEV("manutencaoPct"));
  const seg    = vV * pc(nEV("seguroPct"));
  const eEl    = el("ev_estado");
  const ipvaR  = parseFloat(eEl.options[eEl.selectedIndex].value) || 0;
  const ipva   = vV * pc(ipvaR);
  const lic    = nEV("licenciamentoAno");
  const parad  = nEV("indisponibilidadeAno");
  const admF   = nEV("admFrotaMensal") * 12;
  const ativ    = nEV("custoAtivacao");
  const desativ = nEV("custoDesativacao");
  const opAno  = manut + seg + ipva + lic + parad + admF + ativ + desativ;

  /* Depreciação */
  const deprPct = el("ev_modoDepreciacao").value === "contabil" ? 20 : el("ev_modoDepreciacao").value === "utilitario" ? 25 : (nEV("depreciacaoPct") || 10);
  const deprA   = vV * pc(deprPct);
  const valorContabil = Math.max(0, vV - deprA - saldo);

  /* Ganho de capital na revenda (Real e Presumido) */
  const precoRevenda = nEV("precoRevendaEstimado") > 0 ? nEV("precoRevendaEstimado") : valorContabil;
  const ganhoCapital = Math.max(0, precoRevenda - valorContabil);
  const impGanhoCap  = ganhoCapital * (pc(nEV("irpjPropPct")) + pc(nEV("csllPropPct")));
  const revnd        = Math.max(0, precoRevenda - impGanhoCap);

  /* Tributos Frota */
  const basePis = evPerfil === "real" ? Math.max(0, manut + deprA) : 0;
  const pisP    = basePis * pc(nEV("pisPropPct"));
  const baseIr  = evPerfil === "real" ? Math.max(0, manut + deprA - pisP) : 0;
  const irjP    = baseIr  * pc(nEV("irpjPropPct"));
  const cslP    = baseIr  * pc(nEV("csllPropPct"));
  const tribP   = pisP + irjP + cslP;

  /* Custo Frota */
  const fAnoR  = aqAno + opAno - tribP - revnd;
  const fAnoPr = aqAno + opAno - revnd;
  const fAno   = evPerfil === "real" ? fAnoR : fAnoPr;

  /* Aluguel */
  const alqM   = nEV("aluguelMensal");
  const valP   = 12 * alqM;
  const admA   = nEV("admAluguel") * 12;
  const adicA  = (nEV("adicSeguroTotal") + nEV("adicVidros") + nEV("adicTelemetria")) * 12;
  const atFim  = el("ev_atividadeFim").value === "sim";
  const baseA  = evPerfil === "real" ? valP : 0;
  const pisA   = atFim ? baseA * pc(nEV("pisPropPct")) : 0;
  const irjA   = baseA * pc(nEV("irpjPropPct"));
  const cslA   = baseA * pc(nEV("csllPropPct"));
  const tribA  = pisA + irjA + cslA;
  const totAlq = valP + admA + adicA;
  const cAlq   = totAlq - tribA;

  /* Produto de locação (classificação/reporting — não altera cAlq) */
  const produtoLoc = el("ev_produtoLocacao")?.value || "rac";
  const prazoMeses = produtoLoc === "gf" ? (nEV("prazoContratoMeses") || 36) : 12;
  const valorTotalContrato = alqM * prazoMeses;

  /* Resultado */
  const econ    = fAno - cAlq;
  const econAbs = Math.abs(econ);
  const venc    = econ >  50  ? "aluguel"
                : econ < -50  ? "propria"
                :               "empate";

  lastCalcEV = {
    vBruto, desc, vV, entr, fin, parc, jTot, gParc, opor, aqAno,
    manut, seg, ipva, lic, parad, admF, ativ, desativ, opAno,
    deprPct, deprA, revnd, tribP, pisP, irjP, cslP,
    valorContabil, precoRevenda, ganhoCapital, impGanhoCap,
    fAno, fAnoR, fAnoPr, cAlq, valP, admA, adicA, pisA, irjA, cslA, tribA, totAlq,
    econ, econAbs, venc, perfil: evPerfil, np, saldo,
    produtoLoc, prazoMeses, valorTotalContrato
  };

  /* ── Outputs Coluna Esquerda ── */
  setEV("outValorFinal", R(vV));
  setEV("outDesconto",   R(desc));
  setEV("outEntrada",    R(entr));
  setEV("outParcela",    R2(parc));
  setEV("outJuros",      R(jTot));
  setEV("outAqAno",      R(aqAno));
  setEV("outDepr",       R(deprA));
  setEV("outValorContabil", R(valorContabil));
  setEV("outImpGanhoCap",   R(impGanhoCap));
  setEV("vManut",        R(manut));
  setEV("vSeguro",       R(seg));
  setEV("vIpva",         R(ipva));
  setEV("outOpAno",      R(opAno));
  setEV("outTribProp",   R(tribP));
  setEV("outTribAluguel",R(tribA));

  /* ── Outputs Aluguel ── */
  setEV("outAluguelAnual",    R(valP));
  setEV("outAdmAluguel",      R(admA));
  setEV("outTotalBruto",      R(totAlq));
  setEV("outValorTotalContrato", R(valorTotalContrato));
  setEV("outPisAluguel",      R(pisA));
  setEV("outIrpjAluguel",     R(irjA));
  setEV("outCsllAluguel",     R(cslA));
  setEV("outTributosAlgTotal",R(tribA));

  /* ── Comparativo ── */
  const maxB = Math.max(aqAno, opAno, tribP, revnd, totAlq, tribA, fAno, cAlq, 1);
  setEV("cmpAq",       R(aqAno));    barEV("ev_barAq",    aqAno,  maxB);
  setEV("cmpOp",       R(opAno));    barEV("ev_barOp",    opAno,  maxB);
  setEV("cmpTribF",    R(tribP));    barEV("ev_barTribF", tribP,  maxB, true);
  setEV("cmpRevnd",    R(revnd));    barEV("ev_barRevnd", revnd,  maxB, true);
  setEV("cmpFAno",     R(fAno));     setEV("cmpFMes",  R(fAno / 12));
  setEV("cmpAlgBruto", R(totAlq));   barEV("ev_barAlg",   totAlq, maxB);
  setEV("cmpTribA",    R(tribA));    barEV("ev_barTribA", tribA,  maxB, true);
  setEV("cmpAAno",     R(cAlq));     setEV("cmpAMes",  R(cAlq / 12));

  const cf = el("ev_totalFrota"),  ca = el("ev_totalAluguel");
  if (cf) cf.className = "ev-ctotal" + (venc === "propria" ? " winner" : "");
  if (ca) ca.className = "ev-ctotal" + (venc === "aluguel" ? " winner" : "");

  /* ── Hero KPIs ── */
  const evCF = el("evCardFrota"), evCA = el("evCardAluguel"), evCE = el("evCardEcon");
  [evCF, evCA, evCE].forEach(c => { if (c) c.className = "ev-kpi-card"; });

  set("evKpiFrota",    R(fAno));   set("evKpiFrotaMes",   R(fAno / 12));
  set("evKpiAluguel",  R(cAlq));   set("evKpiAluguelMes", R(cAlq / 12));
  set("evKpiEcon",     R(econAbs));

  const pctNum = fAno > 0 ? (econAbs / fAno * 100).toFixed(1).replace(".",",") + "%" : "—";

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
  "produtoLocacao","prazoContratoMeses","categoriaVeiculo","precoRevendaEstimado",
  "adicSeguroTotal","adicVidros","adicTelemetria"
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
    const wrap = el("ev_prazoWrap");
    if (wrap) wrap.style.display = el("ev_produtoLocacao")?.value === "gf" ? "grid" : "none";
    if (d._perfil) selectRegimeEV(d._perfil);
  } catch(e) {}
  autoDeprEV();
  calcEV();
}

