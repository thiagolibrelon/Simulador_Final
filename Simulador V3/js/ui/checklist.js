// data-checklist modal (copy to Teams)
/* ══════════════════════════════════════════
   CHECKLIST DE DADOS — CÓPIA PARA TEAMS
══════════════════════════════════════════ */
const CHECKLIST_TEXTO =
`Olá! Antes da nossa reunião, preciso de algumas informações para montar a análise de frota. Me passa o que tiver disponível:

🚗 VEÍCULO
• Modelo / versão desejado
• Preço de tabela (R$)
• Desconto que vocês costumam conseguir na compra (%)
• Percentual de entrada que a empresa colocaria (%)
• Estado onde os veículos serão emplacados
• Quantidade de veículos

💰 FINANCIAMENTO
• Prazo desejado (à vista, 12, 24, 36, 48 ou 60 meses)
• Taxa de juros do banco de vocês (% a.m.) — se já tiver cotação
• Rentabilidade do caixa/investimentos da empresa (% a.a.)

🔧 CUSTOS OPERACIONAIS (valores atuais ou estimativas)
• Manutenção média anual (% do valor do veículo ou R$)
• Seguro anual (% do valor do veículo ou R$)
• Gasto com mobilidade alternativa quando o veículo fica parado — Uber, aluguel avulso (R$/ano)
• Custo de administração de frota por mês — sistemas, RH, multas (R$)
• Custo de ativação — frete/transporte para retirar o veículo, se comprado em outro estado (R$)
• Custo de desativação — frete/transporte e preparação para revenda em outro estado (R$)

📋 FISCAL
• Regime tributário: Lucro Real ou Lucro Presumido?
• O veículo é usado na atividade-fim da empresa?

Com isso monto uma análise completa antes da nossa conversa! 👍`;

function downloadChecklist() {
  el('checklistText').textContent = CHECKLIST_TEXTO;
  el('checklistModalOverlay').style.display = 'flex';
}
function closeChecklistModal() {
  el('checklistModalOverlay').style.display = 'none';
}
function copyChecklistText() {
  navigator.clipboard.writeText(CHECKLIST_TEXTO).then(() => {
    const btn = el('checklistCopyBtn');
    btn.textContent = '✓ Copiado!';
    setTimeout(() => { btn.textContent = '📋 Copiar texto'; }, 2000);
  });
}

