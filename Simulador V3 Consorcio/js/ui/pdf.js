// PDF/print export (exportPDF — Simulador · exportPDFFrota — Frota Composta)
const LOGO_LOCALIZA = new URL("assets/localiza-logo-oficial-cropped.png", document.baseURI).href;

/* ══════════════════════════════════════════
   MEMÓRIA DE CÁLCULO — apêndice técnico opcional do PDF (checkbox
   "Incluir memória de cálculo detalhada"). Mostra a fórmula por trás de
   cada linha do resumo — não só o resultado — reaproveitando os valores
   que calcCusto() já devolve em `c`. Função pura: só monta texto, não
   recalcula nada. `raw` carrega os percentuais/insumos que calcCusto usa
   mas não devolve prontos (ver buildRawFromDom/buildRawFromModelo abaixo).
══════════════════════════════════════════ */
function fmtPctMC(v) {
  return (+v || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%";
}

function buildRawFromDom() {
  const estadoEl = el("estado");
  return {
    descontoPct: n("descontoPct"), entradaPct: n("entradaPct"), jurosMensalPct: n("jurosMensalPct"),
    oportunidadePct: n("oportunidadePct"), manutencaoPct: n("manutencaoPct"), seguroPct: n("seguroPct"),
    ipvaRatePct: estadoEl ? (parseFloat(estadoEl.options[estadoEl.selectedIndex].value) || 0) : 0,
    estadoNome: estadoEl ? estadoEl.options[estadoEl.selectedIndex].text : "",
    pisPropPct: n("pisPropPct"), irpjPropPct: n("irpjPropPct"), csllPropPct: n("csllPropPct"),
    indispModo: el("indispModo")?.checked || false, indisponibilidadeInput: n("indisponibilidadeAno"),
    admModo: el("admModo")?.checked || false, admFrotaInput: n("admFrotaMensal"),
    qtd: qtdVeiculos || 1
  };
}

function buildRawFromModelo(m) {
  return {
    descontoPct: +m.descontoPct || 0, entradaPct: +m.entradaPct || 0, jurosMensalPct: +m.jurosMensalPct || 0,
    oportunidadePct: +m.oportunidadePct || 0, manutencaoPct: +m.manutencaoPct || 0, seguroPct: +m.seguroPct || 0,
    ipvaRatePct: +m.estado || 0, estadoNome: "",
    pisPropPct: +m.pisPropPct || 0, irpjPropPct: +m.irpjPropPct || 0, csllPropPct: +m.csllPropPct || 0,
    indispModo: !!m.indispModo, indisponibilidadeInput: +m.indisponibilidadeAno || 0,
    admModo: !!m.admModo, admFrotaInput: +m.admFrotaMensal || 0,
    qtd: +m.qtd || 1
  };
}

function renderMemoriaCalculo(c, raw) {
  const mesesFin1 = Math.min(c.np, 12);
  const linha = (label, val) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:3px 0;font-size:10.5px;color:#6E6E6E"><span>${label}</span><strong style="color:#4A4A4A;white-space:nowrap">${val}</strong></div>`;
  const bloco = (titulo, conteudo) => `<div style="background:#FAFAFA;border:1px solid #E6E6E6;border-radius:8px;padding:14px 16px;margin-bottom:12px">
    <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#018444;margin-bottom:8px">${titulo}</div>
    ${conteudo}
  </div>`;

  const indispNota = raw.indispModo
    ? `<div style="font-size:9.5px;color:#A0631A;padding:2px 0 4px 0">Digitado como total da frota: ${R(raw.indisponibilidadeInput)} ÷ ${raw.qtd} veículo${raw.qtd > 1 ? "s" : ""} = ${R(c.parad)}/veículo</div>` : "";
  const admNota = raw.admModo
    ? `<div style="font-size:9.5px;color:#A0631A;padding:2px 0 4px 0">Digitado como total mensal da frota: ${R(raw.admFrotaInput)} ÷ ${raw.qtd} veículo${raw.qtd > 1 ? "s" : ""} = ${R(c.admF)}/ano/veículo</div>` : "";

  const aquisicao = bloco("1 · Aquisição do veículo (ano 1)", `
    ${linha("Preço de tabela", R(c.vBruto))}
    ${linha(`Desconto negociado (${fmtPctMC(raw.descontoPct)})`, "− " + R(c.desc))}
    ${linha("Valor negociado", R(c.vV))}
    ${linha(`Entrada (${fmtPctMC(raw.entradaPct)})`, R(c.entr))}
    ${linha("Financiado", R(c.fin))}
    ${c.np > 1 ? linha(`Parcela (Price · ${c.np}× · ${fmtPctMC(raw.jurosMensalPct)} a.m.)`, R2(c.parc) + "/mês") : linha("Pagamento", "à vista")}
    ${c.np > 1 ? linha("Juros totais no financiamento", R(c.jTot)) : ""}
    ${linha(`Parcelas pagas no ano 1 (${mesesFin1}×)`, R(c.gParc))}
    ${linha(`Custo de oportunidade / TMA (${fmtPctMC(raw.oportunidadePct)} a.a. sobre entrada + parcelas)`, R(c.opor))}
    <div style="border-top:1px solid #E6E6E6;margin-top:6px;padding-top:6px">${linha("Total aquisição (ano 1)", R(c.aqAno))}</div>
  `);

  const operacional = bloco("2 · Custos operacionais (ano 1)", `
    ${linha(`Manutenção (${fmtPctMC(raw.manutencaoPct)} sobre ${R(c.vV)})`, R(c.manut))}
    ${linha(`Seguro (${fmtPctMC(raw.seguroPct)} sobre ${R(c.vV)})`, R(c.seg))}
    ${linha(`IPVA (${fmtPctMC(raw.ipvaRatePct)}${raw.estadoNome ? " — " + raw.estadoNome : ""})`, R(c.ipva))}
    ${linha("Licenciamento", R(c.lic))}
    ${linha("Custo de indisponibilidade", R(c.parad))}
    ${indispNota}
    ${linha("Administração de frota (× 12 meses)", R(c.admF))}
    ${admNota}
    ${c.ativ > 0 ? linha("Ativação", R(c.ativ)) : ""}
    ${c.desativ > 0 ? linha("Desativação", R(c.desativ)) : ""}
    <div style="border-top:1px solid #E6E6E6;margin-top:6px;padding-top:6px">${linha("Total operacional (ano 1)", R(c.opAno))}</div>
  `);

  const revenda = bloco("3 · Depreciação e revenda", `
    ${linha(`Depreciação (${fmtPctMC(c.deprPct)} sobre ${R(c.vV)})`, R(c.deprA))}
    ${linha("Valor contábil líquido = custo − depreciação", R(c.valorContabil))}
    ${linha("Preço estimado de revenda", R(c.precoRevenda))}
    ${linha("Ganho de capital tributável = max(0, revenda − valor contábil)", R(c.ganhoCapital))}
    ${c.ganhoCapital > 0 ? linha(`Imposto s/ ganho (${fmtPctMC(raw.irpjPropPct)} IRPJ + ${fmtPctMC(raw.csllPropPct)} CSLL)`, "− " + R(c.impGanhoCap)) : ""}
    ${c.saldo > 0 ? linha(`Saldo devedor do financiamento após 12 meses (${c.np - 12} parcela(s) em aberto)`, "− " + R(c.saldo)) : ""}
    <div style="border-top:1px solid #E6E6E6;margin-top:6px;padding-top:6px">${linha("Revenda líquida = revenda − imposto − saldo devedor", R(c.revnd))}</div>
  `);

  const creditos = c.tribP > 0 ? bloco("4 · Créditos tributários (Lucro Real)", `
    ${linha(`PIS/COFINS (${fmtPctMC(raw.pisPropPct)})`, R(c.pisP))}
    ${linha(`IRPJ (${fmtPctMC(raw.irpjPropPct)})`, R(c.irjP))}
    ${linha(`CSLL (${fmtPctMC(raw.csllPropPct)})`, R(c.cslP))}
    <div style="border-top:1px solid #E6E6E6;margin-top:6px;padding-top:6px">${linha("Total de créditos", R(c.tribP))}</div>
  `) : "";

  const totalPropria = bloco("= Custo Efetivo — Frota Própria (ano 1)", `
    ${linha("Aquisição", R(c.aqAno))}
    ${linha("+ Operacional", R(c.opAno))}
    ${c.tribP > 0 ? linha("− Créditos tributários", "− " + R(c.tribP)) : ""}
    ${linha("− Revenda líquida", "− " + R(c.revnd))}
    <div style="border-top:2px solid #018444;margin-top:8px;padding-top:8px">${linha("Custo Efetivo", R(c.fAno))}</div>
  `);

  const aluguel = bloco("5 · Locação (aluguel)", `
    ${linha("Mensalidade × 12", R(c.valP))}
    ${c.admA > 0 ? linha("Administração do aluguel × 12", R(c.admA)) : ""}
    ${c.adicA > 0 ? linha("Adicionais (seguro/vidros/telemetria) × 12", R(c.adicA)) : ""}
    ${c.indispLoc > 0 ? linha("Indisponibilidade (contrato sem carro reserva)", R(c.indispLoc)) : ""}
    ${c.tribA > 0 ? linha(`Créditos tributários (PIS/COFINS ${R(c.pisA)} · IRPJ ${R(c.irjA)} · CSLL ${R(c.cslA)})`, "− " + R(c.tribA)) : ""}
    <div style="border-top:2px solid #018444;margin-top:8px;padding-top:8px">${linha("Custo Efetivo", R(c.cAlq))}</div>
  `);

  let periodoHtml = "";
  if (c.consorcio) {
    const cs = c.consorcio;
    periodoHtml = bloco(`6 · Consórcio — contrato de ${c.periodo.meses} meses`, `
      ${linha("Crédito disponível para a compra (após lance embutido)", R(cs.creditoDisp))}
      ${linha("Complemento em dinheiro = max(0, valor do carro − crédito)", R(cs.complemento))}
      ${linha("Parcelas restantes após lances (lance ÷ parcela amortiza o fim)", cs.nRest.toLocaleString("pt-BR", { maximumFractionDigits: 1 }))}
      ${linha("Parcelas pagas no contrato (reajuste anual)", R(cs.parcelasContrato))}
      ${linha("Saldo da carta ao fim do contrato", R(cs.saldoFim))}
      ${cs.ponte > 0 ? linha(`Locação-ponte (mês 1 a ${cs.m0})`, R(cs.ponte)) : ""}
      ${linha("TMA mensal × capital acumulado desembolsado", R(cs.oportunidade))}
      ${linha(`Custos de posse (${cs.mesesPosse} meses) − créditos`, R(cs.opexPosse - cs.creditosPosse))}
      ${linha("Revenda líquida (− saldo da carta, se vendida/cancelada)", R(cs.revendaLiq))}
      ${cs.creditoLocacao > 0 ? linha("Crédito no lado locação (venda/devolução da carta)", "− " + R(cs.creditoLocacao)) : ""}
      <div style="border-top:2px solid #018444;margin-top:8px;padding-top:8px">
        ${linha("Custo no contrato — Frota Própria (consórcio)", R(cs.custoPropria))}
        ${linha("Custo no contrato — Locação", R(cs.custoAluguel))}
      </div>
    `);
  } else if (c.periodo && c.periodo.meses !== 12) {
    const per = c.periodo;
    periodoHtml = bloco(`6 · Contrato completo — ${per.meses} meses (Parecer 11)`, `
      ${linha("Entrada + parcelas pagas no contrato", R(per.aqUnica))}
      ${per.saldoFim > 0 ? linha(`Saldo devedor ao fim (${c.np - per.meses} parcela(s) em aberto)`, "− " + R(per.saldoFim) + " (abatido da revenda)") : ""}
      ${linha("Custo de oportunidade / TMA no período", R(per.oporPeriodo))}
      ${linha("Operacional + manutenção no período", R(per.opexRecorr + per.manutTotal))}
      ${per.ativDesativ > 0 ? linha("Ativação + desativação (única)", R(per.ativDesativ)) : ""}
      ${per.tribP > 0 ? linha("− Créditos tributários no período", "− " + R(per.tribP)) : ""}
      ${linha("Valor contábil ao fim do contrato", R(per.valorContabilFim))}
      ${linha(`Referência de mercado ao fim (1º ano ${fmtPctMC(c.deprPct)}; demais ${fmtPctMC(per.taxaMercadoPos)} a.a.)`, R(per.revendaReferenciaFim))}
      ${linha(`Preço de revenda considerado${per.precoRevendaFim === per.revendaReferenciaFim ? " (referência)" : " (informado)"}`, R(per.precoRevendaFim))}
      ${per.ganhoCapFim > 0 ? linha("Imposto s/ ganho de capital ao fim", "− " + R(per.impGanhoCapFim)) : ""}
      ${linha("− Revenda líquida ao fim (revenda − imposto − saldo devedor)", "− " + R(per.revendaFimLiq))}
      <div style="border-top:2px solid #018444;margin-top:8px;padding-top:8px">
        ${linha("Custo no contrato — Frota Própria", R(per.custoPropria))}
        ${linha("Custo no contrato — Locação", R(per.custoAluguel))}
      </div>
    `);
  }

  return `${aquisicao}${operacional}${revenda}${creditos}${totalPropria}${aluguel}${periodoHtml}`;
}

/* ══════════════════════════════════════════
   CONSÓRCIO — bloco do PDF que substitui o "1º ano" + "contrato inteiro"
   quando a aquisição é via carta (c.consorcio, ver js/calc/consorcio.js)
══════════════════════════════════════════ */
const CONS_STATUS_LABEL = { contemplada: "Carta já contemplada", lance: "Não contemplada — lance agora", sorteio: "Não contemplada — aguardando sorteio" };
const CONS_DESTINO_LABEL = { vender: "vende/transfere a carta", manter: "mantém a carta para outro bem", cancelar: "cancela a cota" };

function renderConsorcioPDF(c, qtd) {
  const cs = c.consorcio, per = c.periodo;
  const cl  = (label, val, cls = "") => `<div class="cl${cls ? " " + cls : ""}"><span>${label}</span><strong>${val}</strong></div>`;
  const sub = txt => `<div class="cl-sub">${txt}</div>`;
  const avisos = [];
  if (cs.status === "sorteio") avisos.push(cs.semCarro
    ? `Contemplação prevista para o mês ${cs.m0}, depois do fim do contrato: o cliente ficaria o contrato inteiro sem o carro.`
    : `Contemplação por sorteio estimada no mês ${cs.m0} — data incerta. Carro em uso por ${cs.mesesPosse} dos ${per.meses} meses; antes disso, locação-ponte.`);
  if (cs.saldoAbatido > 0 && cs.revendaLiq < 0) avisos.push(`O saldo da carta ao fim (${R(cs.saldoFim)}) supera a revenda: a empresa precisaria quitar a diferença para vender o carro.`);
  if (cs.destino === "cancelar") avisos.push("Cota cancelada: a devolução só ocorre na contemplação por sorteio ou no encerramento do grupo (Lei 11.795/2008) — valor trazido a hoje pela TMA.");
  if (cs.creditoExcedente > 0) avisos.push(`Crédito excedente de ${R(cs.creditoExcedente)} não usado no carro (fora da conta).`);

  const ladoPropria = cs.destino === "manter"
    ? cl("(+) Crédito da carta usado no carro + complemento", R(cs.aquisicao))
    : (cs.lanceP > 0 ? cl("(+) Lance próprio", R(cs.lanceP)) : "")
      + (cs.complemento > 0 ? cl("(+) Complemento em dinheiro na compra", R(cs.complemento)) : "")
      + cl("(+) Parcelas da carta no contrato", R(cs.parcelasContrato));

  return `
<div class="stitle">Aquisição via Consórcio — Contrato de ${per.meses} meses</div>
<div style="font-size:10.5px;color:#6E6E6E;margin-bottom:10px;line-height:1.6"><strong>${CONS_STATUS_LABEL[cs.status]}</strong> · se optar pela locação, o cliente ${CONS_DESTINO_LABEL[cs.destino]}. ${cs.destino === "manter"
    ? "Como a carta seria mantida de qualquer forma, as parcelas são pagas nos dois cenários e se anulam; a frota própria consome o valor do crédito usado no carro."
    : "As parcelas pagas no contrato e o saldo da carta ao fim pesam na frota própria (o saldo é quitado com a revenda)."} Crédito e preço do carro considerados em valores de hoje; parcela reajustada 1× por ano.</div>
<div class="cost-wrap">
  <div class="cb">
    <div class="cb-title">Frota Própria (consórcio) — ${per.meses} meses</div>
    ${cs.ponte > 0 ? cl(`(+) Locação-ponte até contemplar (${Math.min(cs.m0, per.meses)} meses)`, R(cs.ponte)) : ""}
    ${ladoPropria}
    ${cs.lanceE > 0 ? sub(`Lance embutido de ${R(cs.lanceE)} descontado do crédito (disponível: ${R(cs.creditoDisp)})`) : ""}
    ${cl("(+) Custo de oportunidade / TMA sobre o capital desembolsado", R(cs.oportunidade))}
    ${cs.mesesPosse > 0 ? cl(`(+) Operacional + manutenção (${cs.mesesPosse} meses de posse)`, R(cs.opexPosse)) : ""}
    ${cs.creditosPosse > 0 ? cl("(−) Créditos tributários no período", R(cs.creditosPosse), "neg") : ""}
    ${cs.mesesPosse > 0 ? cl("(−) Revenda ao fim (líq. de imposto" + (cs.saldoAbatido > 0 ? " e do saldo da carta" : "") + ")", R(cs.revendaLiq), "neg") : ""}
    ${cs.saldoAbatido > 0 ? sub(`Revenda ${R(cs.revendaBruta)} − saldo da carta ${R(cs.saldoFim)}`) : ""}
    ${cl("= Custo no contrato", R(cs.custoPropria), "total")}
  </div>
  <div class="cb">
    <div class="cb-title">Locação — ${per.meses} meses</div>
    ${cl("(+) Locação no contrato (aluguel, adm., adicionais − créditos)", R(cs.custoAluguel + cs.creditoLocacao))}
    ${cs.creditoLocacao > 0 ? cl(cs.destino === "vender" ? "(−) Venda da carta" : "(−) Devolução da cota (valor presente)", R(cs.creditoLocacao), "neg") : ""}
    ${cl("= Custo no contrato", R(cs.custoAluguel), "total")}
  </div>
</div>
<div style="background:${cs.venc === "aluguel" ? "#EAF7EE" : cs.venc === "propria" ? "#FBEDED" : "#F2F2F2"};border:1px solid #E6E6E6;border-radius:10px;padding:12px 16px;margin:4px 0 14px;font-size:12px;color:#4A4A4A">
  <strong>${cs.venc === "aluguel" ? `Locação economiza ${R(cs.econAbs)} no contrato de ${per.meses} meses` : cs.venc === "propria" ? `Consórcio sai ${R(cs.econAbs)} mais barato no contrato de ${per.meses} meses` : `Empate técnico no contrato de ${per.meses} meses`}</strong>${qtd > 1 ? ` — ${R(cs.econAbs * qtd)} para a frota de ${qtd} veículos` : ""}
</div>
${avisos.length ? `<div style="font-size:10.5px;color:#A0631A;margin-bottom:20px;line-height:1.6">${avisos.map(a => "⚠ " + a).join("<br>")}</div>` : ""}`;
}

/* ══════════════════════════════════════════
   EXPORTAR PDF EXECUTIVO
══════════════════════════════════════════ */
function gerarConclusaoPDF(c, qtd) {
  const per = c.periodo;
  if (!per || (per.meses === 12 && !c.consorcio)) return gerarConclusao(c, qtd);

  const regime = c.perfil === "real" ? "Lucro Real" : "Lucro Presumido";
  const valorPrincipal = qtd > 1 ? R(per.econAbs * qtd) : R(per.econAbs);
  const unitTxt = qtd > 1
    ? ` (${R(per.econAbs)} por veículo, considerando uma frota de ${qtd} veículos)`
    : "";
  const pctSav = fmtPctEcon(pctEconomia(per.venc, per.econAbs, per.custoPropria, per.custoAluguel));
  /* Média anual = total do contrato ÷ anos. Não usar o snapshot do 1º ano aqui:
     é outra conta (revenda ao fim de 12 meses) e daria um segundo "por ano" diferente. */
  const mediaAno = per.econAbs / per.anos;
  const mediaTxt = ` Em média, isso equivale a <strong>${R(mediaAno * (qtd > 1 ? qtd : 1))} por ano</strong>${qtd > 1 ? ` (${R(mediaAno)} por veículo)` : ""} ao longo do contrato.`;

  if (per.venc === "aluguel") {
    return `Ao longo do contrato de <strong>${per.meses} meses</strong>, neste cenário de ${regime}, a locação gera uma economia total estimada de <strong>${valorPrincipal}</strong>${unitTxt} (${pctSav}% sobre o custo da frota própria no período). A locação transforma CAPEX em OPEX previsível, libera capital de giro e reduz a exposição à depreciação, aos custos administrativos e aos riscos operacionais de gestão de frota.${mediaTxt}`;
  }
  if (per.venc === "propria") {
    return `Ao longo do contrato de <strong>${per.meses} meses</strong>, neste cenário de ${regime}, a frota própria apresenta uma vantagem total estimada de <strong>${valorPrincipal}</strong>${unitTxt} (${pctSav}% abaixo do custo da locação no período). Recomenda-se considerar também a carga administrativa de gestão da frota, o risco de obsolescência e a imobilização de capital antes da decisão definitiva.${mediaTxt}`;
  }
  return `Ao longo do contrato de <strong>${per.meses} meses</strong>, as alternativas apresentam resultado economicamente equivalente (diferença inferior a R$ 50). A decisão deve considerar flexibilidade operacional, previsibilidade de custos, foco no negócio principal e gestão de ativos.`;
}

function exportPDF() {
  const c = lastCalc;
  if (Object.keys(c).length === 0) { alert("Execute o simulador antes de exportar."); return; }

  const agora      = new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"});
  const perfLabel  = perfil === "real" ? "Lucro Real" : "Lucro Presumido";
  const produtoLabel = c.produtoLoc === "gf" ? "GF — Gestão de Frotas" : "RAC PJ";
  const prazoLabel   = (c.prazoMeses || 12) + " meses";
  const usaContratoCompleto = !!(c.periodo && (c.periodo.meses !== 12 || c.consorcio));
  const resultadoDestaque = usaContratoCompleto ? c.periodo : c;
  const mesesDestaque = usaContratoCompleto ? c.periodo.meses : 12;
  const conclusao = gerarConclusaoPDF(c, qtdVeiculos);
  const logoClientHTML = clientLogoData
    ? `<img src="${clientLogoData}" style="max-height:50px;max-width:130px;object-fit:contain;display:block;margin-bottom:4px" alt="Logo Cliente"/>`
    : "";
  const nomeClientHTML = (clientName || loginCodigo)
    ? `<div style="font-size:14px;font-weight:700;color:#4A4A4A;margin-top:2px">${clientName || loginCodigo}</div>`
    : "";

  const winnerColor = resultadoDestaque.venc === "aluguel" ? "#018444"
                    : resultadoDestaque.venc === "propria" ? "#A01010"
                    :                        "#6E6E6E";
  const winnerLabel = resultadoDestaque.venc === "aluguel" ? "✓ LOCAÇÃO MAIS ECONÔMICA"
                    : resultadoDestaque.venc === "propria" ? "✓ FROTA PRÓPRIA MAIS ECONÔMICA"
                    :                        "⚖ EQUIVALÊNCIA ECONÔMICA";

  const rotuloResultado = qtdVeiculos > 1
    ? (resultadoDestaque.venc === "aluguel" ? "Economia Total da Frota" : resultadoDestaque.venc === "propria" ? "Vantagem Total da Frota" : "Diferença Total da Frota")
    : (resultadoDestaque.venc === "aluguel" ? "Economia por Veículo" : resultadoDestaque.venc === "propria" ? "Vantagem por Veículo" : "Diferença por Veículo");
  const rotuloPeriodo = usaContratoCompleto ? ` no Contrato de ${mesesDestaque} Meses` : " / Ano";
  const valorDestaque = resultadoDestaque.econAbs * (qtdVeiculos > 1 ? qtdVeiculos : 1);
  /* Média do contrato (total ÷ prazo) — só para contratos ≠ 12 meses. */
  const mediaAnoUn = usaContratoCompleto ? c.periodo.econAbs / c.periodo.anos : c.econAbs;
  const custoPropriaResumo = usaContratoCompleto ? c.periodo.custoPropria : c.fAno;
  const custoLocacaoResumo = usaContratoCompleto ? c.periodo.custoAluguel : c.cAlq;
  const pctDestaque = pctEconomia(resultadoDestaque.venc, resultadoDestaque.econAbs, custoPropriaResumo, custoLocacaoResumo);
  const pctDestaqueHTML = pctDestaque === null ? "" : `<div style="border-top:1px solid rgba(255,255,255,.2);margin-top:18px;padding-top:12px">
      <div style="font-size:15px;color:#fff;font-weight:700">≈ ${fmtPctEcon(pctDestaque)}% ${resultadoDestaque.venc === "aluguel" ? "sobre o custo da frota própria" : "abaixo do custo da locação"}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.65);margin-top:3px;line-height:1.45">Percentual específico desta simulação — varia conforme veículo, prazo, regime tributário e premissas informadas; não representa economia fixa.</div>
    </div>`;

  const totalBrutoFrota = c.aqAno + c.opAno + c.deprA;
  const barW = v => Math.max(4, Math.min(100, (Math.abs(v) / (totalBrutoFrota || 1)) * 100)).toFixed(0);

  const w = window.open("", "_blank", "width=900,height=760");
  if (!w) { alert("Permita popups para gerar o PDF."); return; }

  w.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Simulação — ${clientName || "Relatório Executivo"} — Localiza&Co</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:Inter,sans-serif;background:#fff;color:#4A4A4A;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;
}
.page{max-width:800px;margin:0 auto;padding:44px 48px}
.watermark{
  position:fixed;top:50%;left:50%;
  transform:translate(-50%,-50%) rotate(-35deg);
  font-size:92px;font-weight:900;
  color:rgba(120,222,31,.04);
  pointer-events:none;z-index:0;white-space:nowrap;
  font-family:'Playfair Display',serif;
}
/* HEADER */
.hdr{display:flex;justify-content:space-between;align-items:flex-start;
  margin-bottom:28px;padding-bottom:18px;
  border-bottom:2px solid rgba(120,222,31,.2);}
.hdr-left{display:flex;align-items:center;gap:14px}
.official-logo{display:block;width:auto;object-fit:contain;flex-shrink:0;background:#05662B}
.official-logo.header{height:36px}
.official-logo.footer-mark{height:22px}
.logo-sq{width:46px;height:46px;background:#018444;border-radius:11px;
  display:flex;align-items:center;justify-content:center;
  font-size:17px;font-weight:900;color:#fff;flex-shrink:0}
.logo-tx{font-size:20px;font-weight:800;color:#4A4A4A}
.logo-tx em{color:#018444;font-style:normal}
.logo-sb{font-size:11px;color:#6E6E6E;font-weight:500;margin-top:2px}
.hdr-right{text-align:right}
.meta{font-size:11px;color:#6E6E6E;line-height:1.8}
.meta strong{color:#4A4A4A;font-weight:600}
/* DISCLAIMER */
.disc{
  background:#FFFBEC;border:1px solid rgba(200,160,0,.3);
  border-radius:8px;padding:10px 14px;margin-bottom:24px;
  font-size:11px;color:#7A5000;display:flex;align-items:flex-start;gap:8px;line-height:1.5;
}
/* KPI ROW */
.kpi-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:22px}
.kpi{background:#F2F2F2;border:1px solid #E6E6E6;border-radius:10px;padding:16px;text-align:center}
.kpi.w{background:#018444;border-color:#018444}
.kpi.w .kl,.kpi.w .kv,.kpi.w .ks{color:#fff}
.kpi.ek{background:#EAF7EE;border-color:rgba(120,222,31,.25)}
.kl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6E6E6E;margin-bottom:6px}
.kv{font-size:24px;font-weight:800;letter-spacing:-1.5px;color:#4A4A4A;font-family:'Playfair Display',serif}
.ks{font-size:11px;color:#6E6E6E;margin-top:3px}
/* VERDICT */
.verdict{
  background:${winnerColor};border-radius:12px;
  padding:20px 24px;margin-bottom:24px;
  display:flex;justify-content:space-between;align-items:center;
}
.vd-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.75);margin-bottom:5px}
.vd-title{font-size:20px;font-weight:800;color:#fff;letter-spacing:-.4px}
.vd-right{text-align:right}
.vd-rlbl{font-size:10px;color:rgba(255,255,255,.65);margin-bottom:4px}
.vd-val{font-size:34px;font-weight:900;letter-spacing:-2.5px;color:#fff;font-family:'Playfair Display',serif}
.vd-per{font-size:11px;color:rgba(255,255,255,.65);margin-top:3px}
/* SECTION TITLES */
.stitle{
  font-size:10px;font-weight:700;text-transform:uppercase;
  letter-spacing:1.5px;color:#018444;
  margin-bottom:12px;display:flex;align-items:center;gap:8px;
}
.stitle::after{content:'';flex:1;height:1px;background:#C0D8C6}
.contract-detail{break-before:page;page-break-before:always}
/* COST BLOCKS */
.cost-wrap{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.cb{background:#F2F2F2;border:1px solid #E6E6E6;border-radius:10px;padding:16px}
.cb-title{
  font-size:11px;font-weight:700;text-transform:uppercase;
  letter-spacing:.8px;color:#6E6E6E;
  margin-bottom:12px;padding-bottom:9px;border-bottom:1px solid #E6E6E6;
}
.cl{display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;font-size:12px;gap:8px}
.cl span{color:#6E6E6E;flex:1}
.cl strong{color:#4A4A4A;font-weight:600;white-space:nowrap}
.cl.neg strong{color:#018444}
.cl.total{border-top:2px solid #018444;margin-top:8px;padding-top:10px}
.cl.total span{font-weight:700;font-size:13px}
.cl.total strong{font-size:19px;font-weight:800;color:#018444;font-family:'Playfair Display',serif}
.cl-sub{font-size:10px;color:#919191;padding:2px 0 2px 14px;line-height:1.5}
.barmini{height:4px;background:#E6E6E6;border-radius:2px;margin-top:3px;overflow:hidden}
.bf{height:100%;border-radius:2px;background:#018444}
.bf.orange{background:#C0392B}
/* CONCLUSION */
.concl{
  background:#F2F2F2;border:1px solid #E6E6E6;
  border-left:4px solid #018444;border-radius:8px;
  padding:16px 18px;margin-bottom:24px;
}
.concl-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#018444;margin-bottom:8px}
.concl-text{font-size:13px;color:#4A4A4A;line-height:1.75}
/* FOOTER */
.footer{
  padding-top:16px;border-top:1px solid #E6E6E6;
  display:flex;justify-content:space-between;align-items:flex-end;
}
.footer-l{display:flex;align-items:center;gap:8px}
.footer-logo{width:28px;height:28px;background:#018444;border-radius:6px;
  display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff}
.footer-brand{font-size:12px;font-weight:700;color:#018444}
.footer-sub{font-size:10px;color:#919191;margin-top:2px}
.footer-disc{font-size:9px;color:#B0B0B0;text-align:right;max-width:320px;line-height:1.5}
@media print{
  .page{padding:24px 28px}
  .watermark{position:fixed}
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
</style>
</head>
<body>
<div class="watermark">SIMULAÇÃO</div>
<div class="page">

<!-- HEADER -->
<div class="hdr">
  <div class="hdr-left">
    <img src="${LOGO_LOCALIZA}" alt="Localiza" class="official-logo header"/>
    <div class="logo-sb">Simulador de Frota · Relatório Executivo</div>
  </div>
  <div class="hdr-right">
    ${logoClientHTML}${nomeClientHTML}
    <div class="meta" style="margin-top:6px">
      <div>Data: <strong>${agora}</strong></div>
      <div>Executivo de Vendas: <strong>${loginMatricula || "—"}</strong>${loginExecMatricula ? ` (mat. ${loginExecMatricula})` : ""}</div>
      <div>Qtd. de Veículos: <strong>${qtdVeiculos > 1 ? qtdVeiculos + " veículos" : "1 veículo"}</strong></div>
      <div>Regime Fiscal: <strong>${perfLabel}</strong></div>
      <div>Produto de Locação: <strong>${produtoLabel} (${prazoLabel})</strong></div>
      <div>Categoria: <strong>${el("categoriaVeiculo")?.value || "—"}</strong></div>
      ${veiculoSimulado ? `<div>Veículo Simulado: <strong>${veiculoSimulado}</strong></div>` : ""}
    </div>
  </div>
</div>

<!-- DISCLAIMER -->
<div class="disc">
  <span style="font-size:15px;flex-shrink:0">⚠️</span>
  <div><strong>DOCUMENTO DE SIMULAÇÃO – MATERIAL NÃO VINCULANTE.</strong> Este relatório tem finalidade exclusivamente informativa e comparativa, com base nos parâmetros inseridos no simulador. Não constitui proposta comercial, oferta, orçamento, recomendação financeira, consultoria jurídica ou tributária, nem gera obrigação de contratação para a Localiza&amp;Co ou suas afiliadas. Os valores, premissas e economias estimadas são meramente indicativos e podem variar conforme condições comerciais, disponibilidade, perfil do cliente, análise cadastral e regras fiscais aplicáveis. Qualquer contratação dependerá de proposta comercial formal, específica e válida, emitida pelos canais autorizados da Localiza&amp;Co.</div>
</div>

<!-- HERO ECONÔMICO -->
<div style="background:${winnerColor};border-radius:14px;padding:28px 32px;margin-bottom:16px">
  <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:rgba(255,255,255,.65);margin-bottom:12px">${winnerLabel}</div>
  <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap">
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,.8);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">${rotuloResultado}${rotuloPeriodo}</div>
      <div style="font-size:52px;font-weight:900;color:#fff;font-family:'Playfair Display',serif;letter-spacing:-2.5px;line-height:1">${R(valorDestaque)}</div>
      <div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:8px;font-weight:500">${usaContratoCompleto ? (qtdVeiculos > 1 ? `≈ ${R(mediaAnoUn * qtdVeiculos)}/ano · ${R(mediaAnoUn * qtdVeiculos / 12)}/mês em média · ${qtdVeiculos} veículos` : `≈ ${R(mediaAnoUn)}/ano · ${R(mediaAnoUn / 12)}/mês em média · por veículo`) : (qtdVeiculos > 1 ? qtdVeiculos + " veículos · " + R(c.econAbs * qtdVeiculos / 12) + "/mês" : R(c.econAbs/12) + "/mês · por veículo")}</div>
    </div>
    ${qtdVeiculos > 1 ? `<div style="text-align:right;border-left:1px solid rgba(255,255,255,.2);padding-left:24px">
      <div style="font-size:11px;color:rgba(255,255,255,.8);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Por Veículo / ${usaContratoCompleto ? "Contrato" : "Ano"}</div>
      <div style="font-size:32px;font-weight:900;color:#fff;font-family:'Playfair Display',serif;letter-spacing:-1.5px;line-height:1">${R(resultadoDestaque.econAbs)}</div>
      <div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:8px;font-weight:500">${usaContratoCompleto ? `≈ ${R(mediaAnoUn)}/ano em média · por unidade` : `${R(c.econAbs/12)}/mês &nbsp;·&nbsp; por unidade`}</div>
    </div>` : ""}
  </div>
  ${pctDestaqueHTML}
</div>

<!-- CUSTOS DE REFERÊNCIA -->
<div style="display:grid;grid-template-columns:${qtdVeiculos > 1 ? "repeat(3,1fr)" : "1fr 1fr"};gap:12px;margin-bottom:24px">
  ${qtdVeiculos > 1 ? `<div style="background:#F2F2F2;border:1px solid #E6E6E6;border-radius:10px;padding:14px;text-align:center">
    <div style="font-size:10px;color:#6E6E6E;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Qtd. de Veículos</div>
    <div style="font-size:26px;font-weight:900;color:#4A4A4A;font-family:'Playfair Display',serif;letter-spacing:-1px">${qtdVeiculos}</div>
    <div style="font-size:10px;color:#919191;margin-top:2px">frota analisada</div>
  </div>` : ""}
  <div style="background:#F2F2F2;border:1px solid #E6E6E6;border-radius:10px;padding:14px;text-align:center">
    <div style="font-size:10px;color:#6E6E6E;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Custo Frota Própria${usaContratoCompleto ? " — Contrato" : ""}</div>
    <div style="font-size:20px;font-weight:800;color:#4A4A4A;font-family:'Playfair Display',serif;letter-spacing:-.8px">${R(custoPropriaResumo * (qtdVeiculos > 1 ? qtdVeiculos : 1))}</div>
    <div style="font-size:10px;color:#919191;margin-top:2px">${usaContratoCompleto ? (qtdVeiculos > 1 ? `${mesesDestaque} meses · ${R(custoPropriaResumo)}/un.` : `${mesesDestaque} meses · ${R(custoPropriaResumo/mesesDestaque)}/mês em média`) : (qtdVeiculos > 1 ? qtdVeiculos + " veículos / ano · " + R(c.fAno) + "/un." : "por veículo / ano · " + R(c.fAno/12) + "/mês")}</div>
  </div>
  <div style="background:#F2F2F2;border:1px solid #E6E6E6;border-radius:10px;padding:14px;text-align:center">
    <div style="font-size:10px;color:#6E6E6E;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Custo Locação${usaContratoCompleto ? " — Contrato" : ""}</div>
    <div style="font-size:20px;font-weight:800;color:#4A4A4A;font-family:'Playfair Display',serif;letter-spacing:-.8px">${R(custoLocacaoResumo * (qtdVeiculos > 1 ? qtdVeiculos : 1))}</div>
    <div style="font-size:10px;color:#919191;margin-top:2px">${usaContratoCompleto ? (qtdVeiculos > 1 ? `${mesesDestaque} meses · ${R(custoLocacaoResumo)}/un.` : `${mesesDestaque} meses · ${R(custoLocacaoResumo/mesesDestaque)}/mês em média`) : (qtdVeiculos > 1 ? qtdVeiculos + " veículos / ano · " + R(c.cAlq) + "/un." : "por veículo / ano · " + R(c.cAlq/12) + "/mês")}</div>
  </div>
</div>

${c.consorcio ? renderConsorcioPDF(c, qtdVeiculos) : `<!-- DETALHAMENTO -->
<div class="stitle">${usaContratoCompleto ? "Referência do Primeiro Ano" : "Detalhamento dos Custos"}</div>
${usaContratoCompleto ? `<div style="font-size:10.5px;color:#6E6E6E;margin:-3px 0 10px;line-height:1.5">Visão isolada dos primeiros 12 meses, mantida como referência complementar. O resultado principal deste relatório considera o contrato completo.</div>` : ""}
<div class="cost-wrap">
  <div class="cb">
    <div class="cb-title">Frota Própria</div>
    <div class="cl"><span>(+) Aquisição — entrada + parcelas (ano 1)</span><strong>${R(c.entr + c.gParc)}</strong></div>
    <div class="barmini"><div class="bf" style="width:${barW(c.entr + c.gParc)}%"></div></div>
    ${c.saldo > 0 ? `<div class="cl-sub">Saldo devedor após 12 meses: ${R(c.saldo)} (abatido do valor de revenda)</div>` : ""}
    <div class="cl"><span>(+) Custo de oportunidade / TMA (ano 1)</span><strong>${R(c.opor)}</strong></div>
    <div class="cl"><span>(+) Operação + Depreciação</span><strong>${R(c.opAno + c.deprA)}</strong></div>
    <div class="barmini"><div class="bf orange" style="width:${barW(c.opAno + c.deprA)}%"></div></div>
    <div class="cl neg"><span>(−) Créditos Tributários</span><strong>${R(c.tribP)}</strong></div>
    <div class="cl-sub">PIS/COFINS ${R(c.pisP)} · IRPJ ${R(c.irjP)} · CSLL ${R(c.cslP)}</div>
    <div class="cl neg"><span>(−) Valor de Revenda</span><strong>${R(c.revnd)}</strong></div>
    <div class="cl-sub">Preço estimado: ${R(c.precoRevenda)}${c.ganhoCapital > 0 ? ` · Imposto s/ ganho de capital: ${R(c.impGanhoCap)}` : ""}</div>
    <div class="cl total"><span>= Custo Efetivo</span><strong>${R(c.fAno)}</strong></div>
  </div>
  <div class="cb">
    <div class="cb-title">Locação (Aluguel) — ${produtoLabel}</div>
    <div class="cl"><span>(+) Total de Aluguel (12×)</span><strong>${R(c.valP)}</strong></div>
    <div class="barmini"><div class="bf" style="width:${barW(c.valP)}%"></div></div>
    <div class="cl"><span>(+) Custo Administrativo</span><strong>${R(c.admA)}</strong></div>
    ${c.adicA > 0 ? `<div class="cl"><span>(+) Adicionais (seguro/vidros/telemetria)</span><strong>${R(c.adicA)}</strong></div>` : ""}
    ${c.indispLoc > 0 ? `<div class="cl"><span>(+) Indisponibilidade — contrato sem carro reserva</span><strong>${R(c.indispLoc)}</strong></div>` : ""}
    <div class="cl neg" style="margin-top:8px"><span>(−) Créditos Tributários</span><strong>${R(c.tribA)}</strong></div>
    <div class="cl-sub">PIS/COFINS ${R(c.pisA)} · IRPJ ${R(c.irjA)} · CSLL ${R(c.cslA)}</div>
    <div class="cl total"><span>= Custo Efetivo</span><strong>${R(c.cAlq)}</strong></div>
    <div class="cl-sub">Aluguel bruto no contrato (${prazoLabel}): ${R(c.valorTotalContrato)}</div>
  </div>
</div>

${c.periodo && c.periodo.meses !== 12 ? `
<!-- COMPARAÇÃO NO CONTRATO INTEIRO -->
<section class="contract-detail">
<div class="stitle">Detalhamento do Contrato Inteiro — ${c.periodo.meses} meses</div>
<div style="font-size:10.5px;color:#6E6E6E;margin-bottom:10px;line-height:1.6">Custos classificados conforme o Parecer 11: aquisição, ativação/desativação e revenda entram uma única vez; aluguel, manutenção, seguro, IPVA, custo de capital e créditos acompanham o prazo; depreciação é a quota mensal aplicada ao número de meses do contrato; o saldo devedor do financiamento ao fim é quitado com o produto da revenda. Não é a conta anual multiplicada pelo número de anos. (Para 12 meses, esta comparação coincide com o quadro anual acima.)</div>
${c.np > 1 && c.np > c.periodo.meses ? `<div style="font-size:10px;color:#A0631A;margin-bottom:10px;line-height:1.5">⚠ O financiamento (${c.np} meses) é mais longo que o prazo do contrato (${c.periodo.meses} meses): ${c.np - c.periodo.meses} parcela(s) (${R(c.periodo.saldoFim)}) seguem em aberto ao fim e são abatidas do valor de revenda. Para uma compra que a empresa manteria pelo prazo do contrato, o mais realista é financiar em prazo próximo ao de uso.</div>` : ""}
<div class="cost-wrap">
  <div class="cb">
    <div class="cb-title">Frota Própria — ${c.periodo.meses} meses</div>
    <div class="cl"><span>(+) Aquisição — entrada + parcelas pagas no contrato</span><strong>${R(c.periodo.aqUnica)}</strong></div>
    ${c.periodo.saldoFim > 0 ? `<div class="cl-sub">Saldo devedor ao fim do contrato: ${R(c.periodo.saldoFim)} (abatido do valor de revenda)</div>` : ""}
    <div class="cl"><span>(+) Custo de oportunidade / TMA no período</span><strong>${R(c.periodo.oporPeriodo)}</strong></div>
    <div class="cl"><span>(+) Operacional + manutenção no período</span><strong>${R(c.periodo.opexRecorr + c.periodo.manutTotal)}</strong></div>
    <div class="cl-sub">Manutenção (curva por idade): ${R(c.periodo.manutTotal)}</div>
    ${c.periodo.ativDesativ > 0 ? `<div class="cl"><span>(+) Ativação + desativação (única)</span><strong>${R(c.periodo.ativDesativ)}</strong></div>` : ""}
    <div class="cl neg"><span>(−) Créditos tributários no período</span><strong>${R(c.periodo.tribP)}</strong></div>
    <div class="cl neg"><span>(−) Revenda ao fim (líq. de imposto)</span><strong>${R(c.periodo.revendaFimLiq)}</strong></div>
    <div class="cl-sub">Valor contábil ao fim: ${R(c.periodo.valorContabilFim)} · preço estimado: ${R(c.periodo.precoRevendaFim)}${c.periodo.precoRevendaFim === c.periodo.revendaReferenciaFim ? " (referência de mercado)" : ""}${c.periodo.ganhoCapFim > 0 ? ` · imposto s/ ganho: ${R(c.periodo.impGanhoCapFim)}` : ""}</div>
    <div class="cl total"><span>= Custo no contrato</span><strong>${R(c.periodo.custoPropria)}</strong></div>
  </div>
  <div class="cb">
    <div class="cb-title">Locação — ${c.periodo.meses} meses</div>
    <div class="cl"><span>(+) Aluguel (${c.periodo.meses}×)</span><strong>${R(c.periodo.locAluguel)}</strong></div>
    <div class="cl"><span>(+) Administrativo</span><strong>${R(c.periodo.locAdm)}</strong></div>
    ${c.periodo.locAdic > 0 ? `<div class="cl"><span>(+) Adicionais</span><strong>${R(c.periodo.locAdic)}</strong></div>` : ""}
    ${c.periodo.locIndisp > 0 ? `<div class="cl"><span>(+) Indisponibilidade (sem carro reserva)</span><strong>${R(c.periodo.locIndisp)}</strong></div>` : ""}
    <div class="cl neg"><span>(−) Créditos tributários no período</span><strong>${R(c.periodo.locTrib)}</strong></div>
    <div class="cl total"><span>= Custo no contrato</span><strong>${R(c.periodo.custoAluguel)}</strong></div>
  </div>
</div>
<div style="background:${c.periodo.venc === "aluguel" ? "#EAF7EE" : c.periodo.venc === "propria" ? "#FBEDED" : "#F2F2F2"};border:1px solid #E6E6E6;border-radius:10px;padding:12px 16px;margin:4px 0 20px;font-size:12px;color:#4A4A4A">
  <strong>${c.periodo.venc === "aluguel" ? `Locação economiza ${R(c.periodo.econAbs)} no contrato de ${c.periodo.meses} meses` : c.periodo.venc === "propria" ? `Frota própria sai ${R(c.periodo.econAbs)} mais barata no contrato de ${c.periodo.meses} meses` : `Empate técnico no contrato de ${c.periodo.meses} meses`}</strong>${qtdVeiculos > 1 ? ` — ${R(c.periodo.econAbs * qtdVeiculos)} para a frota de ${qtdVeiculos} veículos` : ""}
</div>
</section>` : ""}
`}

${c.produtoLoc === "gf" ? `
<!-- OBSERVAÇÕES GF -->
<div class="stitle">Observações do Contrato GF</div>
<div style="background:#F7F7F7;border:1px solid #E6E6E6;border-radius:10px;padding:16px 18px;margin-bottom:20px;font-size:11px;color:#4A4A4A;line-height:1.7">
  ${c.franquiaKm ? `<div>Franquia de Km (referência contratual): <strong>${c.franquiaKm}</strong></div>` : ""}
  <div>Carro reserva: <strong>${c.carroReserva ? "incluído no contrato" : "não incluído — custo de indisponibilidade aplicado também ao lado do aluguel"}</strong></div>
  ${c.projecaoManutencao ? `<div style="margin-top:6px">Projeção de manutenção ao longo do contrato — aumento de <strong>${(+c.manutIncrementoAnualPct).toFixed(1)}% a.a.</strong> informado na simulação <em>(estimativa, pendente de validação contábil)</em>: ${c.projecaoManutencao.map(a => `Ano ${a.ano}: ${a.pct.toFixed(1)}%${a.fracao < 1 ? " (parcial)" : ""} — ${R(a.valor)}`).join(" · ")} — total: <strong>${R(c.manutTotalContrato)}</strong></div>` : ""}
  ${c.riscoReclassificacaoArrendamento ? `<div style="margin-top:6px;color:#A0631A">⚠ Prazo ≥ 45 meses se aproxima de 75% da vida útil fiscal (60 meses) — risco de reclassificação para arrendamento mercantil financeiro (Res. BACEN 2.309/96), o que mudaria a dedutibilidade do aluguel. Confirmar com a área contábil antes de fechar o contrato.</div>` : ""}
</div>` : ""}

<!-- CONCLUSÃO -->
<div class="stitle">Conclusão da Análise</div>
<div class="concl">
  <div class="concl-title">Análise Comparativa — ${clientName || "Simulação"}</div>
  <div class="concl-text">${conclusao}</div>
</div>


${el("incluirMemoriaCalculo")?.checked ? `
<!-- MEMÓRIA DE CÁLCULO -->
<div class="stitle" style="margin-top:26px">Memória de Cálculo — Como Chegamos Nesses Números</div>
<div style="font-size:10px;color:#919191;margin-bottom:14px;line-height:1.5">Apêndice técnico: cada valor do resumo acima, com a fórmula e os insumos que o geraram. Use pra auditar ou explicar qualquer linha específica.</div>
${renderMemoriaCalculo(c, buildRawFromDom())}
` : ""}

<!-- FOOTER -->
<div class="footer">
  <div class="footer-l">
    <img src="${LOGO_LOCALIZA}" alt="Localiza" class="official-logo footer-mark"/>
    <div>
      <div class="footer-brand">Simulador de Frota</div>
      <div class="footer-sub">${agora}${clientName ? " · " + clientName : ""} · Uso interno</div>
    </div>
  </div>
  <div class="footer-disc">
    Material não vinculante. Veja o aviso completo no início deste documento.
  </div>
</div>

</div>
<script>window.onload = () => window.print();<\/script>
</body>
</html>`);
  w.document.close();
}

/* ── PDF Frota Composta ── */
function exportPDFFrota() {
  if (!frota.length) { alert("Adicione ao menos um modelo de veículo antes de exportar."); return; }
  const resultados = frota.map(m => ({ ...calcModelo(m, fcPerfil), qtd: +m.qtd || 1, descricao: m.descricao || "Veículo" }));
  let totFAno = 0, totCAlq = 0, totQtd = 0, totOtimo = 0;
  resultados.forEach(r => {
    totFAno  += r.fAno  * r.qtd;
    totCAlq  += r.cAlq  * r.qtd;
    totQtd   += r.qtd;
    totOtimo += Math.min(r.fAno, r.cAlq) * r.qtd;
  });
  const econTotal     = totFAno - totCAlq;
  const vencGlobal    = econTotal >  50 ? "Locação" : econTotal < -50 ? "Frota Própria" : "Empate Técnico";
  const poupanca      = Math.abs(econTotal);
  const economiaOtima = Math.max(0, Math.min(totFAno, totCAlq) - totOtimo);
  const now = new Date().toLocaleDateString("pt-BR");

  const rows = resultados.map(r => {
    const vOtimo = Math.min(r.fAno, r.cAlq);
    const rec    = r.venc === "aluguel" ? "Locar" : r.venc === "propria" ? "Comprar" : "Qualquer";
    const prod   = r.produtoLoc === "gf" ? `GF ${r.prazoMeses}m` : "RAC PJ";
    return `<tr><td>${r.descricao}<br><small style="color:#919191">${prod}</small></td><td style="text-align:center">${r.qtd}</td><td>${R(r.fAno)}</td><td>${R(r.cAlq)}</td><td><b>${rec}</b></td><td>${R(vOtimo * r.qtd)}</td></tr>`;
  }).join("");

  const memoriaFC = el("fc_incluirMemoriaCalculo")?.checked
    ? `<h2>Memória de Cálculo — Por Categoria</h2>
       <div style="font-size:8.5pt;color:#919191;margin-bottom:14px;line-height:1.5">Apêndice técnico: a fórmula por trás de cada linha, categoria a categoria.</div>
       ${frota.map((m, i) => `
         <div style="margin-bottom:22px">
           <div style="font-size:11pt;font-weight:700;color:#4A4A4A;margin-bottom:8px">${resultados[i].descricao} <span style="font-weight:400;color:#919191;font-size:9pt">(${resultados[i].qtd} un.)</span></div>
           ${renderMemoriaCalculo(resultados[i], buildRawFromModelo(m))}
         </div>
       `).join("")}`
    : "";

  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Frota Composta — Localiza&amp;Co</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;font-size:11pt;color:#4A4A4A;padding:28px}
h1{font-size:18pt;color:#018444;border-bottom:3px solid #78DE1F;padding-bottom:8px;margin-bottom:16px}
h2{font-size:12pt;color:#018444;margin:20px 0 8px}.meta{color:#6E6E6E;font-size:9pt;margin-bottom:16px}
.hero{background:linear-gradient(135deg,#003418,#018444);color:#fff;border-radius:8px;padding:14px 18px;margin-bottom:18px}
.hero-title{font-size:14pt;font-weight:700;margin-bottom:4px}.hero-sub{font-size:9.5pt;opacity:.85}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
.kpi{border:1px solid #E6E6E6;border-radius:8px;padding:10px;text-align:center}
.kpi-label{font-size:7.5pt;color:#6E6E6E;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.kpi-val{font-size:13pt;font-weight:700;color:#018444}.kpi-sub{font-size:7.5pt;color:#919191}
.kpi.accent{background:#78DE1F;border-color:#78DE1F}
.kpi.accent .kpi-label,.kpi.accent .kpi-sub{color:rgba(0,52,24,.7)}.kpi.accent .kpi-val{color:#003418}
table{width:100%;border-collapse:collapse;font-size:10pt}
th{background:#018444;color:#fff;padding:7px 9px;text-align:left}
td{padding:6px 9px;border-bottom:1px solid #eee}tr:nth-child(even)td{background:#f9f9f9}
.note{margin-top:12px;font-size:8pt;color:#888;font-style:italic}
.footer{margin-top:28px;font-size:8pt;color:#bbb;text-align:center;border-top:1px solid #eee;padding-top:8px}
@media print{body{padding:8px}}</style></head><body>
<h1>⚡ Frota Composta — Análise Estratégica</h1>
<div class="meta">Gerado em ${now} · Executivo de Vendas: <strong>${loginMatricula || "—"}</strong>${loginExecMatricula ? ` (mat. ${loginExecMatricula})` : ""}${(clientName || loginCodigo) ? ` · Cliente: <strong>${clientName || loginCodigo}</strong>` : ""} · Regime: ${fcPerfil === "real" ? "Lucro Real" : "Lucro Presumido"} · ${totQtd} veículos em ${resultados.length} categorias</div>
<div class="hero">
  <div class="hero-title">Recomendação Global: ${vencGlobal}</div>
  <div class="hero-sub">Economia estimada vs. alternativa: ${R(poupanca)}/ano · Estratégia ótima (mix): ${R(totOtimo)}/ano</div>
</div>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-label">Total Frota Própria</div><div class="kpi-val">${R(totFAno)}</div><div class="kpi-sub">/ano</div></div>
  <div class="kpi"><div class="kpi-label">Total Locação</div><div class="kpi-val">${R(totCAlq)}</div><div class="kpi-sub">/ano</div></div>
  <div class="kpi accent"><div class="kpi-label">Estratégia Ótima</div><div class="kpi-val">${R(totOtimo)}</div><div class="kpi-sub">mix ótimo por categoria</div></div>
  <div class="kpi"><div class="kpi-label">Ganho com Mix Ótimo</div><div class="kpi-val">${R(economiaOtima)}</div><div class="kpi-sub">vs. estratégia única</div></div>
</div>
<h2>Detalhamento por Categoria</h2>
<table><thead><tr><th>Categoria</th><th>Qtd</th><th>Própria/un.</th><th>Locação/un.</th><th>Recomendação</th><th>Custo Ótimo Total</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="note">Custo Ótimo = menor custo unitário por categoria × quantidade. A estratégia ótima pode combinar locação e compra conforme o perfil de cada modelo.</p>
${memoriaFC}
<div style="background:#FFFBEC;border:1px solid rgba(200,160,0,.3);border-left:4px solid #4A4A4A;border-radius:6px;padding:12px 14px;margin-top:24px;font-size:8pt;color:#4A4A4A;line-height:1.6">
<strong>DOCUMENTO DE SIMULAÇÃO – MATERIAL NÃO VINCULANTE.</strong> Este relatório tem finalidade exclusivamente informativa e comparativa, com base nos parâmetros inseridos no simulador. Não constitui proposta comercial, oferta, orçamento, recomendação financeira, consultoria jurídica ou tributária, nem gera obrigação de contratação para a Localiza&amp;Co ou suas afiliadas. Os valores, premissas e economias estimadas são meramente indicativos e podem variar conforme condições comerciais, disponibilidade, perfil do cliente, análise cadastral e regras fiscais aplicáveis. Qualquer contratação dependerá de proposta comercial formal, específica e válida, emitida pelos canais autorizados da Localiza&amp;Co.
</div>
<div class="footer">Simulador Estratégico de Frota · Localiza&amp;Co · Material não vinculante. Veja o aviso acima.</div>
<script>window.onload=()=>window.print()<\/script>
</body></html>`);
  w.document.close();
}
