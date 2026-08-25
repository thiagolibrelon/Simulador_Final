// topbar client panel (logo/nome do cliente)
/* ══════════════════════════════════════════
   PAINEL CLIENTE
══════════════════════════════════════════ */
function toggleClientPanel() {
  clientPanelOpen = !clientPanelOpen;
  el("clientPanel").classList.toggle("open", clientPanelOpen);
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    clientLogoData = evt.target.result;
    const t = el("logoPreviewThumb");
    t.src = clientLogoData;
    t.style.display = "inline-block";
  };
  reader.readAsDataURL(file);
}

function saveClient() {
  clientName = (el("clientNameInput").value || "").trim();
  const nameEl = el("clientNameTopbar");
  const logoEl = el("clientLogoTopbar");

  if (clientName) { nameEl.textContent = clientName; nameEl.style.display = "block"; }
  else              { nameEl.style.display = "none"; }

  if (clientLogoData) { logoEl.src = clientLogoData; logoEl.style.display = "block"; }
  else                  { logoEl.style.display = "none"; }

  toggleClientPanel();
}

