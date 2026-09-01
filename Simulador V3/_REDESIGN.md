# Simulador V3 — redesign do Parecer 13 (Julia Rennó)

Cópia de `Simulador V2 Modulos/` (31/08/2026) com **todas as sugestões da auditoria de
produto/design aplicadas**. A V2 fica intacta como o build validado do dia; a V3 é a versão
com o "tapa no visual". Mesmo motor de cálculo (`js/calc/calcCusto.js` **inalterado**).

## O que mudou

### P0
- **Hero de resultado fixo no topo do painel direito** (`.result-hero` / `renderResultHero()`
  em `js/calc/locacao-individual.js`). Um número grande — a economia por veículo, na base do
  contrato (anual só para 12 meses). Sempre acima da dobra: com o detalhamento recolhido, o
  painel direito cabe na viewport.
  - **Correção (31/08):** o hero era `position:sticky` individual e, ao rolar, o card flutuava
    por cima dos próprios controles/PDF/detalhamento (z-index). Agora quem gruda é **o painel
    direito inteiro** (`.right-pane{position:sticky;top:88px;max-height:calc(100vh-88px);
    overflow-y:auto}`) — nada sobrepõe nada, e o painel rola internamente quando o
    detalhamento está aberto. `body.pres-mode .right-pane` volta a `static`.
- **Comparativo consolidado.** O bloco antigo (4 termômetros + ce-card + versus + 2 economias)
  foi para dentro de `<details> Ver como chegamos nesse número`, recolhido por padrão. O hero
  mostra própria × aluguel em dois cards e a economia da frota numa linha.
- **Modo escuro reescrito** (`css/base.css`): uma família de superfícies quente (`--bg #12140F`),
  `--muted` subiu para `#9AA28E` → contraste ≥ 7:1 no texto secundário (era ~4:1, reprovava AA).
  Tema claro: `--text` virou `#26281F` (era `#4A4A4A`).

### P1
- **Wizard**: rótulos da barra alinhados aos títulos (Aquisição/Capital/Operação/Impostos).
  Passos 3 e 4 com `<details class="adv"> Ajustes avançados` recolhendo os campos raros
  (licenciamento, ativação, desativação, adm. de frota; alíquotas PIS/IRPJ/CSLL). Passo 3
  visível caiu de 13 → ~7 campos. `main.js` abre o bloco se algum campo já tem valor.
- **Ícones SVG** (`js/ui/icons.js` — sprite + helper `window.icon()`) substituem emoji nos
  lugares estruturais: abas, topbar, títulos de seção do glossário, estados vazios da Frota
  Composta, badges. `data-ic="nome"` no HTML é trocado por `<svg class="ic" viewBox="0 0 24 24">`.
- **Frota Composta**: bordas sólidas (era tracejado). Estado vazio com CTA "Começar com o
  veículo do Simulador" (herda o contexto) + "Adicionar categoria em branco".
- **Login**: card compactado, `RAC` e `GF` ganham descrição ("Locação mensal — 6 a 24 meses" /
  "Gestão de Frotas — 12 a 48 meses"), campo **Matrícula do executivo** (opcional, vai para o
  PDF), cliente/qtd marcados como opcionais.

### P2
- **Tour**: 14 → 6 passos.
- **Estado selecionado**: cards de regime ganham preenchimento verde + texto verde + ✓.
- **Tooltips no toque**: `.tip` vira focável, clique abre (`icons.js`).
- **Verde institucional** (`--win` = `#00843D` claro): card vencedor, botão de PDF, econ-pill —
  o `#78DE1F` fluorescente ficou só como cor de acento (sliders, dots).
- Regime cards não usam mais `<h1>` (eram 26px por herança).

## Arquivos novos
- `js/ui/icons.js` — sprite SVG + tooltips no toque
- `_REDESIGN.md` (este)

## Ainda não feito (fora das sugestões da Julia)
- Logo do login ainda é o base64 de baixa resolução (trocar pelo `LOGO_OFICIAL` do `pdf.js`).
- Ícones por-termo do glossário (`.gcard-icon`) continuam emoji — Julia pediu só os títulos
  de seção.
- Item 05 do Parecer 12 (contradição PIS/COFINS sobre depreciação) — é decisão de cálculo,
  não de design.
