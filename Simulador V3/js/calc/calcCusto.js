// Motor único de cálculo — extraído de calc()/calcEV()/calcModelo() (eram implementações
// quase-idênticas, uma por aba). RAC e GF compartilham toda a tubulação de
// aquisição/operacional/tributos/crédito; GF ramifica só nos pontos assinalados abaixo.
/* ══════════════════════════════════════════
   CURVA DE MANUTENÇÃO GF — % INFORMADO PELO USUÁRIO
   O aumento anual da manutenção (veículo mais usado → manutenção mais cara)
   passou a ser um campo editável ("Aumento anual da manutenção", default 15%).
   Continua sendo uma estimativa de mercado, pendente de validação contábil —
   não usar em relatório oficial ao cliente sem validar antes.
══════════════════════════════════════════ */
const MANUT_CURVA_GF_INCREMENTO_ANUAL_PCT_DEFAULT = 15;

function manutPctNoAno(basePct, ano, incrementoPct) {
  const inc = (incrementoPct === undefined || incrementoPct === null || isNaN(incrementoPct))
    ? MANUT_CURVA_GF_INCREMENTO_ANUAL_PCT_DEFAULT
    : incrementoPct;
  return basePct * Math.pow(1 + inc / 100, ano - 1);
}

/* ══════════════════════════════════════════
   REVENDA — VALOR DE REFERÊNCIA DE MERCADO
   No 1º ano a depreciação real ≈ contábil (20%/25% a.a.); a partir do 2º ano
   o mercado desvaloriza bem menos que a depreciação fiscal linear (que zera o
   carro em 5 anos). Referência: 1º ano = contábil; anos seguintes perdem
   `taxaPos` % a.a. sobre o valor do ano anterior. Default 10% a.a. —
   estimativa, pendente de validação com dados da Localiza Seminovos.
══════════════════════════════════════════ */
const TAXA_MERCADO_POS_ANO1_PCT_DEFAULT = 10;

function valorReferenciaRevenda(vV, deprPct, taxaPos, meses) {
  if (meses <= 12) return Math.max(0, vV * (1 - pc(deprPct) * meses / 12));
  return Math.max(0, vV * (1 - pc(deprPct)) * Math.pow(1 - pc(taxaPos), (meses - 12) / 12));
}

/* ── Motor único ──
   p: objeto de entrada já resolvido (sem tocar DOM) — cada aba monta esse
   objeto a partir dos seus próprios campos e chama calcCusto(p). */
function calcCusto(p) {
  const perfil = p.perfil === "presumido" ? "presumido" : "real";

  /* ── Aquisição ── */
  const vBruto = p.valorVeiculoBruto || 0;
  const desc   = vBruto * pc(p.descontoPct || 0);
  const vV     = vBruto - desc;
  const entr   = vV * pc(p.entradaPct || 0);
  const fin    = Math.max(0, vV - entr);
  const np     = p.parcelas || 1;
  const jm     = pc(p.jurosMensalPct || 0);
  const parc   = pmt(fin, jm, np);
  const totP   = parc * np;
  const jTot   = Math.max(0, totP - fin);
  const gParc  = np <= 12 ? totP : parc * 12;
  const saldo  = np <= 12 ? 0    : Math.max(0, totP - gParc);
  const baseOp = entr + gParc;
  const opor   = baseOp * pc(p.oportunidadePct || 0);
  const aqAno  = entr + gParc + opor;

  /* ── Operacional (ano 1) ──
     Pneus: o campo separado foi removido em 09/2026 — pneus passam a estar
     contidos no % de manutenção. `p.pneusAnual` fica aceito (default 0) só por
     compatibilidade com simulações salvas; nenhuma tela o preenche mais. */
  const manutPctBase = p.manutencaoPct || 0;
  const manut  = vV * pc(manutPctBase);
  const pneusAnual = p.pneusAnual || 0;
  const seg    = vV * pc(p.seguroPct || 0);
  const ipva   = vV * pc(p.ipvaRatePct || 0);
  const lic    = p.licenciamentoAno || 0;
  const parad  = p.indisponibilidadeAno || 0;
  const admF   = (p.admFrotaMensal || 0) * 12;
  const ativ    = p.custoAtivacao || 0;
  const desativ = p.custoDesativacao || 0;
  const opAno  = manut + pneusAnual + seg + ipva + lic + parad + admF + ativ + desativ;

  /* ── Depreciação (ano 1) ── */
  const deprPct = p.modoDepreciacao === "contabil" ? 20 : p.modoDepreciacao === "utilitario" ? 25 : (p.depreciacaoPct || 10);
  const deprA   = vV * pc(deprPct);
  /* Igual valorContabilFim (linha ~194): o valor contábil do bem NÃO depende
     do saldo devedor do financiamento — depende só do custo e da depreciação. */
  const valorContabil = Math.max(0, vV - deprA);

  /* ── Prazo do contrato (definido cedo: a revenda do snapshot depende dele) ── */
  const produtoLoc = p.produtoLocacao === "gf" ? "gf" : "rac";
  const prazoMeses = produtoLoc === "gf"
    ? (p.prazoContratoMeses || 36)
    : (p.prazoContratoMeses || 12);

  /* ── Ganho de capital na revenda (Real e Presumido — não é crédito de aluguel, é regra própria) ──
     `precoRevendaEstimado` é o preço ao FIM DO CONTRATO. Em contratos > 12 meses ele é
     o preço de um carro mais velho — não serve pro snapshot do ano 1, que então usa
     a referência do 1º ano (= valor contábil, sem ganho de capital). */
  const precoRevenda = (p.precoRevendaEstimado || 0) > 0 && prazoMeses <= 12 ? p.precoRevendaEstimado : valorContabil;
  const ganhoCapital = Math.max(0, precoRevenda - valorContabil);
  const impGanhoCap  = ganhoCapital * (pc(p.irpjPropPct || 0) + pc(p.csllPropPct || 0));
  /* Espelha revendaFimLiq (saldoFim): se você vendesse o carro ao fim do ano 1, o saldo
     devedor do financiamento sai primeiro do produto da revenda — igual já é feito no
     período completo (Parecer 11). `saldo` (linha ~38) já existia calculado mas nunca
     era usado; esse era o bug (fAno/cAlq podiam discordar de periodo.custoPropria mesmo
     em contratos de 12 meses, sempre que o financiamento fosse mais longo que 12 meses). */
  const revnd        = Math.max(0, precoRevenda - impGanhoCap - saldo);

  /* ── Tributos Frota — base = manutenção + pneus + depreciação (Lucro Real) ── */
  const baseManutDepr = manut + pneusAnual + deprA;
  const basePis = perfil === "real" ? Math.max(0, baseManutDepr) : 0;
  const pisP    = basePis * pc(p.pisPropPct || 0);
  const baseIr  = perfil === "real" ? Math.max(0, baseManutDepr - pisP) : 0;
  const irjP    = baseIr  * pc(p.irpjPropPct || 0);
  const cslP    = baseIr  * pc(p.csllPropPct || 0);
  const tribP   = pisP + irjP + cslP;

  /* ── Custo Frota (ano 1) ── */
  const fAnoR   = aqAno + opAno - tribP - revnd;
  const fAnoPr  = aqAno + opAno - revnd;
  const fAno    = perfil === "real" ? fAnoR : fAnoPr;

  /* ── Aluguel ── */
  const alqM   = p.aluguelMensal || 0;
  const valP   = 12 * alqM;
  const admA   = (p.admAluguel || 0) * 12;
  const adicA  = ((p.adicSeguroTotal || 0) + (p.adicVidros || 0) + (p.adicTelemetria || 0)) * 12;
  const atFim  = p.atividadeFim === "sim";
  const baseA  = perfil === "real" ? valP : 0;
  const pisA   = atFim ? baseA * pc(p.pisPropPct || 0) : 0;
  const irjA   = baseA * pc(p.irpjPropPct || 0);
  const cslA   = baseA * pc(p.csllPropPct || 0);
  const tribA  = pisA + irjA + cslA;

  /* Carro reserva (GF): se o contrato NÃO inclui carro reserva, o custo de
     indisponibilidade também pesa no lado da locação — anula a vantagem que
     o GF teria sobre a frota própria nesse item. Default: inclui reserva. */
  const carroReserva = p.carroReservaGf !== false;
  const indispLoc = (produtoLoc === "gf" && !carroReserva) ? parad : 0;

  const totAlq = valP + admA + adicA + indispLoc;
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
    carroReserva, indispLoc,
    econ, econAbs, venc, perfil,
    np, saldo,
    produtoLoc, prazoMeses, valorTotalContrato,
    franquiaKm: p.franquiaKm || "",
    manutIncrementoAnualPct: (p.manutIncrementoAnualPct === undefined || p.manutIncrementoAnualPct === null || isNaN(p.manutIncrementoAnualPct))
      ? MANUT_CURVA_GF_INCREMENTO_ANUAL_PCT_DEFAULT
      : p.manutIncrementoAnualPct
  };

  /* ══════════════════════════════════════════
     PROJEÇÃO PLURIANUAL — período completo do contrato (RAC e GF)
     Base: Parecer 11 do Heitor (31/08/2026). A dedução é competência mensal
     dos dois lados — não há trava fiscal contra prazo quebrado (14, 18, N meses).
     Classificação dos custos:
       · uma vez no contrato ...... entrada + financiamento completo (com juros),
                                    ativação, desativação, revenda ao fim;
       · recorrente × período ..... aluguel, manutenção, seguro, IPVA,
                                    licenciamento, indisponibilidade, adm., pneus,
                                    custo de oportunidade, créditos tributários;
       · depreciação .............. quota mensal × nº de meses (não a quota "de um
                                    ano" repetida) — define o valor contábil na
                                    revenda ao fim do prazo.
     O snapshot anual (fAno/cAlq/econ acima) continua intocado — a projeção é a
     comparação fiel para prazos ≠ 12 meses; para 12 meses os dois coincidem.
  ══════════════════════════════════════════ */
  const meses  = prazoMeses;
  const anosFr = meses / 12;                       // fracionário: 0,5 · 1,5 · 3 ...
  const incPct = result.manutIncrementoAnualPct;

  /* Manutenção ao longo do período — curva por idade, com último ano parcial */
  const projecaoManutencao = [];
  let manutTotalContrato = 0;
  {
    let restante = meses, ano = 1;
    while (restante > 0.0001) {
      const fracAno = Math.min(1, restante / 12);
      const pctAno  = manutPctNoAno(manutPctBase, ano, incPct);
      const valorAno = vV * pc(pctAno) * fracAno;
      manutTotalContrato += valorAno;
      projecaoManutencao.push({ ano, pct: pctAno, valor: valorAno, fracao: fracAno });
      restante -= 12; ano++;
    }
  }

  /* Lado locação — período completo */
  const locAluguel = alqM * meses;
  const locAdm     = (p.admAluguel || 0) * meses;
  const locAdic    = ((p.adicSeguroTotal || 0) + (p.adicVidros || 0) + (p.adicTelemetria || 0)) * meses;
  const locIndisp  = (produtoLoc === "gf" && !carroReserva) ? parad * anosFr : 0;
  const locTrib    = tribA * anosFr;              // linear em valP; só Real
  const custoAluguelPeriodo = locAluguel + locAdm + locAdic + locIndisp - locTrib;

  /* Lado frota própria — período completo.
     Financiamento: só as parcelas pagas dentro do contrato são desembolso; o
     saldo devedor ao fim é quitado com o produto da revenda (você vende o carro
     e paga o banco). O valor contábil do bem NÃO depende do saldo devedor —
     depende só do custo e da depreciação acumulada. */
  const mesesFin    = Math.min(np, meses);
  const parcPeriodo = parc * mesesFin;
  const saldoFim    = parc * Math.max(0, np - meses);
  const aqUnica     = entr + parcPeriodo;         // entrada + parcelas pagas no contrato, 1×
  const oporPeriodo = opor * anosFr;
  const opexRecorr  = (seg + ipva + lic + parad + admF) * anosFr;
  const pneusPeriodo = pneusAnual * anosFr;
  const deprAcum    = Math.min(vV, deprA * anosFr);
  const valorContabilFim = Math.max(0, vV - deprAcum);
  const taxaMercadoPos   = p.modoDepreciacao === "real" ? deprPct : TAXA_MERCADO_POS_ANO1_PCT_DEFAULT;
  const revendaReferenciaFim = valorReferenciaRevenda(vV, deprPct, taxaMercadoPos, meses);
  /* Campo vazio → referência de mercado (não o contábil): em 36m o contábil fiscal
     (−60%) subestima muito o que o carro vale na venda. */
  const precoRevendaFim  = (p.precoRevendaEstimado || 0) > 0 ? p.precoRevendaEstimado : revendaReferenciaFim;
  const ganhoCapFim      = Math.max(0, precoRevendaFim - valorContabilFim);
  const impGanhoCapFim   = ganhoCapFim * (pc(p.irpjPropPct || 0) + pc(p.csllPropPct || 0));
  const revendaFimLiq    = Math.max(0, precoRevendaFim - impGanhoCapFim - saldoFim);

  const baseCredPer = manutTotalContrato + pneusPeriodo + deprAcum;
  const basePisPer = perfil === "real" ? Math.max(0, baseCredPer) : 0;
  const pisPPer    = basePisPer * pc(p.pisPropPct || 0);
  const baseIrPer  = perfil === "real" ? Math.max(0, baseCredPer - pisPPer) : 0;
  const tribPPeriodo = pisPPer + baseIrPer * pc(p.irpjPropPct || 0) + baseIrPer * pc(p.csllPropPct || 0);

  const custoPropriaPeriodo =
      aqUnica
    + oporPeriodo
    + opexRecorr
    + manutTotalContrato
    + pneusPeriodo
    + ativ + desativ                              // eventos únicos, 1×
    - tribPPeriodo
    - revendaFimLiq;

  const econPeriodo    = custoPropriaPeriodo - custoAluguelPeriodo;
  const vencPeriodo    = econPeriodo > 50 ? "aluguel" : econPeriodo < -50 ? "propria" : "empate";

  result.projecaoManutencao = projecaoManutencao;
  result.manutTotalContrato = manutTotalContrato;
  result.pneusTotalContrato = pneusPeriodo;
  /* Risco de reclassificação p/ arrendamento mercantil financeiro (Lei 6.099/1974,
     Res. BACEN 2.309/96) quando o contrato se aproxima de 75% da vida útil fiscal
     de 60 meses (45 meses) — nota de risco do Parecer 07 do Heitor (só GF). */
  result.riscoReclassificacaoArrendamento = produtoLoc === "gf" && prazoMeses >= 45;

  result.periodo = {
    meses, anos: anosFr,
    custoPropria: custoPropriaPeriodo,
    custoAluguel: custoAluguelPeriodo,
    econ: econPeriodo, econAbs: Math.abs(econPeriodo), venc: vencPeriodo,
    /* detalhamento */
    locAluguel, locAdm, locAdic, locIndisp, locTrib,
    aqUnica, parcPeriodo, saldoFim, oporPeriodo, opexRecorr, manutTotal: manutTotalContrato,
    pneusPeriodo, ativDesativ: ativ + desativ, tribP: tribPPeriodo,
    deprAcum, valorContabilFim, precoRevendaFim, ganhoCapFim, impGanhoCapFim, revendaFimLiq,
    revendaReferenciaFim, taxaMercadoPos
  };

  return result;
}
