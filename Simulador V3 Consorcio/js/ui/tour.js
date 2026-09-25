// guided first-access tour
/* ══════════════════════════════════════════
   TOUR GUIADO DE PRIMEIRO ACESSO
══════════════════════════════════════════ */
const TOUR_STEPS = [
  {
    title: "Bem-vindo",
    desc: "Em 4 passos você compara o custo de comprar a frota vs. alugar com a Localiza&Co. Vamos ver o essencial — o resto está no Glossário.",
    target: null, tab: "sim"
  },
  {
    title: "1 · O veículo",
    desc: "Preço de tabela, desconto, entrada, depreciação e valor esperado de revenda. Nos passos seguintes: custo de capital, custos de operar e impostos. Campos raros ficam recolhidos em \"Ajustes avançados\".",
    target: "#step0", wizardStep: 0, tab: "sim"
  },
  {
    title: "Prazo e frota",
    desc: "O prazo do contrato e a quantidade de veículos ficam aqui no painel direito — mexa neles e o resultado recalcula na hora.",
    target: ".rh-controls", tab: "sim"
  },
  {
    title: "A mensalidade do aluguel",
    desc: "No Passo 4 você informa a mensalidade da locação. É o número central da comparação — o simulador desconta os créditos tributários e mostra o custo efetivo.",
    target: "#step3", wizardStep: 3, tab: "sim"
  },
  {
    title: "O resultado",
    desc: "Aqui em cima, sempre visível: a economia num número só. Abra \"Ver como chegamos nesse número\" para o detalhamento completo.",
    target: "#resultHero", tab: "sim"
  },
  {
    title: "Exportar e frotas mistas",
    desc: "\"Exportar PDF Executivo\" gera o relatório para o cliente. Para uma frota com vários tipos de veículo, use a aba Frota Composta.",
    target: ".pdf-btn", tab: "sim"
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
