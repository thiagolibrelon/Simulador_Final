// Simulador tab: calc(), regime/produto handlers, localStorage persistence
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
   PRODUTO DE LOCAÇÃO (RAC × GF) — global, decidido no login
══════════════════════════════════════════ */
function syncProdutoUI() {
  const p = loginProduto;
  const isGf = p === "gf";
  const wrap = el("prazoContratoWrap");
  if (wrap) wrap.style.display = isGf ? "block" : "none";
  if (el("prazoContratoMeses")) el("prazoContratoMeses").value = isGf ? loginPrazoContratoMeses : 12;
  const hintTel = el("hintTelemetria");
  if (hintTel) hintTel.style.display = isGf ? "block" : "none";
  const gfWrap = el("gfCamposWrap");
  if (gfWrap) gfWrap.style.display = isGf ? "block" : "none";
  const pneusWrap = el("gfPneusWrap");
  if (pneusWrap) pneusWrap.style.display = isGf ? "block" : "none";
  const ipcaWrap = el("ipcaWrap");
  if (ipcaWrap) ipcaWrap.style.display = isGf ? "block" : "none";
}

function renderProjecaoGF(c) {
  const box = el("gfProjecaoManut");
  const risco = el("gfRiscoDepreciacao");
  if (!box) return;
  if (c.produtoLoc !== "gf" || !c.projecaoManutencao) {
    box.textContent = "";
    if (risco) risco.style.display = "none";
    return;
  }
  const linhas = c.projecaoManutencao
    .map(a => `Ano ${a.ano}: ${a.pct.toFixed(1)}% (${R(a.valor)})`)
    .join(" · ");
  box.innerHTML = `Projeção de manutenção ao longo do contrato (estimativa, pendente validação contábil com o Heitor): ${linhas} — total no contrato: <strong>${R(c.manutTotalContrato)}</strong>`;
  if (risco) {
    risco.style.display = c.riscoReclassificacaoArrendamento ? "block" : "none";
    risco.textContent = "⚠ Prazo ≥ 45 meses se aproxima de 75% da vida útil fiscal (60 meses) — risco de reclassificação para arrendamento mercantil financeiro (Res. BACEN 2.309/96), o que mudaria a dedutibilidade do aluguel. Confirmar com o Heitor antes de fechar contrato.";
  }
}

/* ══════════════════════════════════════════
   CÁLCULO PRINCIPAL
══════════════════════════════════════════ */
function calc() {
  const jaPossui = el("jaPossuiVeiculo")?.checked || false;
  const ipvaEl  = el("estado");
  const ipvaRatePct = parseFloat(ipvaEl.options[ipvaEl.selectedIndex].value) || 0;

  const c = calcCusto({
    jaPossui,
    valorVeiculoBruto: n("valorVeiculoBruto"),
    descontoPct: n("descontoPct"),
    entradaPct: n("entradaPct"),
    parcelas: n("parcelas"),
    jurosMensalPct: n("jurosMensalPct"),
    oportunidadePct: n("oportunidadePct"),
    manutencaoPct: n("manutencaoPct"),
    seguroPct: n("seguroPct"),
    ipvaRatePct,
    licenciamentoAno: n("licenciamentoAno"),
    indisponibilidadeAno: n("indisponibilidadeAno"),
    admFrotaMensal: n("admFrotaMensal"),
    custoAtivacao: n("custoAtivacao"),
    custoDesativacao: n("custoDesativacao"),
    modoDepreciacao: el("modoDepreciacao").value,
    depreciacaoPct: n("depreciacaoPct"),
    precoRevendaEstimado: n("precoRevendaEstimado"),
    pisPropPct: n("pisPropPct"),
    irpjPropPct: n("irpjPropPct"),
    csllPropPct: n("csllPropPct"),
    aluguelMensal: n("aluguelMensal"),
    admAluguel: n("admAluguel"),
    adicSeguroTotal: n("adicSeguroTotal"),
    adicVidros: n("adicVidros"),
    adicTelemetria: n("adicTelemetria"),
    atividadeFim: el("atividadeFim").value,
    perfil,
    produtoLocacao: loginProduto,
    prazoContratoMeses: n("prazoContratoMeses"),
    pneusAnual: n("pneusAnual"),
    franquiaKm: el("franquiaKm")?.value || "",
    ipcaRef: n("ipcaRef")
  });

  /* Guarda para PDF */
  lastCalc = c;

  /* ── Outputs Step 1 ── */
  set("outDesconto",  R(c.desc));
  set("outEntrada",   R(c.entr));
  set("outValorFinal",R(c.vV));
  set("outFinanciado",R(c.fin));
  set("outEntradaR",  R(c.entr));
  set("mc1entrada",   R(c.entr));
  set("mc1valorVenda",R(c.vV));

  /* ── Outputs Step 2 ── */
  set("mc2entrada",       R(jaPossui ? c.vV : (c.entr + c.gParc)));
  set("mc2taxa",          Pct(n("oportunidadePct")));
  set("mc2rend",          R(c.opor));
  set("outParcela",       R2(c.parc));
  set("outJurosAno",      R(c.jTot));
  set("outOportunidade",  R(c.opor));
  set("outAquisicaoAno",  R(c.aqAno));

  /* ── Outputs Step 3 ── */
  set("slManut",          n("manutencaoPct").toFixed(1));
  set("slManutR",         R(c.manut));
  set("slSeg",            n("seguroPct").toFixed(1));
  set("slSegR",           R(c.seg));
  set("outIpva",          R(c.ipva));
  set("outIndisp",        R(c.parad));
  set("outDepreciacao",   R(c.deprA));
  set("outValorContabil", R(c.valorContabil));
  set("outImpGanhoCap",   R(c.impGanhoCap));
  set("outLic",           R(c.lic));
  set("outAtivacao",      R(c.ativ));
  set("outDesativacao",   R(c.desativ));
  set("outOperacionalAno",R(c.opAno));

  /* ── Outputs Step 4 ── */
  set("crPis",        R(c.pisA));
  set("crIrpj",       R(c.irjA));
  set("crCsll",       R(c.cslA));
  set("crTotal",      R(c.tribA));
  set("outAluguelAnual", R(c.valP));
  set("outAdicSeguro",     R(n("adicSeguroTotal") * 12));
  set("outAdicVidros",     R(n("adicVidros") * 12));
  set("outAdicTelemetria", R(n("adicTelemetria") * 12));
  if (el("outPneusAnual")) set("outPneusAnual", R(c.pneusAnual));
  renderProjecaoGF(c);

  /* ── Executive Dashboard ── */
  const scale = Math.max(c.aqAno, c.jTot + c.opor, c.opAno + c.deprA, c.tribP, c.fAno, 1);
  const pct   = v => Math.max(0, Math.min(100, Math.abs(v) / scale * 100)).toFixed(1) + "%";

  set("th0v", R(c.entr + c.gParc));  el("th0b").style.width = pct(c.entr + c.gParc);
  set("th1v", R(c.jTot + c.opor));   el("th1b").style.width = pct(c.jTot + c.opor);
  set("th2v", R(c.opAno + c.deprA)); el("th2b").style.width = pct(c.opAno + c.deprA);
  set("th3v", R(c.tribP));           el("th3b").style.width = pct(c.tribP);

  const ceEl = el("bigFrota");
  ceEl.textContent = R(c.fAno);
  ceEl.className   = "ce-value" + (c.fAno > c.cAlq ? "" : " neutral");
  set("bigFrotaMes", R(c.fAno / 12));

  /* ── Finalist ── */
  set("vFrotaVal",   R(c.fAno));
  set("vAluguelVal", R(c.cAlq));
  set("vAluguelContratoVal", R(c.valorTotalContrato));
  set("vAluguelProdutoBadge", (c.produtoLoc === "gf" ? "GF" : "RAC PJ") + " · " + c.prazoMeses + " meses");
  el("vFrota").className   = "v-card" + (c.venc === "propria" ? " winner" : "");
  el("vAluguel").className = "v-card" + (c.venc === "aluguel" ? " winner" : "");

  const ep = el("econPill");
  const perVeic = "por veículo / ano";
  if (c.venc === "aluguel") {
    ep.className = "econ-pill";
    set("epLabel", "Economia estimada com locação");
    set("epVal",   R(c.econAbs));
    set("epSub",   perVeic);
  } else if (c.venc === "propria") {
    ep.className = "econ-pill red";
    set("epLabel", "Vantagem da frota própria");
    set("epVal",   R(c.econAbs));
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
    if (hasFleet) set("bigFrotaTotal", R(c.fAno * qtdVeiculos));
  }

  // versus totals
  const vFT = el("vFrotaTotal"), vAT = el("vAluguelTotal");
  if (vFT) vFT.style.display = hasFleet ? "block" : "none";
  if (vAT) vAT.style.display = hasFleet ? "block" : "none";
  if (hasFleet) {
    set("vFrotaTotalVal",   R(c.fAno  * qtdVeiculos));
    set("vAluguelTotalVal", R(c.cAlq  * qtdVeiculos));
  }

  // econ-pill total
  const epTR = el("epTotalRow");
  if (epTR) epTR.style.display = hasFleet ? "block" : "none";
  if (hasFleet) {
    const totalLabel = c.venc === "aluguel" ? "Economia total · " + qtdLabel
                     : c.venc === "propria" ? "Vantagem total · " + qtdLabel
                     : "Diferença total · " + qtdLabel;
    set("epTotalLabel", totalLabel);
    set("epTotalVal",   R(c.econAbs * qtdVeiculos));
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
  "prazoContratoMeses","categoriaVeiculo","precoRevendaEstimado",
  "adicSeguroTotal","adicVidros","adicTelemetria",
  "franquiaKm","pneusAnual","ipcaRef"
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
    syncProdutoUI();
    if (d._perfil) selectRegime(d._perfil);
    if (d._step)   goStep(Number(d._step));
  } catch(e) {}

  autoDepr();
}

