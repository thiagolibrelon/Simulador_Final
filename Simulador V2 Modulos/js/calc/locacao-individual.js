// Simulador tab: calc(), regime/manutencao/produto handlers, localStorage persistence
/* ── Cenário de manutenção (carro novo × com 1 ano de uso) ──
   Atalho que preenche a referência de mercado no campo já existente
   (manutencaoPct) — não cria formula nova nem campo persistido novo. */
function setManutCenario(tipo) {
  el("manutencaoPct").value = MANUT_REF[tipo];
  sliderUpdate("manutencaoPct", "slManut", "slManutR");
  el("mscNovo").classList.toggle("active", tipo === "novo");
  el("mscUsado").classList.toggle("active", tipo === "usado");
  calc();
}
function clearManutCenario() {
  el("mscNovo")?.classList.remove("active");
  el("mscUsado")?.classList.remove("active");
}

/* ══════════════════════════════════════════
   DEPRECIAÇÃO
══════════════════════════════════════════ */
function autoDepr() {
  const isReal = el("modoDepreciacao").value === "real";
  el("boxDepreciacaoReal").style.display = isReal ? "block" : "none";
}

function usarValorContabil() {
  el("precoRevendaEstimado").value = Math.round(lastCalc.valorContabil || 0);
  calc();
}

/* ══════════════════════════════════════════
   JÁ POSSUO O VEÍCULO (vender x manter e alugar)
══════════════════════════════════════════ */
function toggleJaPossui() {
  const on = el("jaPossuiVeiculo").checked;
  el("lblPrecoTabela").textContent = on ? "Valor de venda hoje (se decidisse vender)" : "Preço de tabela do veículo";
  el("step0Subtitle").textContent  = on
    ? "Avaliamos o custo de manter o veículo que você já possui — o custo de oportunidade do capital parado no carro — em vez do custo de comprar um novo."
    : "Avaliamos o investimento inicial necessário para a aquisição do veículo, considerando preço de compra, descontos negociados e o desembolso imediato de caixa.";
  ["fgDesconto","fgEntrada","miniAquisicao","fgFinanciamento","fgJuros"].forEach(id => {
    const e = el(id); if (e) e.style.display = on ? "none" : "";
  });
  el("mc1box").style.display       = on ? "none" : "block";
  el("mc1boxPossui").style.display = on ? "block" : "none";
  calc();
}

/* ══════════════════════════════════════════
   REGIME FISCAL
══════════════════════════════════════════ */
function selectRegime(r) {
  perfil = r;
  el("rcReal").classList.toggle("selected", r === "real");
  el("rcPres").classList.toggle("selected", r === "presumido");
  document.querySelectorAll(".p-btn").forEach(b => b.classList.toggle("active", b.dataset.profile === r));
  el("tributosNote").style.display   = r === "presumido" ? "block" : "none";
  el("creditAnim").style.opacity     = r === "real"      ? "1"     : "0.4";
  calc();
}

document.querySelectorAll(".p-btn").forEach(b => {
  b.addEventListener("click", () => selectRegime(b.dataset.profile));
});

/* ══════════════════════════════════════════
   PRODUTO DE LOCAÇÃO (RAC PJ / GF)
══════════════════════════════════════════ */
function refreshProdutoUI() {
  const p = el("produtoLocacao")?.value || "rac";
  el("pcRac")?.classList.toggle("selected", p === "rac");
  el("pcGf")?.classList.toggle("selected", p === "gf");
  const wrap = el("prazoContratoWrap");
  if (wrap) wrap.style.display = p === "gf" ? "block" : "none";
  const hintTel = el("hintTelemetria");
  if (hintTel) hintTel.style.display = p === "gf" ? "block" : "none";
}
function selectProduto(p) {
  el("produtoLocacao").value = p;
  if (p === "rac") el("prazoContratoMeses").value = "12";
  refreshProdutoUI();
  calc();
}

/* ══════════════════════════════════════════
   CÁLCULO PRINCIPAL
══════════════════════════════════════════ */
function calc() {
  /* ── Aquisição ── */
  const jaPossui = el("jaPossuiVeiculo")?.checked || false;
  const vBruto  = n("valorVeiculoBruto");
  const desc    = jaPossui ? 0 : vBruto * pc(n("descontoPct"));
  const vV      = vBruto - desc;
  const entr    = jaPossui ? 0 : vV * pc(n("entradaPct"));
  const fin     = jaPossui ? 0 : Math.max(0, vV - entr);
  const np      = jaPossui ? 1 : n("parcelas");
  const jm      = jaPossui ? 0 : pc(n("jurosMensalPct"));
  const parc    = pmt(fin, jm, np);
  const totP    = parc * np;
  const jTot    = Math.max(0, totP - fin);
  const gParc   = np <= 12 ? totP : parc * 12;
  const saldo   = np <= 12 ? 0    : Math.max(0, totP - gParc);
  const baseOp  = entr + gParc;
  const opor    = jaPossui ? vV * pc(n("oportunidadePct")) : baseOp * pc(n("oportunidadePct"));
  /* já possuo: não há desembolso novo, mas o valor do carro ainda precisa "entrar" na conta
     para netear simetricamente contra revnd lá embaixo (fAnoR = aqAno + opAno - tribP - revnd) —
     senão a depreciação do ano some do cálculo e o resultado fica artificialmente negativo. */
  const aqAno   = jaPossui ? (vV + opor) : (entr + gParc + opor);

  /* ── Operacional ── */
  const manut   = vV * pc(n("manutencaoPct"));
  const seg     = vV * pc(n("seguroPct"));
  const ipvaEl  = el("estado");
  const ipvaRate = parseFloat(ipvaEl.options[ipvaEl.selectedIndex].value) || 0;
  const ipva    = vV * pc(ipvaRate);
  const lic     = n("licenciamentoAno");
  const parad   = n("indisponibilidadeAno");
  const admF    = n("admFrotaMensal") * 12;
  const ativ    = n("custoAtivacao");
  const desativ = n("custoDesativacao");
  const opAno   = manut + seg + ipva + lic + parad + admF + ativ + desativ;

  /* ── Depreciação ── */
  const deprPct = el("modoDepreciacao").value === "contabil" ? 20 : el("modoDepreciacao").value === "utilitario" ? 25 : (n("depreciacaoPct") || 10);
  const deprA   = vV * pc(deprPct);
  const valorContabil = Math.max(0, vV - deprA - saldo);

  /* ── Ganho de capital na revenda (Real e Presumido — não é crédito de aluguel, é regra própria) ── */
  const precoRevenda = n("precoRevendaEstimado") > 0 ? n("precoRevendaEstimado") : valorContabil;
  const ganhoCapital = Math.max(0, precoRevenda - valorContabil);
  const impGanhoCap  = ganhoCapital * (pc(n("irpjPropPct")) + pc(n("csllPropPct")));
  const revnd        = Math.max(0, precoRevenda - impGanhoCap);

  /* ── Tributos Frota ── */
  const basePis = perfil === "real" ? Math.max(0, manut + deprA) : 0;
  const pisP    = basePis * pc(n("pisPropPct"));
  const baseIr  = perfil === "real" ? Math.max(0, manut + deprA - pisP) : 0;
  const irjP    = baseIr  * pc(n("irpjPropPct"));
  const cslP    = baseIr  * pc(n("csllPropPct"));
  const tribP   = pisP + irjP + cslP;

  /* ── Custo Frota ── */
  const fAnoR   = aqAno + opAno - tribP - revnd;
  const fAnoPr  = aqAno + opAno - revnd;
  const fAno    = perfil === "real" ? fAnoR : fAnoPr;

  /* ── Aluguel ── */
  const alqM    = n("aluguelMensal");
  const valP    = 12 * alqM;
  const admA    = n("admAluguel") * 12;
  const adicA   = (n("adicSeguroTotal") + n("adicVidros") + n("adicTelemetria")) * 12;
  const atFim   = el("atividadeFim").value === "sim";
  const baseA   = perfil === "real" ? valP : 0;
  const pisA    = atFim ? baseA * pc(n("pisPropPct")) : 0;
  const irjA    = baseA * pc(n("irpjPropPct"));
  const cslA    = baseA * pc(n("csllPropPct"));
  const tribA   = pisA + irjA + cslA;
  const cAlq    = valP + admA + adicA - tribA;

  /* ── Produto de locação (classificação/reporting — não altera cAlq) ── */
  const produtoLoc = el("produtoLocacao")?.value || "rac";
  const prazoMeses = produtoLoc === "gf" ? (n("prazoContratoMeses") || 36) : 12;
  const valorTotalContrato = alqM * prazoMeses;

  /* ── Resultado ── */
  const econ    = fAno - cAlq;
  const econAbs = Math.abs(econ);
  const venc    = econ >  50  ? "aluguel"
                : econ < -50  ? "propria"
                :               "empate";

  /* Guarda para PDF */
  lastCalc = {
    vBruto, desc, vV, entr, fin, parc, jTot, gParc, opor, aqAno,
    manut, seg, ipva, lic, parad, admF, ativ, desativ, opAno,
    deprPct, deprA, revnd, tribP, pisP, irjP, cslP, basePis, baseIr,
    valorContabil, precoRevenda, ganhoCapital, impGanhoCap,
    fAno, fAnoR, fAnoPr,
    valP, admA, adicA, pisA, irjA, cslA, tribA, cAlq,
    econ, econAbs, venc, perfil,
    np, saldo,
    produtoLoc, prazoMeses, valorTotalContrato
  };

  /* ── Outputs Step 1 ── */
  set("outDesconto",  R(desc));
  set("outEntrada",   R(entr));
  set("outValorFinal",R(vV));
  set("outFinanciado",R(fin));
  set("outEntradaR",  R(entr));
  set("mc1entrada",   R(entr));
  set("mc1valorVenda",R(vV));

  /* ── Outputs Step 2 ── */
  set("mc2entrada",       R(jaPossui ? vV : baseOp));
  set("mc2taxa",          Pct(n("oportunidadePct")));
  set("mc2rend",          R(opor));
  set("outParcela",       R2(parc));
  set("outJurosAno",      R(jTot));
  set("outOportunidade",  R(opor));
  set("outAquisicaoAno",  R(aqAno));

  /* ── Outputs Step 3 ── */
  set("slManut",          n("manutencaoPct").toFixed(1));
  set("slManutR",         R(manut));
  set("slSeg",            n("seguroPct").toFixed(1));
  set("slSegR",           R(seg));
  set("outIpva",          R(ipva));
  set("outIndisp",        R(parad));
  set("outDepreciacao",   R(deprA));
  set("outValorContabil", R(valorContabil));
  set("outImpGanhoCap",   R(impGanhoCap));
  set("outLic",           R(lic));
  set("outAtivacao",      R(ativ));
  set("outDesativacao",   R(desativ));
  set("outOperacionalAno",R(opAno));

  /* ── Outputs Step 4 ── */
  set("crPis",        R(pisA));
  set("crIrpj",       R(irjA));
  set("crCsll",       R(cslA));
  set("crTotal",      R(tribA));
  set("outAluguelAnual", R(valP));
  set("outAdicSeguro",     R(n("adicSeguroTotal") * 12));
  set("outAdicVidros",     R(n("adicVidros") * 12));
  set("outAdicTelemetria", R(n("adicTelemetria") * 12));

  /* ── Executive Dashboard ── */
  const scale = Math.max(aqAno, jTot + opor, opAno + deprA, tribP, fAno, 1);
  const pct   = v => Math.max(0, Math.min(100, Math.abs(v) / scale * 100)).toFixed(1) + "%";

  set("th0v", R(baseOp));         el("th0b").style.width = pct(baseOp);
  set("th1v", R(jTot + opor));    el("th1b").style.width = pct(jTot + opor);
  set("th2v", R(opAno + deprA));  el("th2b").style.width = pct(opAno + deprA);
  set("th3v", R(tribP));          el("th3b").style.width = pct(tribP);

  const ceEl = el("bigFrota");
  ceEl.textContent = R(fAno);
  ceEl.className   = "ce-value" + (fAno > cAlq ? "" : " neutral");
  set("bigFrotaMes", R(fAno / 12));

  /* ── Finalist ── */
  set("vFrotaVal",   R(fAno));
  set("vAluguelVal", R(cAlq));
  set("vAluguelContratoVal", R(valorTotalContrato));
  set("vAluguelProdutoBadge", (produtoLoc === "gf" ? "GF" : "RAC PJ") + " · " + prazoMeses + " meses");
  el("vFrota").className   = "v-card" + (venc === "propria" ? " winner" : "");
  el("vAluguel").className = "v-card" + (venc === "aluguel" ? " winner" : "");

  const ep = el("econPill");
  const perVeic = "por veículo / ano";
  if (venc === "aluguel") {
    ep.className = "econ-pill";
    set("epLabel", "Economia estimada com locação");
    set("epVal",   R(econAbs));
    set("epSub",   perVeic);
  } else if (venc === "propria") {
    ep.className = "econ-pill red";
    set("epLabel", "Vantagem da frota própria");
    set("epVal",   R(econAbs));
    set("epSub",   perVeic);
  } else {
    ep.className = "econ-pill";
    set("epLabel", "Diferença econômica");
    set("epVal",   "—");
    set("epSub",   "equivalência econômica");
  }

  /* ── Resumo da Frota (legado) ── */
  const fs = el("fleetSummary");
  if (fs) fs.style.display = "none";

  /* ── Totais consolidados da frota ── */
  const hasFleet = qtdVeiculos > 1;
  const qtdLabel = qtdVeiculos + " veículo" + (qtdVeiculos !== 1 ? "s" : "");

  // ce-card total
  const ceTR = el("ceTotalRow");
  if (ceTR) {
    ceTR.style.display = hasFleet ? "block" : "none";
    if (hasFleet) set("bigFrotaTotal", R(fAno * qtdVeiculos));
  }

  // versus totals
  const vFT = el("vFrotaTotal"), vAT = el("vAluguelTotal");
  if (vFT) vFT.style.display = hasFleet ? "block" : "none";
  if (vAT) vAT.style.display = hasFleet ? "block" : "none";
  if (hasFleet) {
    set("vFrotaTotalVal",   R(fAno  * qtdVeiculos));
    set("vAluguelTotalVal", R(cAlq  * qtdVeiculos));
  }

  // econ-pill total
  const epTR = el("epTotalRow");
  if (epTR) epTR.style.display = hasFleet ? "block" : "none";
  if (hasFleet) {
    const totalLabel = venc === "aluguel" ? "Economia total · " + qtdLabel
                     : venc === "propria" ? "Vantagem total · " + qtdLabel
                     : "Diferença total · " + qtdLabel;
    set("epTotalLabel", totalLabel);
    set("epTotalVal",   R(econAbs * qtdVeiculos));
  }

  saveLS();
}

/* ══════════════════════════════════════════
   TEXTO DE CONCLUSÃO
══════════════════════════════════════════ */
function gerarConclusao(c, qtd) {
  const pctSav  = c.fAno > 0 ? ((c.econAbs / c.fAno) * 100).toFixed(1).replace(".",",") : "0";
  const regime  = c.perfil === "real" ? "Lucro Real" : "Lucro Presumido";
  const valorPrincipal = qtd > 1 ? R(c.econAbs * qtd) : R(c.econAbs);
  const unitTxt = qtd > 1 ? ` (${R(c.econAbs)} por veículo, considerando uma frota de ${qtd} veículos)` : "";
  if (c.venc === "aluguel") {
    return `Neste cenário de ${regime}, a locação apresenta uma economia anual estimada de <strong>${valorPrincipal}</strong>${unitTxt} (${pctSav}% sobre o custo total da frota própria), reduzindo a exposição à depreciação, custos administrativos e imobilização de capital. A locação transforma CAPEX em OPEX previsível, libera capital de giro e elimina riscos operacionais de gestão de frota, permitindo que a empresa concentre recursos em seu negócio principal.`;
  } else if (c.venc === "propria") {
    return `Neste cenário de ${regime}, a frota própria apresenta melhor desempenho econômico, com uma diferença de <strong>${valorPrincipal}</strong>${unitTxt} ao ano (${pctSav}% abaixo do custo de locação). Recomenda-se, ainda assim, considerar aspectos qualitativos como carga administrativa de gestão de frota, risco de obsolescência do ativo e imobilização de capital antes de uma decisão definitiva.`;
  }
  return `Os cenários analisados apresentam resultado economicamente equivalente (diferença inferior a R$ 50). A decisão entre frota própria e locação deve considerar fatores estratégicos: flexibilidade operacional, previsibilidade de custos, foco no negócio principal e gestão de ativos.`;
}

/* ══════════════════════════════════════════
   LOCAL STORAGE
══════════════════════════════════════════ */
const LS_IDS = [
  "valorVeiculoBruto","descontoPct","entradaPct","parcelas","jurosMensalPct",
  "oportunidadePct","manutencaoPct","seguroPct","estado","indisponibilidadeAno",
  "modoDepreciacao","depreciacaoPct","licenciamentoAno","admFrotaMensal",
  "custoAtivacao","custoDesativacao",
  "pisPropPct","irpjPropPct","csllPropPct","aluguelMensal","admAluguel","atividadeFim",
  "produtoLocacao","prazoContratoMeses","categoriaVeiculo","precoRevendaEstimado",
  "adicSeguroTotal","adicVidros","adicTelemetria"
];

function saveLS() {
  try {
    const d = {};
    LS_IDS.forEach(id => { const e = el(id); if (e) d[id] = e.value; });
    d._perfil = perfil;
    d._step   = currentStep;
    localStorage.setItem("sim-inputs", JSON.stringify(d));
  } catch(e) {}
}

function restoreState() {
  /* Tema */
  applyTheme(theme);

  /* Inputs */
  try {
    const d = JSON.parse(localStorage.getItem("sim-inputs") || "{}");
    LS_IDS.forEach(id => {
      const e = el(id);
      if (e && d[id] !== undefined) e.value = d[id];
    });
    refreshProdutoUI();
    if (d._perfil) selectRegime(d._perfil);
    if (d._step)   goStep(Number(d._step));
  } catch(e) {}

  autoDepr();
}

