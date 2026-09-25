// light/dark theme toggle
/* ══════════════════════════════════════════
   TEMA — ícone sol/lua (SVG) em vez de emoji (Parecer 13)
══════════════════════════════════════════ */
const html = document.documentElement;
let theme = localStorage.getItem("sim-theme") || "light";
function applyTheme(t) {
  html.setAttribute("data-theme", t);
  const k = el("ttK");
  if (k) {
    const name = t === "dark" ? "moon" : "sun";
    k.innerHTML = (typeof window.icon === "function")
      ? window.icon(name)
      : `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  }
  theme = t;
  try { localStorage.setItem("sim-theme", t); } catch(e) {}
}
applyTheme(theme);
