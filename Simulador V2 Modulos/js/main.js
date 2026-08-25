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

  calc();
  restoreEVState();
  restoreLSFC();
});

