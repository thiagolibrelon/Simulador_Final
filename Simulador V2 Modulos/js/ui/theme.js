// light/dark theme toggle
/* ══════════════════════════════════════════
   TEMA
══════════════════════════════════════════ */
const html = document.documentElement;
let theme = localStorage.getItem("sim-theme") || "light";
function applyTheme(t) {
  html.setAttribute("data-theme", t);
  const k = el("ttK");
  if (k) k.textContent = t === "dark" ? "🌙" : "☀️";
  theme = t;
  try { localStorage.setItem("sim-theme", t); } catch(e) {}
}
applyTheme(theme);

