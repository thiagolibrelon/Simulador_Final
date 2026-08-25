// login screen -> app start flow
/* ══════════════════════════════════════════
   INÍCIO DA SIMULAÇÃO
══════════════════════════════════════════ */
function doStart() {
  const evN  = (el("startEV").value    || "").trim();
  const cliN = (el("startCliente").value || "").trim();
  const qty  = parseInt(el("startQtd").value) || 1;
  const err  = el("startError");

  if (!evN) {
    err.textContent = "Informe o nome do Executivo de Vendas responsável.";
    err.style.display = "block";
    el("startEV").focus();
    return;
  }
  err.style.display = "none";

  loginMatricula   = evN;
  loginCodigo      = cliN;
  clientName       = cliN;
  veiculoSimulado  = (el("startVeiculo").value || "").trim();
  qtdVeiculos      = Math.max(1, qty);
  const qInp = el("qtdVeiculosInput");
  if (qInp) qInp.value = qtdVeiculos;

  if (cliN) {
    el("clientNameInput").value = cliN;
    el("clientNameTopbar").textContent = cliN;
    el("clientNameTopbar").style.display = "block";
  }

  const ls = el("loginScreen");
  ls.style.transition = "opacity .4s";
  ls.style.opacity = "0";
  setTimeout(() => {
    ls.style.display = "none";
    const app = el("mainApp");
    app.style.display = "block";
    restoreState();
    calc();
    if (window._autoTour) { window._autoTour = false; startTour(); }
  }, 420);
}

function startWithTour() {
  if (!el("startEV").value.trim()) el("startEV").value = "Demonstração";
  if (!el("startCliente").value.trim()) el("startCliente").value = "Empresa Demo";
  window._autoTour = true;
  doStart();
}

/* ══════════════════════════════════════════
   VOLTAR À TELA INICIAL
══════════════════════════════════════════ */
function goToStart() {
  el("mainApp").style.display = "none";
  const ls = el("loginScreen");
  ls.style.transition = "none";
  ls.style.opacity    = "1";
  ls.style.display    = "block";
}

