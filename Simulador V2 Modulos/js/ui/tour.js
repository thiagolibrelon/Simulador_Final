// guided first-access tour
/* ══════════════════════════════════════════
   TOUR GUIADO DE PRIMEIRO ACESSO
══════════════════════════════════════════ */
const TOUR_STEPS = [
  {
    title: "Bem-vindo ao Simulador Estratégico de Frota",
    desc: "Esta ferramenta compara o custo real de frota própria versus locação corporativa Localiza&Co, considerando todos os fatores financeiros, operacionais e tributários. Você verá as 4 abas disponíveis neste tour.",
    target: null, tab: "sim"
  },
  {
    title: "Simulador — Dados do Veículo",
    desc: "Informe o preço de tabela, o desconto negociado e o percentual de entrada. Esses dados formam a base de cálculo de aquisição e a saída imediata de caixa no Dia 1.",
    target: "#step0", wizardStep: 0, tab: "sim"
  },
  {
    title: "Simulador — Custo de Capital",
    desc: "Defina o financiamento (método Price) e o custo de oportunidade — o rendimento perdido ao imobilizar capital no veículo. Este é o custo invisível frequentemente ignorado.",
    target: "#step1", wizardStep: 1, tab: "sim"
  },
  {
    title: "Simulador — Custos Operacionais",
    desc: "Configure manutenção, seguro, IPVA, licenciamento, indisponibilidade, ativação/desativação (frete de retirada e revenda) e administração de frota. Esses custos recorrentes representam o peso diário de possuir o veículo.",
    target: "#step2", wizardStep: 2, tab: "sim"
  },
  {
    title: "Simulador — Regime Tributário",
    desc: "Selecione Lucro Real ou Lucro Presumido e configure as alíquotas de PIS/COFINS, IRPJ e CSLL. No Lucro Real, as despesas da frota própria geram créditos tributários que reduzem o custo efetivo.",
    target: "#step3", wizardStep: 3, tab: "sim"
  },
  {
    title: "Simulador — Produto de Locação",
    desc: "Escolha entre RAC PJ (locação de curto prazo, até 12 meses) e GF — Gestão de Frotas (contratos de até 36 meses). O prazo escolhido define o valor total do contrato exibido no comparativo, sem alterar o cálculo de custo anual.",
    target: "#pcRac", wizardStep: 3, tab: "sim"
  },
  {
    title: "Simulador — Valor do Aluguel",
    desc: "Informe aqui a mensalidade da locação corporativa Localiza&Co. Este é o número central da comparação: o simulador calcula o custo efetivo do aluguel após créditos tributários e taxa de administração.",
    target: "#aluguelMensal", wizardStep: 3, tab: "sim"
  },
  {
    title: "Simulador — Dashboard Executivo",
    desc: "O painel à direita atualiza em tempo real: custo efetivo de cada alternativa, economia unitária e — para frotas — impacto financeiro consolidado. O vencedor aparece destacado em verde.",
    target: ".right-pane", tab: "sim"
  },
  {
    title: "Aba: Comparativo Individual",
    desc: "Painel técnico completo com decomposição linha a linha de cada componente de custo — aquisição, operacional, tributário, depreciação e aluguel. Ideal para apresentações técnicas à controladoria.",
    target: "#tabEv", tab: "ev"
  },
  {
    title: "Frota Composta — Visão Geral",
    desc: "Analise frotas heterogêneas com múltiplos modelos de veículos. Cada categoria tem parâmetros independentes — veículo, financiamento, operacional, depreciação e locação configurados separadamente.",
    target: "#tabFc", tab: "fc"
  },
  {
    title: "Frota Composta — Adicionar Categoria",
    desc: "Clique aqui para cadastrar cada modelo de veículo da frota. Você pode importar os dados do Simulador principal ou preencher manualmente. Cada categoria gera seu próprio comparativo locar × comprar.",
    target: ".fc-add-btn", tab: "fc"
  },
  {
    title: "Frota Composta — Dashboard e Estratégia Ótima",
    desc: "O painel direito consolida todas as categorias: custo total da frota, economia agregada e estratégia ótima automática — o sistema indica para cada modelo se é melhor locar ou comprar, com o impacto financeiro de cada decisão.",
    target: "#fcDashboard", tab: "fc"
  },
  {
    title: "Aba: Glossário",
    desc: "Referência completa de todos os termos e variáveis utilizados nas simulações — do PMT Price ao custo de oportunidade. Útil para alinhar vocabulário com o cliente durante a apresentação.",
    target: "#tabGloss", tab: "gloss"
  },
  {
    title: "Exportar PDF",
    desc: "Cada aba tem seu próprio botão de exportação PDF. O relatório inclui um Resumo Executivo com valores unitários e consolidados — pronto para apresentação à diretoria.",
    target: ".pdf-btn", tab: "sim"
  },
  {
    title: "Tudo pronto!",
    desc: "Você conheceu as 4 abas do simulador. Ajuste os parâmetros e veja o comparativo atualizar ao vivo. Para repetir este tour a qualquer momento, clique em '▶ Tour' na barra superior.",
    target: null, tab: "sim"
  }
];

let tourStep = 0;
let tourActive = false;
let tourTimer = null;

function initTour() {
  /* Auto-start removido — usuário escolhe via botão */
}

function startTour() {
  if (tourTimer) { clearTimeout(tourTimer); tourTimer = null; }
  tourStep = 0;
  tourActive = true;
  /* Garante que estamos na aba Simulador */
  if (!el("panelSim").classList.contains("active")) switchTab("sim");
  el("tourOverlay").style.display = "block";
  renderTourStep();
}

function closeTour() {
  el("tourOverlay").style.display = "none";
  const sp = el("tourSpotlight");
  if (sp) sp.style.opacity = "0";
  tourActive = false;
  try { localStorage.setItem("sim-tour-done", "1"); } catch(e) {}
}

function tourNext() {
  if (tourStep < TOUR_STEPS.length - 1) {
    tourStep++;
    renderTourStep();
  } else {
    closeTour();
  }
}

function tourPrev() {
  if (tourStep > 0) { tourStep--; renderTourStep(); }
}

function renderTourStep() {
  const step  = TOUR_STEPS[tourStep];
  const total = TOUR_STEPS.length;

  /* Navega para a aba correta */
  if (step.tab) switchTab(step.tab);
  /* Navega wizard se necessário */
  if (step.wizardStep !== undefined) goStep(step.wizardStep);

  /* Conteúdo */
  set("tourBadge", "Passo " + (tourStep + 1) + " de " + total);
  set("tourTitle", step.title);
  set("tourDesc",  step.desc);

  /* Dots */
  const dotsEl = el("tourDots");
  if (dotsEl) {
    dotsEl.innerHTML = TOUR_STEPS.map((_, i) =>
      '<div class="tour-dot' + (i === tourStep ? " active" : "") + '"></div>'
    ).join("");
  }

  /* Botões */
  const btnBack = el("tourBtnBack");
  const btnNext = el("tourBtnNext");
  if (btnBack) btnBack.style.display = tourStep === 0 ? "none" : "";
  if (btnNext) btnNext.textContent = tourStep === total - 1 ? "Concluir ✓" : "Próximo →";

  /* Posicionamento */
  const spotlight = el("tourSpotlight");
  const tooltip   = el("tourTooltip");

  if (step.target) {
    setTimeout(() => {
      const tgt = document.querySelector(step.target);
      if (!tgt) { posTooltipCenter(tooltip); if (spotlight) spotlight.style.opacity = "0"; return; }

      const r = tgt.getBoundingClientRect();
      const p = 7;
      if (spotlight) {
        spotlight.style.opacity = "1";
        spotlight.style.left   = (r.left - p) + "px";
        spotlight.style.top    = (r.top  - p) + "px";
        spotlight.style.width  = (r.width  + p * 2) + "px";
        spotlight.style.height = (r.height + p * 2) + "px";
      }

      /* Posiciona tooltip adjacente ao elemento */
      const tW = 320, tH = 270;
      let tx, ty;
      if (r.left > tW + 50) {
        tx = r.left - tW - 14;
        ty = Math.max(10, r.top + (r.height - tH) / 2);
      } else if (r.right + tW + 50 < window.innerWidth) {
        tx = r.right + 14;
        ty = Math.max(10, r.top + (r.height - tH) / 2);
      } else if (r.top > tH + 50) {
        tx = Math.max(10, r.left + (r.width - tW) / 2);
        ty = r.top - tH - 14;
      } else {
        tx = Math.max(10, r.left + (r.width - tW) / 2);
        ty = Math.min(r.bottom + 14, window.innerHeight - tH - 10);
      }
      tx = Math.max(10, Math.min(tx, window.innerWidth  - tW - 10));
      ty = Math.max(10, Math.min(ty, window.innerHeight - tH - 10));
      if (tooltip) { tooltip.style.left = tx + "px"; tooltip.style.top = ty + "px"; }
    }, 360);
  } else {
    if (spotlight) spotlight.style.opacity = "0";
    posTooltipCenter(tooltip);
  }
}

function posTooltipCenter(tooltip) {
  if (!tooltip) return;
  tooltip.style.left = Math.max(10, (window.innerWidth  - 320) / 2) + "px";
  tooltip.style.top  = Math.max(10, (window.innerHeight - 290) / 2) + "px";
}

