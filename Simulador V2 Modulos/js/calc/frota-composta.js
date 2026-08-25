// Frota Composta tab: pure calc functions (calcModelo, calcFrota)
/* ══════════════════════════════════════════
   FROTA COMPOSTA
══════════════════════════════════════════ */

/* ── Pure calc por modelo ── */
function calcModelo(m, perfil) {
  const vBruto = +m.valorVeiculoBruto || 0;
  const desc   = vBruto * pc(+m.descontoPct || 0);
  const vV     = vBruto - desc;
  const entr   = vV * pc(+m.entradaPct || 0);
  const fin    = Math.max(0, vV - entr);
  const np     = +m.parcelas || 1;
  const jm     = pc(+m.jurosMensalPct || 0);
  const parc   = pmt(fin, jm, np);
  const totP   = parc * np;
  const gParc  = np <= 12 ? totP : parc * 12;
  const saldo  = np <= 12 ? 0    : Math.max(0, totP - gParc);
  const baseOp = entr + gParc;
  const opor   = baseOp * pc(+m.oportunidadePct || 0);
  const aqAno  = entr + gParc + opor;

  const manut  = vV * pc(+m.manutencaoPct || 0);
  const seg    = vV * pc(+m.seguroPct || 0);
  const ipvaR  = parseFloat(m.estado) || 0;
  const ipva   = vV * pc(ipvaR);
  const lic    = +m.licenciamentoAno || 0;
  const parad  = +m.indisponibilidadeAno || 0;
  const admF   = (+m.admFrotaMensal || 0) * 12;
  const ativ    = +m.custoAtivacao || 0;
  const desativ = +m.custoDesativacao || 0;
  const opAno  = manut + seg + ipva + lic + parad + admF + ativ + desativ;

  const deprPct = m.modoDepreciacao === "contabil" ? 20 : m.modoDepreciacao === "utilitario" ? 25 : (+m.depreciacaoPct || 10);
  const deprA   = vV * pc(deprPct);
  const valorContabil = Math.max(0, vV - deprA - saldo);

  const precoRevenda = (+m.precoRevendaEstimado || 0) > 0 ? +m.precoRevendaEstimado : valorContabil;
  const ganhoCapital = Math.max(0, precoRevenda - valorContabil);
  const impGanhoCap  = ganhoCapital * (pc(+m.irpjPropPct || 0) + pc(+m.csllPropPct || 0));
  const revnd        = Math.max(0, precoRevenda - impGanhoCap);

  const basePis = perfil === "real" ? Math.max(0, manut + deprA) : 0;
  const pisP    = basePis * pc(+m.pisPropPct || 0);
  const baseIr  = perfil === "real" ? Math.max(0, manut + deprA - pisP) : 0;
  const irjP    = baseIr  * pc(+m.irpjPropPct || 0);
  const cslP    = baseIr  * pc(+m.csllPropPct || 0);
  const tribP   = pisP + irjP + cslP;

  const fAnoR   = aqAno + opAno - tribP - revnd;
  const fAnoPr  = aqAno + opAno - revnd;
  const fAno    = perfil === "real" ? fAnoR : fAnoPr;

  const alqM   = +m.aluguelMensal || 0;
  const valP   = 12 * alqM;
  const admA   = (+m.admAluguel || 0) * 12;
  const adicA  = ((+m.adicSeguroTotal || 0) + (+m.adicVidros || 0) + (+m.adicTelemetria || 0)) * 12;
  const atFim  = m.atividadeFim === "sim";
  const baseA  = perfil === "real" ? valP : 0;
  const pisA   = atFim ? baseA * pc(+m.pisPropPct || 0) : 0;
  const irjA   = baseA * pc(+m.irpjPropPct || 0);
  const cslA   = baseA * pc(+m.csllPropPct || 0);
  const tribA  = pisA + irjA + cslA;
  const totAlq = valP + admA + adicA;
  const cAlq   = totAlq - tribA;

  const produtoLoc = m.produtoLocacao === "gf" ? "gf" : "rac";
  const prazoMeses  = produtoLoc === "gf" ? (+m.prazoContratoMeses || 36) : 12;
  const valorTotalContrato = alqM * prazoMeses;

  const econ    = fAno - cAlq;
  const econAbs = Math.abs(econ);
  const venc    = econ >  50 ? "aluguel"
                : econ < -50 ? "propria"
                :              "empate";

  return { fAno, cAlq, econ, econAbs, venc, aqAno, opAno, tribP, revnd,
           valorContabil, precoRevenda, ganhoCapital, impGanhoCap,
           produtoLoc, prazoMeses, valorTotalContrato };
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

