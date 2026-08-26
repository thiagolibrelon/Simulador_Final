// Motor único de cálculo — extraído de calc()/calcEV()/calcModelo() (eram implementações
// quase-idênticas, uma por aba). RAC e GF compartilham toda a tubulação de
// aquisição/operacional/tributos/crédito; GF ramifica só nos pontos assinalados abaixo.
/* ══════════════════════════════════════════
   CURVA DE MANUTENÇÃO GF — PLACEHOLDER
   Pendente de validação contábil com o Heitor. Estimativa de mercado
   (não confirmada): manutenção sobe ~15% a cada ano de contrato, já
   que veículo mais usado tende a manutenção mais cara. Não usar este
   número em relatório oficial ao cliente sem validar antes.
══════════════════════════════════════════ */
const MANUT_CURVA_GF_INCREMENTO_ANUAL_PCT = 15; // pendente Heitor

function manutPctNoAno(basePct, ano) {
  return basePct * Math.pow(1 + MANUT_CURVA_GF_INCREMENTO_ANUAL_PCT / 100, ano - 1);
}

/* ── Motor único ──
   p: objeto de entrada já resolvido (sem tocar DOM) — cada aba monta esse
   objeto a partir dos seus próprios campos e chama calcCusto(p). */
function calcCusto(p) {
  const jaPossui = !!p.jaPossui;
  const perfil   = p.perfil === "presumido" ? "presumido" : "real";

  /* ── Aquisição ── */
  const vBruto = p.valorVeiculoBruto || 0;
  const desc   = jaPossui ? 0 : vBruto * pc(p.descontoPct || 0);
  const vV     = vBruto - desc;
  const entr   = jaPossui ? 0 : vV * pc(p.entradaPct || 0);
  const fin    = jaPossui ? 0 : Math.max(0, vV - entr);
  const np     = jaPossui ? 1 : (p.parcelas || 1);
  const jm     = jaPossui ? 0 : pc(p.jurosMensalPct || 0);
  const parc   = pmt(fin, jm, np);
  const totP   = parc * np;
  const jTot   = Math.max(0, totP - fin);
  const gParc  = np <= 12 ? totP : parc * 12;
  const saldo  = np <= 12 ? 0    : Math.max(0, totP - gParc);
  const baseOp = entr + gParc;
  const opor   = jaPossui ? vV * pc(p.oportunidadePct || 0) : baseOp * pc(p.oportunidadePct || 0);
  const aqAno  = jaPossui ? (vV + opor) : (entr + gParc + opor);

  /* ── Operacional (ano 1) ── */
  const manutPctBase = p.manutencaoPct || 0;
  const manut  = vV * pc(manutPctBase);
  const seg    = vV * pc(p.seguroPct || 0);
  const ipva   = vV * pc(p.ipvaRatePct || 0);
  const lic    = p.licenciamentoAno || 0;
  const parad  = p.indisponibilidadeAno || 0;
  const admF   = (p.admFrotaMensal || 0) * 12;
  const ativ    = p.custoAtivacao || 0;
  const desativ = p.custoDesativacao || 0;
  const opAno  = manut + seg + ipva + lic + parad + admF + ativ + desativ;

  /* ── Depreciação (ano 1) ── */
  const deprPct = p.modoDepreciacao === "contabil" ? 20 : p.modoDepreciacao === "utilitario" ? 25 : (p.depreciacaoPct || 10);
  const deprA   = vV * pc(deprPct);
  const valorContabil = Math.max(0, vV - deprA - saldo);

  /* ── Ganho de capital na revenda (Real e Presumido — não é crédito de aluguel, é regra própria) ── */
  const precoRevenda = (p.precoRevendaEstimado || 0) > 0 ? p.precoRevendaEstimado : valorContabil;
  const ganhoCapital = Math.max(0, precoRevenda - valorContabil);
  const impGanhoCap  = ganhoCapital * (pc(p.irpjPropPct || 0) + pc(p.csllPropPct || 0));
  const revnd        = Math.max(0, precoRevenda - impGanhoCap);

  /* ── Tributos Frota ── */
  const basePis = perfil === "real" ? Math.max(0, manut + deprA) : 0;
  const pisP    = basePis * pc(p.pisPropPct || 0);
  const baseIr  = perfil === "real" ? Math.max(0, manut + deprA - pisP) : 0;
  const irjP    = baseIr  * pc(p.irpjPropPct || 0);
  const cslP    = baseIr  * pc(p.csllPropPct || 0);
  const tribP   = pisP + irjP + cslP;

  /* ── Custo Frota (ano 1) ── */
  const fAnoR   = aqAno + opAno - tribP - revnd;
  const fAnoPr  = aqAno + opAno - revnd;
  const fAno    = perfil === "real" ? fAnoR : fAnoPr;

  /* ── Produto de locação ── */
  const produtoLoc = p.produtoLocacao === "gf" ? "gf" : "rac";
  const prazoMeses = produtoLoc === "gf" ? (p.prazoContratoMeses || 36) : 12;

  /* ── Aluguel ──
     Pneus (GF): valor manual anual, separado de manutenção — soma ao pacote
     de locação, não ao lado de frota própria. Sem RAC. */
  const pneusAnual = produtoLoc === "gf" ? (p.pneusAnual || 0) : 0;
  const alqM   = p.aluguelMensal || 0;
  const valP   = 12 * alqM;
  const admA   = (p.admAluguel || 0) * 12;
  const adicA  = ((p.adicSeguroTotal || 0) + (p.adicVidros || 0) + (p.adicTelemetria || 0)) * 12 + pneusAnual;
  const atFim  = p.atividadeFim === "sim";
  const baseA  = perfil === "real" ? valP : 0;
  const pisA   = atFim ? baseA * pc(p.pisPropPct || 0) : 0;
  const irjA   = baseA * pc(p.irpjPropPct || 0);
  const cslA   = baseA * pc(p.csllPropPct || 0);
  const tribA  = pisA + irjA + cslA;
  const totAlq = valP + admA + adicA;
  const cAlq   = totAlq - tribA;

  const valorTotalContrato = alqM * prazoMeses;

  /* ── Resultado (snapshot ano 1) ── */
  const econ    = fAno - cAlq;
  const econAbs = Math.abs(econ);
  const venc    = econ >  50  ? "aluguel"
                : econ < -50  ? "propria"
                :               "empate";

  const result = {
    vBruto, desc, vV, entr, fin, parc, jTot, gParc, opor, aqAno,
    manut, seg, ipva, lic, parad, admF, ativ, desativ, opAno,
    deprPct, deprA, revnd, tribP, pisP, irjP, cslP, basePis, baseIr,
    valorContabil, precoRevenda, ganhoCapital, impGanhoCap,
    fAno, fAnoR, fAnoPr,
    valP, admA, adicA, pisA, irjA, cslA, tribA, cAlq, totAlq, pneusAnual,
    econ, econAbs, venc, perfil,
    np, saldo,
    produtoLoc, prazoMeses, valorTotalContrato,
    franquiaKm: p.franquiaKm || "", ipcaRef: p.ipcaRef || ""
  };

  /* ══════════════════════════════════════════
     RAMO GF — projeção plurianual
     Só a manutenção tem curva definida (placeholder, pendente Heitor);
     os demais componentes seguem lineares por ano, como hoje, para não
     inventar precisão que não existe nos outros itens. O snapshot
     principal (fAno/cAlq/econ acima) continua intocado — isto é uma
     camada informativa adicional, não substitui a comparação anual.
  ══════════════════════════════════════════ */
  if (produtoLoc === "gf") {
    const anos = Math.max(1, Math.round(prazoMeses / 12));
    const projecaoManutencao = [];
    let manutTotalContrato = 0;
    for (let ano = 1; ano <= anos; ano++) {
      const pctAno   = manutPctNoAno(manutPctBase, ano);
      const valorAno = vV * pc(pctAno);
      manutTotalContrato += valorAno;
      projecaoManutencao.push({ ano, pct: pctAno, valor: valorAno });
    }
    result.projecaoManutencao     = projecaoManutencao;
    result.manutTotalContrato     = manutTotalContrato;
    result.pneusTotalContrato     = pneusAnual * anos;
    /* Risco de reclassificação p/ arrendamento mercantil financeiro (Lei 6.099/1974,
       Res. BACEN 2.309/96) quando o contrato se aproxima de 75% da vida útil fiscal
       de 60 meses (45 meses) — nota de risco do Parecer 07 do Heitor, não é fórmula
       de custo, só um alerta no relatório. */
    result.riscoReclassificacaoArrendamento = prazoMeses >= 45;
  }

  return result;
}
