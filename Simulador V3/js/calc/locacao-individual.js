// Simulador tab: calc(), regime/produto handlers, localStorage persistence
/* ══════════════════════════════════════════
   DEPRECIAÇÃO
══════════════════════════════════════════ */
function autoDepr() {
  const isReal = el("modoDepreciacao").value === "real";
  el("boxDepreciacaoReal").style.display = isReal ? "block" : "none";
}

/* Preenche a revenda com a referência de mercado ao FIM DO CONTRATO
   (calcCusto.js → valorReferenciaRevenda), não com o contábil do ano 1. */
function usarValorContabil() {
  el("precoRevendaEstimado").value = Math.round(lastCalc.periodo?.revendaReferenciaFim || 0);
  calc();
}

/* ══════════════════════════════════════════
   ADICIONAIS — toggle de apresentação
   O spin comercial mostra a economia sem adicionais primeiro; o executivo
   marca o toggle para inserir Proteção Total / Vidros / Telemetria e ver o
   impacto. Ao desmarcar, zera os campos (volta ao número "limpo").
══════════════════════════════════════════ */
function toggleAdicionais() {
  const on = el("toggleAdic").checked;
  const wrap = el("adicWrap");
  if (wrap) wrap.style.display = on ? "block" : "none";
  if (!on) {
    ["adicSeguroTotal", "adicVidros", "adicTelemetria"].forEach(id => {
      const e = el(id); if (e) e.value = 0;
    });
  }
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

  /* Prazo do contrato — sempre visível. Opções por produto:
     RAC 6/12/18/24 (default 12) · GF 12/18/24/36/48 (default do login). */
  const prazoSel = el("prazoContratoMeses");
  if (prazoSel) {
    const opts = isGf ? [12, 18, 24, 36, 48] : [6, 12, 18, 24];
    const def  = isGf ? (loginPrazoContratoMeses || 36) : 12;
    prazoSel.innerHTML = opts.map(m => `<option value="${m}">${m} meses</option>`).join("");
    prazoSel.value = opts.map(String).includes(String(def)) ? String(def) : String(opts[0]);
  }
  const wrap = el("prazoContratoWrap");
  if (wrap) wrap.style.display = "block";

  const hintTel = el("hintTelemetria");
  if (hintTel) hintTel.style.display = isGf ? "block" : "none";
  const gfWrap = el("gfCamposWrap");
  if (gfWrap) gfWrap.style.display = isGf ? "block" : "none";
  /* Curva de manutenção plurianual roda para RAC e GF — campo sempre visível. */
  const manutIncWrap = el("manutIncWrap");
  if (manutIncWrap) manutIncWrap.style.display = "block";
  /* Carro reserva é uma configuração de contrato GF. */
  const carroReservaWrap = el("carroReservaWrap");
  if (carroReservaWrap) carroReservaWrap.style.display = isGf ? "block" : "none";
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
    .map(a => `Ano ${a.ano}: ${a.pct.toFixed(1)}%${a.fracao < 1 ? " (parcial)" : ""} — ${R(a.valor)}`)
    .join(" · ");
  box.innerHTML = `Projeção de manutenção ao longo do contrato — aumento de ${(+c.manutIncrementoAnualPct).toFixed(0)}% a.a. informado (estimativa, pendente validação contábil): ${linhas} — total no contrato: <strong>${R(c.manutTotalContrato)}</strong>`;
  if (risco) {
    risco.style.display = c.riscoReclassificacaoArrendamento ? "block" : "none";
    risco.textContent = "⚠ Prazo ≥ 45 meses se aproxima de 75% da vida útil fiscal (60 meses) — risco de reclassificação para arrendamento mercantil financeiro (Res. BACEN 2.309/96), o que mudaria a dedutibilidade do aluguel (Parecer 07/11). Confirmar com a área contábil antes de fechar contrato.";
  }
}

/* ══════════════════════════════════════════
   HERO DE RESULTADO — painel direito (Parecer 13, itens 01/02)
   Mostra UM número: a economia, na base do contrato (ou anual p/ 12 meses).
══════════════════════════════════════════ */
function renderResultHero(c, per, mostraPeriodo, venc, mesesLabel) {
  const hero = el("resultHero");
  if (!hero) return;

  const vazio = n("valorVeiculoBruto") < 1 && n("aluguelMensal") < 1;
  const econVeic  = mostraPeriodo ? per.econAbs      : c.econAbs;
  const custoProp = mostraPeriodo ? per.custoPropria : c.fAno;
  const custoAlug = mostraPeriodo ? per.custoAluguel : c.cAlq;
  const baseSub   = mostraPeriodo ? "por veículo · contrato de " + mesesLabel : "por veículo / ano";

  hero.classList.toggle("win", !vazio && venc === "aluguel");
  hero.classList.toggle("red", !vazio && venc === "propria");
  el("rhCardAluguel").className = "rh-card" + (!vazio && venc === "aluguel" ? " win" : "");
  el("rhCardPropria").className = "rh-card" + (!vazio && venc === "propria" ? " win" : "");

  if (vazio) {
    set("rhVerdict", "Preencha o simulador");
    set("rhBig", "—");
    set("rhSub", "a economia aparece aqui");
    el("rhFleet").style.display = "none";
  } else if (venc === "empate") {
    set("rhVerdict", "Empate técnico");
    set("rhBig", "≈ R$ 0");
    set("rhSub", "diferença abaixo de R$ 50 " + baseSub.replace("por veículo", ""));
    el("rhFleet").style.display = "none";
  } else {
    set("rhVerdict", venc === "aluguel" ? "A locação economiza" : "A frota própria economiza");
    set("rhBig", R(econVeic));
    set("rhSub", baseSub);
    const fleet = qtdVeiculos > 1;
    el("rhFleet").style.display = fleet ? "flex" : "none";
    if (fleet) {
      set("rhFleetLabel", "Frota de " + qtdVeiculos + " veículos");
      set("rhFleetVal", R(econVeic * qtdVeiculos));
    }
  }

  set("rhProp", vazio ? "—" : R(custoProp));
  set("rhAlug", vazio ? "—" : R(custoAlug));
  set("rhAlugLabel", c.produtoLoc === "gf" ? "GF · " + mesesLabel : "RAC · " + mesesLabel);

  const noteEl = el("rhNote");
  if (noteEl) {
    let note = "";
    if (!vazio && mostraPeriodo && c.venc !== per.venc) {
      note = "Pela conta anual o resultado seria outro — a projeção do contrato é a comparação fiel para " + mesesLabel + " (Parecer 11).";
    } else if (!vazio && c.riscoReclassificacaoArrendamento) {
      note = "Prazo ≥ 45 meses: ver alerta de arrendamento no detalhamento.";
    }
    noteEl.textContent = note;
    noteEl.style.display = note ? "block" : "none";
  }
}

/* ══════════════════════════════════════════
   CÁLCULO PRINCIPAL
══════════════════════════════════════════ */
function calc() {
  const ipvaEl  = el("estado");
  const ipvaRatePct = parseFloat(ipvaEl.options[ipvaEl.selectedIndex].value) || 0;

  const c = calcCusto({
    valorVeiculoBruto: n("valorVeiculoBruto"),
    descontoPct: n("descontoPct"),
    entradaPct: n("entradaPct"),
    parcelas: n("parcelas"),
    jurosMensalPct: n("jurosMensalPct"),
    oportunidadePct: n("oportunidadePct"),
    manutencaoPct: n("manutencaoPct"),
    manutIncrementoAnualPct: el("manutIncrementoAnualPct") ? n("manutIncrementoAnualPct") : undefined,
    seguroPct: n("seguroPct"),
    ipvaRatePct,
    licenciamentoAno: n("licenciamentoAno"),
    /* "Digitado como" (indispModo/admModo): por padrão o valor já é por veículo.
       Se o executivo marcar "Total da frota" (mais fácil quando o cliente informa
       o custo consolidado), divide pela quantidade antes de entrar no motor —
       que continua trabalhando só com valores por veículo, como sempre. */
    indisponibilidadeAno: el("indispModo")?.checked ? n("indisponibilidadeAno") / qtdVeiculos : n("indisponibilidadeAno"),
    admFrotaMensal: el("admModo")?.checked ? n("admFrotaMensal") / qtdVeiculos : n("admFrotaMensal"),
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
    franquiaKm: el("franquiaKm")?.value || "",
    carroReservaGf: el("carroReservaGf") ? el("carroReservaGf").checked : true
  });

  /* Guarda para PDF */
  lastCalc = c;

  /* Alerta: financiamento mais longo que o prazo do contrato (Parecer 12) */
  const hFin = el("hintFinPrazo");
  if (hFin) {
    const excede = c.np > 1 && c.np > c.prazoMeses;
    hFin.style.display = excede ? "block" : "none";
    if (excede) {
      const faltam = c.np - c.prazoMeses;
      hFin.textContent = `⚠ Financiamento de ${c.np} meses maior que o prazo do contrato (${c.prazoMeses} meses). Ao encerrar o contrato você ainda deverá ${faltam} parcela${faltam > 1 ? "s" : ""} (≈ ${R(c.periodo.saldoFim)}) — abatidas do valor de revenda na projeção do contrato. Se a empresa realmente compraria, considere financiar em prazo próximo ao de uso.`;
    }
  }
  /* Hint: veículo sem vínculo com a atividade (Parecer 12) */
  const hAtiv = el("hintAtividadeFim");
  if (hAtiv) hAtiv.style.display = el("atividadeFim").value === "nao" ? "block" : "none";

  /* ── Outputs Step 1 ── */
  set("outDesconto",  R(c.desc));
  set("outEntrada",   R(c.entr));
  set("outValorFinal",R(c.vV));
  set("outFinanciado",R(c.fin));
  set("outEntradaR",  R(c.entr));
  set("mc1entrada",   R(c.entr));

  /* ── Outputs Step 2 ── */
  set("mc2entrada",       R(c.entr + c.gParc));
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
  set("outValorContabil", R(c.periodo.valorContabilFim));
  set("outRevendaRef",    R(c.periodo.revendaReferenciaFim));
  set("outRevendaMeses",  c.periodo.meses);
  set("outImpGanhoCap",   R(c.periodo.impGanhoCapFim));
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
  const per = c.periodo;
  const mesesLabel = per.meses + " meses";
  /* Para contrato de 12 meses, "no contrato" == comparação anual (o snapshot
     validado) — não duplica. Para prazos ≠ 12, mostra a projeção do período.
     Exceção: se o financiamento (np parcelas) for mais longo que o contrato,
     sobra saldo devedor não quitado ao fim — o snapshot anual não desconta
     esse saldo do crédito de revenda (só o período faz isso, ver saldoFim em
     calcCusto.js), então os dois deixam de coincidir mesmo em 12 meses. */
  const mostraPeriodo = per.meses !== 12 || c.np > per.meses;
  set("vFrotaVal",   R(c.fAno));
  set("vAluguelVal", R(c.cAlq));
  el("vFrotaContratoTotal").style.display   = mostraPeriodo ? "block" : "none";
  el("vAluguelContratoTotal").style.display = mostraPeriodo ? "block" : "none";
  el("epPeriodoRow").style.display          = mostraPeriodo ? "block" : "none";
  if (mostraPeriodo) {
    set("vFrotaContratoLabel",   "Custo no contrato · " + mesesLabel);
    set("vFrotaContratoVal",     R(per.custoPropria));
    set("vAluguelContratoLabel", "Custo no contrato · " + mesesLabel);
    set("vAluguelContratoVal",   R(per.custoAluguel));
  }
  set("vAluguelProdutoBadge", (c.produtoLoc === "gf" ? "GF" : "RAC PJ") + " · " + mesesLabel);
  const vencFinal = mostraPeriodo ? per.venc : c.venc;
  el("vFrota").className   = "v-card" + (vencFinal === "propria" ? " winner" : "");
  el("vAluguel").className = "v-card" + (vencFinal === "aluguel" ? " winner" : "");

  /* ── HERO DE RESULTADO (Parecer 13) — um número, acima da dobra ── */
  renderResultHero(c, per, mostraPeriodo, vencFinal, mesesLabel);

  /* Mesma regra do hero (linha ~294): em 12 meses com financiamento mais
     longo que o contrato, o snapshot (c.venc/c.econAbs) diverge do período —
     usa vencFinal/econVeicFinal pra não contradizer o hero acima. */
  const ep = el("econPill");
  const perVeic = mostraPeriodo ? "por veículo · contrato de " + mesesLabel : "por veículo / ano";
  const econVeicFinal = mostraPeriodo ? per.econAbs : c.econAbs;
  if (vencFinal === "aluguel") {
    ep.className = "econ-pill";
    set("epLabel", "Economia estimada com locação");
    set("epVal",   R(econVeicFinal));
    set("epSub",   perVeic);
  } else if (vencFinal === "propria") {
    ep.className = "econ-pill red";
    set("epLabel", "Vantagem da frota própria");
    set("epVal",   R(econVeicFinal));
    set("epSub",   perVeic);
  } else {
    ep.className = "econ-pill";
    set("epLabel", "Diferença econômica");
    set("epVal",   "—");
    set("epSub",   "equivalência econômica");
  }

  /* Economia no contrato inteiro (período) — só quando prazo ≠ 12 meses */
  if (mostraPeriodo) {
    const perLabel = per.venc === "aluguel" ? "Economia no contrato · " + mesesLabel
                   : per.venc === "propria" ? "Vantagem da frota própria · " + mesesLabel
                   : "Diferença no contrato · " + mesesLabel;
    set("epPeriodoLabel", perLabel);
    set("epPeriodoVal",
        per.venc === "empate" ? "—"
      : qtdVeiculos > 1 ? R(per.econAbs * qtdVeiculos) + " · frota (" + R(per.econAbs) + "/veíc.)"
      : R(per.econAbs));
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
    const totalLabel = (c.venc === "aluguel" ? "Economia total · " : c.venc === "propria" ? "Vantagem total · " : "Diferença total · ") + qtdLabel + " / ano";
    set("epTotalLabel", totalLabel);
    set("epTotalVal",   R(c.econAbs * qtdVeiculos));
  }

  saveLS();
}

/* ══════════════════════════════════════════
   TEXTO DE CONCLUSÃO
══════════════════════════════════════════ */
/* % de economia com a base certa: locação vence → sobre o custo da frota própria;
   própria vence → sobre o custo da locação. Empate/base zero → null.
   Usado na conclusão (tela e PDF) e no destaque do PDF — mesmo número nos três. */
function pctEconomia(venc, econAbs, custoPropria, custoAluguel) {
  const base = venc === "aluguel" ? custoPropria : venc === "propria" ? custoAluguel : 0;
  return base > 0 ? (econAbs / base) * 100 : null;
}
const fmtPctEcon = v => v === null ? "0" : v.toFixed(1).replace(".", ",");

function gerarConclusao(c, qtd) {
  const pctSav  = fmtPctEcon(pctEconomia(c.venc, c.econAbs, c.fAno, c.cAlq));
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
  "oportunidadePct","manutencaoPct","seguroPct","estado","indisponibilidadeAno","indispModo",
  "modoDepreciacao","depreciacaoPct","licenciamentoAno","admFrotaMensal","admModo",
  "custoAtivacao","custoDesativacao",
  "pisPropPct","irpjPropPct","csllPropPct","aluguelMensal","admAluguel","atividadeFim",
  "prazoContratoMeses","categoriaVeiculo","precoRevendaEstimado",
  "franquiaKm","manutIncrementoAnualPct"
];
/* adicSeguroTotal/adicVidros/adicTelemetria NÃO são persistidos — o toggle
   "Incluir itens opcionais" começa desmarcado a cada sessão (spin: economia
   limpa primeiro). Ver toggleAdicionais(). */

function saveLS() {
  try {
    const d = {};
    LS_IDS.forEach(id => { const e = el(id); if (e) d[id] = e.type === "checkbox" ? e.checked : e.value; });
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
      if (e && d[id] !== undefined) { if (e.type === "checkbox") e.checked = !!d[id]; else e.value = d[id]; }
    });
    /* syncProdutoUI reconstrói o seletor de prazo e força o default do produto
       (RAC 12 · GF = loginPrazoContratoMeses) — como no comportamento anterior,
       o prazo não é restaurado do localStorage. */
    syncProdutoUI();
    if (d._perfil) selectRegime(d._perfil);
    if (d._step)   goStep(Number(d._step));
  } catch(e) {}

  autoDepr();
}

