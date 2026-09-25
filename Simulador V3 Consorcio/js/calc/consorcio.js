// Motor de consórcio — função pura, sem DOM. Substitui só o LADO FROTA PRÓPRIA
// do período do contrato quando a aquisição é via carta de consórcio; o lado
// locação continua vindo de calcCusto() (+ o destino da carta, se houver).
/* ══════════════════════════════════════════
   CAMINHOS
   · Carta já contemplada ............ compra o carro no mês 0 com o crédito.
   · Não contemplada — lance agora ... lance próprio (caixa) e/ou embutido
                                       (sai do crédito) → contemplada no mês 0.
   · Não contemplada — aguardar ...... fica sem carro até o mês previsto de
                                       contemplação; nesse intervalo paga uma
                                       locação-ponte (RAC). Data é estimativa.

   DESTINO DA CARTA SE O CLIENTE ESCOLHER A LOCAÇÃO
   · vender ... transfere a cota por R$ X → crédito no lado locação; na frota
                própria as parcelas (no contrato) e o saldo ao fim pesam.
   · cancelar . devolução só na contemplação por sorteio ou no encerramento do
                grupo (Lei 11.795/2008, art. 30) → crédito no lado locação,
                descontado pela TMA até o mês previsto de recebimento.
   · manter ... a carta segue para outro bem: as parcelas são pagas nos DOIS
                cenários e se anulam. O que a frota própria consome é o valor
                do crédito usado no carro (+ complemento em dinheiro).

   SIMPLIFICAÇÕES (documentadas no PDF)
   · Crédito da carta e preço do carro reajustam juntos → ambos em valor de hoje.
   · Parcela reajusta 1× por ano (`reajustePct`); lance amortiza as últimas parcelas.
   · Taxa de administração não gera crédito de IRPJ/CSLL aqui (o motor também não
     credita juros de financiamento) — conservador para a frota própria.
══════════════════════════════════════════ */
function calcConsorcio(q, ctx) {
  const M    = ctx.meses;
  const vV   = ctx.vV;
  const tmaM = pc(ctx.tmaPct || 0) / 12;

  const naoContemplada = q.status === "nao";
  const viaLance = naoContemplada && q.caminho === "lance";
  const m0 = naoContemplada && !viaLance ? Math.max(0, Math.round(q.mesContemplacao || 0)) : 0;

  const lanceP = viaLance ? (q.lanceProprio || 0) : 0;
  const lanceE = viaLance ? (q.lanceEmbutido || 0) : 0;
  const P = q.parcela || 0;
  const r = pc(q.reajustePct || 0);

  /* Lances amortizam o saldo — reduzem o nº de parcelas restantes (prazo). */
  const nRest = P > 0 ? Math.max(0, (q.parcelasRestantes || 0) - (lanceP + lanceE) / P) : 0;
  const creditoDisp = Math.max(0, (q.credito || 0) - lanceE);
  const complemento = Math.max(0, vV - creditoDisp);
  const creditoExcedente = Math.max(0, creditoDisp - vV);

  const parcelaNoMes = t => P * Math.pow(1 + r, Math.floor((t - 1) / 12));
  const pesoMes = t => Math.max(0, Math.min(1, nRest - (t - 1)));   // última parcela fracionária

  const semCarro = m0 >= M;                    // contemplação só depois do contrato
  const mesesPosse = semCarro ? 0 : M - m0;
  const manter = q.destino === "manter";

  /* Parcelas dentro do contrato, saldo ao fim e capital acumulado (p/ TMA). */
  let parcelasContrato = 0, capital = 0, oportunidade = 0;
  for (let t = 1; t <= M; t++) {
    if (t === m0 + 1 && !semCarro) {
      capital += manter ? vV + lanceP : complemento + lanceP;
    }
    const pg = parcelaNoMes(t) * pesoMes(t);
    parcelasContrato += pg;
    if (!manter) capital += pg;
    oportunidade += capital * tmaM;
  }
  let saldoFim = 0;
  for (let t = M + 1; t <= Math.ceil(nRest); t++) saldoFim += parcelaNoMes(t) * pesoMes(t);

  const ponte = (q.aluguelPonte || 0) * Math.min(m0, M);

  /* Custos de posse do carro (operação, manutenção, créditos, revenda) — vêm
     de calcCusto() rodado com prazo = meses de posse e compra à vista. */
  const posse = ctx.posse;
  const opexPosse   = posse ? posse.opexRecorr + posse.manutTotal + posse.ativDesativ : 0;
  const creditosPosse = posse ? posse.tribP : 0;
  const revendaBruta  = posse ? posse.precoRevendaFim - posse.impGanhoCapFim : 0;
  const saldoAbatido  = manter || semCarro ? 0 : saldoFim;
  const revendaLiq    = revendaBruta - saldoAbatido;   // pode ficar negativa: o saldo supera a revenda

  const aquisicao = semCarro
    ? (manter ? 0 : parcelasContrato)
    : manter ? vV : lanceP + complemento + parcelasContrato;

  const custoPropria = ponte + aquisicao + opexPosse - creditosPosse - revendaLiq + oportunidade;

  const creditoLocacao = q.destino === "vender"
    ? (q.valorVendaCarta || 0)
    : q.destino === "cancelar"
      ? (q.valorDevolucao || 0) / Math.pow(1 + pc(ctx.tmaPct || 0), Math.max(0, q.mesDevolucao || 0) / 12)
      : 0;
  const custoAluguel = ctx.custoAluguel - creditoLocacao;

  const econ = custoPropria - custoAluguel;
  return {
    status: naoContemplada ? (viaLance ? "lance" : "sorteio") : "contemplada",
    destino: q.destino, m0, mesesPosse, semCarro,
    creditoDisp, complemento, creditoExcedente, lanceP, lanceE, nRest,
    parcelasContrato, saldoFim, saldoAbatido, ponte, oportunidade,
    opexPosse, creditosPosse, revendaBruta, revendaLiq, aquisicao,
    creditoLocacao, custoPropria, custoAluguel,
    econ, econAbs: Math.abs(econ),
    venc: econ > 50 ? "aluguel" : econ < -50 ? "propria" : "empate"
  };
}
