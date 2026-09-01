// shared formatters/DOM helpers (el, n, pc, R, R2, Pct, set, pmt)
const el  = id => document.getElementById(id);
const n   = id => { const e = el(id); return e ? (Number(e.value) || 0) : 0; };
const pc  = v => v / 100;
const R   = v => isNaN(v) ? "—" : v.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
const R2  = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2});
const Pct = v => Math.abs(v).toFixed(1).replace(".",",") + "%";

function set(id, v) {
  const e = el(id);
  if (!e) return;
  if (e.textContent !== String(v)) {
    e.textContent = v;
    e.classList.remove("num-pop");
    void e.offsetWidth;
    e.classList.add("num-pop");
  }
}

/* ── PMT Price ── */
function pmt(pv, i, np) {
  if (np <= 1) return pv;
  if (i <= 0)  return pv / np;
  return pv * (i * Math.pow(1+i, np)) / (Math.pow(1+i, np) - 1);
}

