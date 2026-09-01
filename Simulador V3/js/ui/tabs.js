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
