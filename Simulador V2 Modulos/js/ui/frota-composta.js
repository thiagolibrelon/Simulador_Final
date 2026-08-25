// Frota Composta tab: card/dashboard rendering, modal CRUD, localStorage persistence
/* ── Render card ── */
function renderFCEmpty() {
  const c = el("fcModelosList");
  if (c) c.innerHTML = `<div class="fc-empty"><div class="fc-empty-icon">🚗</div>
    <p>Nenhum modelo adicionado.<br/>Clique em <strong>+ Adicionar</strong> para começar.</p></div>`;
}

function renderFCEmptyDash() {
  const d = el("fcDashboard");
  if (d) d.innerHTML = `<div class="fc-dash-empty"><div style="font-size:2.5rem">📊</div>
    <p>O painel aparecerá aqui após adicionar modelos à frota.</p></div>`;
}

function renderFCCard(m, idx) {
  const c = el("fcModelosList"); if (!c) return;
  const r   = calcModelo(m, fcPerfil);
  const qtd = +m.qtd || 1;
  const vc  = r.venc;
  const badgeIcon  = vc === "aluguel" ? "🏆" : vc === "propria" ? "🚗" : "⚖";
  const badgeLabel = vc === "aluguel" ? "Locação vence" : vc === "propria" ? "Frota Própria vence" : "Empate técnico";
  const ecoLabel   = qtd > 1
    ? `${R(r.econAbs)}/un. · ${R(r.econAbs * qtd)} total`
    : `${R(r.econAbs)}/ano de economia`;
  c.innerHTML += `
  <div class="fc-card venc-${vc}" id="fcCard_${idx}">
    <div class="fc-card-head">
      <div>
        <div class="fc-card-title">${m.descricao || "Veículo " + (idx + 1)}</div>
        <div class="fc-card-qty">${qtd} veículo${qtd > 1 ? "s" : ""} · ${fcPerfil === "real" ? "Lucro Real" : "Lucro Presumido"}</div>
        <div class="fc-card-qty">${m.produtoLocacao === "gf" ? "GF · " + (m.prazoContratoMeses || 36) + " meses" : "RAC PJ · 12 meses"}</div>
      </div>
      <div class="fc-card-actions">
        <button class="fc-card-btn edit" onclick="openModalModelo(${idx})">✏ Editar</button>
        <button class="fc-card-btn remove" onclick="removeModelo(${idx})">✕</button>
      </div>
    </div>
    <div class="fc-card-body">
      <div class="fc-card-cmp">
        <div class="fc-card-val-block">
          <div class="fc-card-val-label">Frota Própria</div>
          <div class="fc-card-val-num">${R(r.fAno)}</div>
          <div class="fc-card-val-sub">por veículo / ano</div>
        </div>
        <div class="fc-card-val-block">
          <div class="fc-card-val-label">Locação</div>
          <div class="fc-card-val-num">${R(r.cAlq)}</div>
          <div class="fc-card-val-sub">por veículo / ano</div>
        </div>
      </div>
      <div class="fc-card-badge ${vc}">
        <div class="fc-badge-left">
          <span class="fc-badge-icon">${badgeIcon}</span>
          <span class="fc-badge-label">${badgeLabel}</span>
        </div>
        <span class="fc-badge-eco">${ecoLabel}</span>
      </div>
    </div>
  </div>`;
}

/* ── Render dashboard ── */
function renderFCDashboard(data) {
  const d = el("fcDashboard"); if (!d) return;
  const { resultados, totFAno, totCAlq, totQtd, totOtimo, econTotal } = data;
  const vencGlobal  = econTotal >  50 ? "aluguel" : econTotal < -50 ? "propria" : "empate";
  const vencLabel   = vencGlobal === "aluguel" ? "🏆 Locação é a estratégia mais econômica"
                    : vencGlobal === "propria"  ? "🏆 Frota Própria é mais econômica"
                    :                             "⚖ Empate técnico entre as estratégias";
  const poupanca    = Math.abs(econTotal);
  const bestUnif    = Math.min(totFAno, totCAlq);
  const economiaOtima = Math.max(0, bestUnif - totOtimo);

  const maxVal = Math.max(...resultados.map(r => Math.max(r.fAno, r.cAlq)), 1);

  const chartRows = resultados.map(r => {
    const wF = (r.fAno / maxVal * 100).toFixed(1);
    const wA = (r.cAlq / maxVal * 100).toFixed(1);
    return `<div class="fc-ch-row">
      <div><div class="fc-ch-name">${r.descricao}</div><div class="fc-ch-qty">×${r.qtd}</div></div>
      <div class="fc-ch-bars">
        <div class="fc-ch-bar-row">
          <span class="fc-ch-bar-label">Própria</span>
          <div class="fc-ch-track"><div class="fc-ch-bar orange" style="width:${wF}%"></div></div>
          <span class="fc-ch-val">${R(r.fAno)}</span>
        </div>
        <div class="fc-ch-bar-row">
          <span class="fc-ch-bar-label">Locação</span>
          <div class="fc-ch-track"><div class="fc-ch-bar green" style="width:${wA}%"></div></div>
          <span class="fc-ch-val">${R(r.cAlq)}</span>
        </div>
      </div>
    </div>`;
  }).join("");

  const rows = resultados.map(r => {
    const vOtimo    = Math.min(r.fAno, r.cAlq);
    const estrategia = r.venc === "aluguel"
      ? "<span style='color:var(--green-tx)'>Locar</span>"
      : r.venc === "propria"
        ? "<span style='color:#C0392B'>Comprar</span>"
        : "<span style='color:var(--muted)'>Qualquer</span>";
    const prod = r.produtoLoc === "gf" ? `GF ${r.prazoMeses}m` : "RAC PJ";
    return `<tr>
      <td>${r.descricao}<div style="font-size:10px;color:var(--muted)">${prod}</div></td>
      <td style="text-align:center">${r.qtd}</td>
      <td>${R(r.fAno)}</td>
      <td>${R(r.cAlq)}</td>
      <td>${estrategia}</td>
      <td>${R(vOtimo * r.qtd)}</td>
    </tr>`;
  }).join("");

  d.innerHTML = `
  <div class="fc-dash">
    <div class="fc-dash-hero ${vencGlobal}">
      <div class="fc-dash-hero-title">${vencLabel}</div>
      <div class="fc-dash-hero-sub">${totQtd} veículos · Economia estimada ${R(poupanca)}/ano vs. alternativa</div>
    </div>
    <div class="fc-kpi-grid">
      <div class="fc-dash-kpi"><div class="fc-dash-kpi-label">Total Frota Própria</div><div class="fc-dash-kpi-val">${R(totFAno)}</div><div class="fc-dash-kpi-sub">/ano consolidado</div></div>
      <div class="fc-dash-kpi"><div class="fc-dash-kpi-label">Total Locação</div><div class="fc-dash-kpi-val">${R(totCAlq)}</div><div class="fc-dash-kpi-sub">/ano consolidado</div></div>
      <div class="fc-dash-kpi accent"><div class="fc-dash-kpi-label">Estratégia Ótima</div><div class="fc-dash-kpi-val">${R(totOtimo)}</div><div class="fc-dash-kpi-sub">mix ótimo por categoria</div></div>
      <div class="fc-dash-kpi"><div class="fc-dash-kpi-label">Ganho com Mix Ótimo</div><div class="fc-dash-kpi-val">${R(economiaOtima)}</div><div class="fc-dash-kpi-sub">vs. estratégia única</div></div>
    </div>
    <div class="fc-dash-section-title">Comparativo Visual por Categoria</div>
    <div class="fc-chart">${chartRows}</div>
    <div class="fc-dash-section-title">Detalhamento por Categoria</div>
    <div class="fc-table-wrap">
      <table class="fc-table">
        <thead><tr><th>Categoria</th><th>Qtd</th><th>Própria/un.</th><th>Locação/un.</th><th>Recomendação</th><th>Custo Ótimo Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="fc-dash-note">
      Custo Ótimo = menor custo unitário por categoria × quantidade. A estratégia ótima pode combinar locação e compra conforme o perfil de cada modelo.
    </div>
  </div>`;
}

/* ── Modal CRUD ── */
function openModalModelo(idx) {
  fcEditId = idx;
  const o = el("fcModalOverlay"); if (!o) return;
  el("fcModalTitle").textContent = idx === null ? "Adicionar Modelo de Veículo" : "Editar Modelo de Veículo";
  if (idx === null) fcFillModalDefaults(); else fcFillModal(frota[idx]);
  o.style.display = "flex";
}

function closeModalModelo() {
  const o = el("fcModalOverlay"); if (o) o.style.display = "none";
  fcEditId = null;
}

function fcFillModalDefaults() {
  fcFillModal({
    descricao: "", qtd: 1,
    valorVeiculoBruto: 0, descontoPct: 0, entradaPct: 0, parcelas: 1,
    jurosMensalPct: 0, oportunidadePct: 0,
    manutencaoPct: 0, seguroPct: 0, licenciamentoAno: 0,
    indisponibilidadeAno: 0, admFrotaMensal: 0,
    custoAtivacao: 0, custoDesativacao: 0,
    modoDepreciacao: "contabil", depreciacaoPct: 0, precoRevendaEstimado: 0,
    aluguelMensal: 0, admAluguel: 0, atividadeFim: "sim",
    adicSeguroTotal: 0, adicVidros: 0, adicTelemetria: 0,
    produtoLocacao: "rac", prazoContratoMeses: 12, categoriaVeiculo: "Econômico",
    pisPropPct: 9.25, irpjPropPct: 25, csllPropPct: 9, estado: 0
  });
}

function fcFillModal(m) {
  ["descricao","qtd","valorVeiculoBruto","descontoPct","entradaPct","parcelas",
   "jurosMensalPct","oportunidadePct","manutencaoPct","seguroPct","licenciamentoAno",
   "indisponibilidadeAno","admFrotaMensal","custoAtivacao","custoDesativacao",
   "modoDepreciacao","depreciacaoPct","precoRevendaEstimado",
   "aluguelMensal","admAluguel","adicSeguroTotal","adicVidros","adicTelemetria","atividadeFim","produtoLocacao","prazoContratoMeses","categoriaVeiculo",
   "pisPropPct","irpjPropPct","csllPropPct"
  ].forEach(id => { const e = el("fc_" + id); if (e && m[id] !== undefined) e.value = m[id]; });
  const eEl = el("fc_estado");
  if (eEl && m.estado !== undefined)
    [...eEl.options].forEach(o => { o.selected = (parseFloat(o.value) === parseFloat(m.estado)); });
  fcToggleDepr();
  fcTogglePrazo();
}

function saveModelo() {
  const m = {};
  ["descricao","qtd","valorVeiculoBruto","descontoPct","entradaPct","parcelas",
   "jurosMensalPct","oportunidadePct","manutencaoPct","seguroPct","licenciamentoAno",
   "indisponibilidadeAno","admFrotaMensal","custoAtivacao","custoDesativacao",
   "modoDepreciacao","depreciacaoPct","precoRevendaEstimado",
   "aluguelMensal","admAluguel","adicSeguroTotal","adicVidros","adicTelemetria","atividadeFim","produtoLocacao","prazoContratoMeses","categoriaVeiculo",
   "pisPropPct","irpjPropPct","csllPropPct"
  ].forEach(id => { const e = el("fc_" + id); if (e) m[id] = e.value; });
  const eEl = el("fc_estado");
  m.estado = eEl ? parseFloat(eEl.options[eEl.selectedIndex].value) : 0;
  if (fcEditId === null) frota.push(m); else frota[fcEditId] = m;
  closeModalModelo();
  saveLSFC();
  calcFrota();
}

function removeModelo(idx) {
  frota.splice(idx, 1);
  saveLSFC();
  calcFrota();
}

function fcToggleDepr() {
  const sel = el("fc_modoDepreciacao"), box = el("fc_boxDeprReal");
  if (sel && box) box.style.display = sel.value === "real" ? "block" : "none";
}

function setManutCenarioFC(tipo) {
  el("fc_manutencaoPct").value = MANUT_REF[tipo];
  el("fc_mscNovo").classList.toggle("active", tipo === "novo");
  el("fc_mscUsado").classList.toggle("active", tipo === "usado");
}

function fcTogglePrazo() {
  const p = el("fc_produtoLocacao")?.value || "rac";
  const wrap = el("fc_prazoWrap");
  if (wrap) wrap.style.display = p === "gf" ? "block" : "none";
  if (p === "rac" && el("fc_prazoContratoMeses")) el("fc_prazoContratoMeses").value = "12";
}

function selectRegimeFC(r) {
  fcPerfil = r;
  const sel = el("fc_perfil"); if (sel) sel.value = r;
  if (frota.length) calcFrota();
}

function importarDoSimulador() {
  const FIELDS = ["valorVeiculoBruto","descontoPct","entradaPct","parcelas",
    "jurosMensalPct","oportunidadePct","manutencaoPct","seguroPct",
    "licenciamentoAno","indisponibilidadeAno","admFrotaMensal",
    "custoAtivacao","custoDesativacao","modoDepreciacao",
    "depreciacaoPct","precoRevendaEstimado","aluguelMensal","admAluguel",
    "adicSeguroTotal","adicVidros","adicTelemetria","atividadeFim",
    "produtoLocacao","prazoContratoMeses","categoriaVeiculo",
    "pisPropPct","irpjPropPct","csllPropPct"];
  const m = {
    descricao: (el("clientNameTopbar")?.textContent?.trim() || "Importado") + " — Simulador",
    qtd: qtdVeiculos || 1
  };
  FIELDS.forEach(f => { const e = el(f); if (e) m[f] = e.value; });
  const eEl = el("estado");
  m.estado = eEl ? parseFloat(eEl.options[eEl.selectedIndex].value) : 0;
  frota.push(m);
  saveLSFC();
  switchTab("fc");
  calcFrota();
}

/* ── localStorage ── */
function saveLSFC() {
  try { localStorage.setItem("sim-fc", JSON.stringify({ frota, perfil: fcPerfil })); } catch(e) {}
}

function restoreLSFC() {
  try {
    const d = JSON.parse(localStorage.getItem("sim-fc") || "{}");
    if (Array.isArray(d.frota)) frota = d.frota;
    if (d.perfil) { fcPerfil = d.perfil; const s = el("fc_perfil"); if (s) s.value = fcPerfil; }
    if (frota.length) calcFrota(); else { renderFCEmpty(); renderFCEmptyDash(); }
  } catch(e) { renderFCEmpty(); renderFCEmptyDash(); }
}

