// presentation mode toggle
/* ══════════════════════════════════════════
   MODO APRESENTAÇÃO
══════════════════════════════════════════ */
function togglePresentation() {
  presMode = !presMode;
  document.body.classList.toggle("pres-mode", presMode);
  const btn = el("presBtn");
  if (btn) {
    btn.classList.toggle("pres-active", presMode);
    btn.querySelector(".btn-txt").textContent = presMode ? "Editar" : "Apresentação";
  }
}

