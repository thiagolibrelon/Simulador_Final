// Frota Composta tab: pure calc functions (calcModelo, calcFrota)
/* ══════════════════════════════════════════
   FROTA COMPOSTA
══════════════════════════════════════════ */

/* ── Pure calc por modelo — delega ao motor único calcCusto() ──
   Frota Composta mantém produto/prazo por modelo (frota heterogênea pode
   ter categorias RAC e GF misturadas), diferente de Simulador/EV que
   agora usam o produto único decidido no login. */
function calcModelo(m, perfil) {
  const ipvaRatePct = parseFloat(m.estado) || 0;
  /* indispModo/admModo (liga/desliga, true = "Total da frota"): desligado
     (padrão) = valor já é por veículo; ligado = valor digitado é o total da
     linha (mais fácil quando o cliente informa o custo consolidado da
     frota), dividido aqui pela qtd antes do motor único — que segue
     recebendo só valores por veículo, como sempre. */
  const qtdM = +m.qtd || 1;
  const c = calcCusto({
    valorVeiculoBruto: +m.valorVeiculoBruto || 0,
    descontoPct: +m.descontoPct || 0,
    entradaPct: +m.entradaPct || 0,
    parcelas: +m.parcelas || 1,
    jurosMensalPct: +m.jurosMensalPct || 0,
    oportunidadePct: +m.oportunidadePct || 0,
    manutencaoPct: +m.manutencaoPct || 0,
    manutIncrementoAnualPct: (m.manutIncrementoAnualPct === undefined || m.manutIncrementoAnualPct === "") ? undefined : +m.manutIncrementoAnualPct,
    seguroPct: +m.seguroPct || 0,
    ipvaRatePct,
    licenciamentoAno: +m.licenciamentoAno || 0,
    indisponibilidadeAno: m.indispModo ? (+m.indisponibilidadeAno || 0) / qtdM : (+m.indisponibilidadeAno || 0),
    admFrotaMensal: m.admModo ? (+m.admFrotaMensal || 0) / qtdM : (+m.admFrotaMensal || 0),
    custoAtivacao: +m.custoAtivacao || 0,
    custoDesativacao: +m.custoDesativacao || 0,
    modoDepreciacao: m.modoDepreciacao,
    depreciacaoPct: +m.depreciacaoPct || 0,
    precoRevendaEstimado: +m.precoRevendaEstimado || 0,
    pisPropPct: +m.pisPropPct || 0,
    irpjPropPct: +m.irpjPropPct || 0,
    csllPropPct: +m.csllPropPct || 0,
    aluguelMensal: +m.aluguelMensal || 0,
    admAluguel: +m.admAluguel || 0,
    adicSeguroTotal: +m.adicSeguroTotal || 0,
    adicVidros: +m.adicVidros || 0,
    adicTelemetria: +m.adicTelemetria || 0,
    atividadeFim: m.atividadeFim,
    perfil,
    produtoLocacao: m.produtoLocacao === "gf" ? "gf" : "rac",
    prazoContratoMeses: +m.prazoContratoMeses || (m.produtoLocacao === "gf" ? 36 : 12),
    pneusAnual: +m.pneusAnual || 0,
    carroReservaGf: m.carroReservaGf !== "nao"
  });

  return { ...c };
}

/* ── calcFrota ── */
function calcFrota() {
  if (!frota.length) { renderFCEmpty(); renderFCEmptyDash(); return; }
  const c = el("fcModelosList"); if (c) c.innerHTML = "";
  frota.forEach((m, i) => renderFCCard(m, i));

  let totFAno = 0, totCAlq = 0, totQtd = 0, totOtimo = 0;
  const resultados = frota.map(m => {
    const r   = calcModelo(m, fcPerfil);
    const qtd = +m.qtd || 1;
    totFAno  += r.fAno  * qtd;
    totCAlq  += r.cAlq  * qtd;
    totQtd   += qtd;
    totOtimo += Math.min(r.fAno, r.cAlq) * qtd;
    return { ...r, qtd, descricao: m.descricao || "Veículo" };
  });

  const econTotal = totFAno - totCAlq;
  renderFCDashboard({ resultados, totFAno, totCAlq, totQtd, totOtimo, econTotal });
}

