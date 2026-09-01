// app init: DOMContentLoaded wiring, must load last
/* ══════════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", () => {
  /* Tema */
  applyTheme(theme);
  el("themeBtn").addEventListener("click", () => applyTheme(theme === "dark" ? "light" : "dark"));



  /* Wire main simulator inputs (EV inputs have inline handlers) */
  document.querySelectorAll(".left-pane input[type=number], .left-pane select").forEach(inp => {
    inp.addEventListener("input",  calc);
    inp.addEventListener("change", calc);
  });

  /* Abre "Ajustes avançados" se algum campo lá dentro já tem valor (Parecer 13) */
  document.querySelectorAll("details.adv:not([data-keep-closed])").forEach(d => {
    const temValor = [...d.querySelectorAll("input[type=number]")].some(i => (+i.value || 0) !== 0);
    if (temValor) d.open = true;
  });

  calc();
  restoreLSFC();
});

