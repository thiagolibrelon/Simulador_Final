// tab switching
/* ══════════════════════════════════════════
   TABS — Simulador · Frota Composta · Glossário
══════════════════════════════════════════ */
function switchTab(t) {
  ["sim", "fc", "gloss"].forEach(id => {
    const cap = id[0].toUpperCase() + id.slice(1);
    const tabEl   = el("tab"   + cap);
    const panelEl = el("panel" + cap);
    if (tabEl)   tabEl.classList.toggle("active",   id === t);
    if (panelEl) panelEl.classList.toggle("active", id === t);
  });
  if (t === "sim") calc();
  else if (t === "fc") calcFrota();
}

/* Ferramentas internas do Glossário.
   Atalho deliberadamente não exposto na interface: Ctrl+Shift+M. */
function toggleGlossSecretTools(force) {
  const tools = el("glossSecretTools");
  if (!tools) return;
  const abrir = typeof force === "boolean" ? force : tools.hidden;
  tools.hidden = !abrir;
  tools.setAttribute("aria-hidden", abrir ? "false" : "true");
  if (abrir) {
    tools.scrollIntoView({ behavior: "smooth", block: "center" });
    el("incluirMemoriaCalculo")?.focus({ preventScroll: true });
  }
}

function resetInternalPdfTools() {
  ["incluirMemoriaCalculo", "fc_incluirMemoriaCalculo"].forEach(id => {
    const option = el(id);
    if (option) option.checked = false;
  });
  toggleGlossSecretTools(false);
}

document.addEventListener("keydown", event => {
  const glossAtivo = el("panelGloss")?.classList.contains("active");
  if (!glossAtivo || !event.ctrlKey || !event.shiftKey || event.key.toLowerCase() !== "m") return;
  event.preventDefault();
  toggleGlossSecretTools();
});
