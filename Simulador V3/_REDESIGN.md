# Simulador V3 — redesign do Parecer 13 (Julia Rennó)

Cópia de `Simulador V2 Modulos/` (31/08/2026) com **todas as sugestões da auditoria de
produto/design aplicadas**. A V2 fica intacta como o build validado do dia; a V3 é a versão
com o "tapa no visual". Mesmo motor de cálculo (`js/calc/calcCusto.js` **inalterado**).

## O que mudou

### Revenda, pneus e PDF (24/09/2026 — reunião pós-apresentação RMR)
- **Revenda = fim do contrato.** `precoRevendaEstimado` passou a ser o preço ao fim do
  prazo. Vazio → referência de mercado (`valorReferenciaRevenda` em `calcCusto.js`):
  1º ano = depreciação contábil; anos seguintes −10% a.a. sobre o ano anterior
  (`TAXA_MERCADO_POS_ANO1_PCT_DEFAULT`, ou a taxa Real/Mercado se esse método for escolhido).
  Estimativa pendente de validação com dados da Localiza Seminovos. O snapshot do 1º ano só
  usa o preço digitado quando o prazo é ≤ 12 meses. Link "usar referência como revenda"
  corrigido (antes usava o contábil de 1 ano mesmo em 36m).
- **Pneus removidos de vez** (Simulador, Frota Composta, PDF, glossário) — ficam contidos no
  % de manutenção.
- **PDF:** aquisição (entrada + parcelas) e custo de oportunidade/TMA em linhas separadas no
  quadro anual; % de economia no destaque com nota "varia conforme cenário"; mesmo % na
  conclusão (`pctEconomia()` — antes, com a própria vencendo, a base estava errada).

### PDF executivo — contratos acima de 12 meses (08/09/2026)
- O hero, o vencedor, os custos-resumo e a conclusão agora usam o resultado acumulado do
  contrato inteiro. A visão dos primeiros 12 meses permanece como referência complementar,
  identificada explicitamente para não competir com o resultado principal.
- O detalhamento do contrato completo começa em uma nova página, evitando título órfão no
  rodapé da página anterior. Contratos de 12 meses preservam a apresentação anual existente.

### Atualização da marca (08/09/2026)
- Removido o pequeno logotipo e o divisor do topo do card de login.
- A topbar e o relatório executivo passaram a usar a nova marca Localiza fornecida, com um
  recorte proporcional próprio para leitura em cabeçalhos e rodapés compactos.

### Modo interno da memória de cálculo (08/09/2026)
- Os controles de memória de cálculo foram removidos das telas do Simulador e da Frota
  Composta. Na aba Glossário, `Ctrl+Shift+M` revela as duas opções internas de teste.
- As opções não persistem e são desmarcadas ao voltar à tela inicial, reduzindo o risco de
  enviar acidentalmente o apêndice técnico em uma simulação comercial.

### Depreciação no início do wizard (08/09/2026)
- Método de depreciação e preço estimado de revenda foram movidos de Operação para Aquisição,
  em um bloco destacado e sempre visível. A taxa de mercado continua aparecendo quando esse
  método é selecionado, e o atalho com o valor contábil líquido acompanha o campo de revenda.
- O motor de cálculo e os identificadores dos campos foram preservados; a mudança é de ordem,
  hierarquia e ênfase visual.

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
- Ícones por-termo do glossário (`.gcard-icon`) continuam emoji — Julia pediu só os títulos
  de seção.
- Item 05 do Parecer 12 (contradição PIS/COFINS sobre depreciação) — é decisão de cálculo,
  não de design.
