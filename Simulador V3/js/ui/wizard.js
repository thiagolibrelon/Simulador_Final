// Simulador wizard steps, sliders, qty-of-vehicles control
/* ══════════════════════════════════════════
   QUANTIDADE DE VEÍCULOS
══════════════════════════════════════════ */
function changeQty(delta) {
  qtdVeiculos = Math.max(1, qtdVeiculos + delta);
  const inp = el("qtdVeiculosInput");
  if (inp) inp.value = qtdVeiculos;
  calc();
}
function updateQty(val) {
  qtdVeiculos = Math.max(1, parseInt(val) || 1);
  calc();
}

/* ══════════════════════════════════════════
   WIZARD STEPS
══════════════════════════════════════════ */
function goStep(s) {
  document.querySelectorAll(".step-panel").forEach((p, i) => p.classList.toggle("active", i === s));
  for (let i = 0; i < 4; i++) {
    const d = el("pd" + i);
    d.classList.toggle("done",   i < s);
    d.classList.toggle("active", i === s);
    if (i < 3) el("pl" + i).classList.toggle("done", i < s);
  }
  el("th1").style.opacity = s >= 1 ? "1" : "0.3";
  el("th2").style.opacity = s >= 2 ? "1" : "0.3";
  el("th3").style.opacity = s >= 3 ? "1" : "0.3";
  currentStep = s;
  saveLS();
}

/* ══════════════════════════════════════════
   SLIDERS
══════════════════════════════════════════ */
function sliderUpdate(inputId, labelId, valId) {
  const v  = Number(el(inputId).value);
  const vV = n("valorVeiculoBruto") * (1 - pc(n("descontoPct")));
  set(labelId, v.toFixed(1));
  set(valId,   R(vV * pc(v)));
}

