// tab switching
/* ══════════════════════════════════════════
   TABS
══════════════════════════════════════════ */
function switchTab(t) {
  const SYNC_FIELDS = [
    "valorVeiculoBruto","descontoPct","entradaPct","parcelas","jurosMensalPct",
    "oportunidadePct","manutencaoPct","seguroPct","estado","indisponibilidadeAno",
    "modoDepreciacao","depreciacaoPct","licenciamentoAno","admFrotaMensal",
    "custoAtivacao","custoDesativacao",
    "pisPropPct","irpjPropPct","csllPropPct","aluguelMensal","admAluguel","atividadeFim",
    "produtoLocacao","prazoContratoMeses","categoriaVeiculo","precoRevendaEstimado",
    "adicSeguroTotal","adicVidros","adicTelemetria"
  ];
  const fromSim = el("tabSim")?.classList.contains("active");
  const fromEv  = el("tabEv")?.classList.contains("active");

  if (fromSim && t === "ev") {
    SYNC_FIELDS.forEach(f => {
      const src = el(f), dst = el("ev_" + f);
      if (src && dst) dst.value = src.value;
    });
    evTogglePrazo();
  } else if (fromEv && t === "sim") {
    SYNC_FIELDS.forEach(f => {
      const src = el("ev_" + f), dst = el(f);
      if (src && dst) dst.value = src.value;
    });
    sliderUpdate("manutencaoPct","slManut","slManutR");
    sliderUpdate("seguroPct","slSeg","slSegR");
    refreshProdutoUI();
  }

  ["sim","ev","gloss","fc","dec"].forEach(id => {
    const cap = id[0].toUpperCase() + id.slice(1);
    const tabEl   = el("tab"   + cap);
    const panelEl = el("panel" + cap);
    if (tabEl)   tabEl.classList.toggle("active",   id === t);
    if (panelEl) panelEl.classList.toggle("active", id === t);
  });
  if (t === "ev") calcEV();
  else if (t === "sim") calc();
  else if (t === "fc") calcFrota();
}

