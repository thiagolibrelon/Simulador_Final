# Simulador Estratégico de Frota — Localiza&Co (V2 Modularizado)

Extração estrutural do arquivo único `Simulador v2.html` (raiz do repositório) em módulos de
HTML/CSS/JS separados. **Nenhuma lógica, fórmula, id, nome de função ou comportamento foi
alterado** — este é um corte/reorganização 1:1 do código original, verificado linha a linha
(ver seção "Verificação" abaixo). O arquivo original permanece intocado na raiz do repositório
e continua sendo a versão em produção até que este pacote seja adotado.

## Como rodar

Sem build step. Abra `index.html` direto no navegador (`file://`, duplo clique) ou sirva a
pasta como arquivos estáticos (`python -m http.server`, `npx serve`, etc.). Os scripts usam
`<script src="...">` clássico (não `type="module"`) exatamente pelo motivo do app original:
módulos ES falham sob `file://` por causa de CORS, e o app é usado tanto direto no navegador
quanto empacotado com Nativefier/Electron.

## Arquitetura

- `index.html` — mesma marcação do `<body>` do arquivo original, verbatim. O `<head>` troca o
  `<style>` inline por `<link rel="stylesheet">` para cada arquivo CSS; o `<script>` inline
  único vira uma sequência de `<script src>` no fim do `<body>`, **na ordem de dependência**
  (ver abaixo). Como scripts clássicos compartilham o mesmo escopo léxico global do documento,
  qualquer `function`/`let`/`const` de nível superior definido em um arquivo carregado antes
  continua visível para os arquivos carregados depois — igual ao comportamento do arquivo único
  original.
- `css/` — dividido por seção/feature, seguindo os próprios comentários de divisão que já
  existiam no `<style>` original.
- `js/` — dividido por feature. `utils.js` e `state.js` são a base (helpers puros e estado
  global mutável); os módulos de `calc/` e `ui/` dependem deles; `main.js` carrega por último
  e faz a inicialização (`DOMContentLoaded`).

### Ordem de carregamento dos scripts (fixa, não reordenar)

```
utils.js → state.js → ui/theme.js
  → calc/locacao-individual.js → calc/comparativo-individual.js → calc/frota-composta.js
  → ui/login.js → ui/client-panel.js → ui/tabs.js → ui/wizard.js
  → ui/checklist.js → ui/presentation.js → ui/tour.js → ui/frota-composta.js
  → ui/pdf.js → main.js
```

`main.js` precisa ser o último porque seu `DOMContentLoaded` chama `calc()`, `restoreEVState()`
e `restoreLSFC()`, definidos em arquivos anteriores. Os três módulos `calc/*` precisam vir
antes dos módulos `ui/*` que os chamam (ex.: `ui/frota-composta.js` chama `calcModelo()`/
`calcFrota()`, que vivem em `calc/frota-composta.js`).

## Mapa de módulos por aba

| Aba | Calc/lógica | Render/UI | CSS |
|---|---|---|---|
| Simulador (wizard) | `js/calc/locacao-individual.js` — `calc()`, `gerarConclusao()`, regime/manutenção/produto, `LS_IDS`/`saveLS()`/`restoreState()` | `js/ui/wizard.js` (steps, sliders, qtd. veículos) | `css/tabs/locacao-individual.css` |
| Comparativo Individual (EV) | `js/calc/comparativo-individual.js` — `calcEV()` e todo o restante `ev_`-prefixado, `EV_LS_IDS`/`saveLSEV()`/`restoreEVState()` | inputs com handlers inline no próprio HTML | `css/tabs/comparativo-individual.css` |
| Frota Composta (FC) | `js/calc/frota-composta.js` — **só** `calcModelo(m, perfil)` e `calcFrota()`, mantidos puros/sem DOM, igual ao original | `js/ui/frota-composta.js` — cards, dashboard, modal CRUD, import do Simulador, `saveLSFC()`/`restoreLSFC()` | `css/tabs/frota-composta.css` |
| Glossário | nenhuma — conteúdo estático, só usa `switchTab()` | — | `css/tabs/glossario.css` |
| Decisões | nenhuma — conteúdo estático, só usa `switchTab()` | — | `css/tabs/decisoes.css` |

Transversais: `js/utils.js` (formatadores `R`, `R2`, `Pct`, `pc`, `n`, `el`, `set`, `pmt`),
`js/state.js` (todo estado global mutável e config compartilhada entre abas, incluindo
`MANUT_REF` que é usado pelas 3 abas de cálculo), `js/ui/theme.js` (tema claro/escuro),
`js/ui/login.js` (tela inicial), `js/ui/client-panel.js` (painel de cliente na topbar),
`js/ui/tabs.js` (`switchTab()`), `js/ui/checklist.js` (modal de checklist para o Teams),
`js/ui/presentation.js` (modo apresentação), `js/ui/tour.js` (tour guiado),
`js/ui/pdf.js` (as 3 funções de exportação de PDF: `exportPDF()`, `exportPDFEV()`,
`exportPDFFrota()` — mantidas juntas porque compartilham o asset `LOGO_OFICIAL` e o mesmo
padrão de popup de impressão).

## Verificação realizada

Verificação estrutural automatizada (não houve verificação visual em navegador real além do
smoke test abaixo — ver ressalva):

1. **Cobertura de linhas exata (multiset diff), não apenas contagem de caracteres**: todo o
   bloco `<style>` original (1185 linhas não-vazias) e todo o bloco `<script>` original (1989
   linhas, incluindo vazias) foram comparados linha a linha contra os arquivos novos — **0
   linhas faltando, 0 linhas extras** em ambos os casos.
2. **Toda função, `const` e `let` de nível superior do script original** (67 functions, 15
   consts, 20 lets) aparece **exatamente uma vez** em algum arquivo `js/`.
3. **Markup do `<body>`**: comparação de string exata (não apenas contagem) entre o `<body>`
   original e o `<body>` do novo `index.html` — idêntico, char a char.
4. `node --check` em cada arquivo `.js` individualmente e na concatenação de todos na ordem
   real de carregamento do `index.html` — sintaticamente válido, sem erro de declaração
   duplicada de `let`/`const` no escopo global compartilhado.
5. **Smoke test em navegador real** (Chrome via automação, servindo a pasta por HTTP local):
   tela de login → validação de campo obrigatório → entrada no app → troca entre as 5 abas →
   adicionar um modelo na Frota Composta (exercita `calcModelo`→`calcFrota`→`renderFCCard`→
   `renderFCDashboard` entre os dois arquivos `frota-composta.js`) → alternância de tema →
   Glossário. **Zero erros de console** em todas as etapas, com os valores calculados e o
   layout renderizando como esperado.

Não foi feita comparação pixel-a-pixel entre o app original e este; o smoke test cobriu fluxo
funcional, não uma auditoria visual completa de todas as 5 abas em ambos os temas.

## Observações estruturais (para o time que for herdar o código)

Estas são observações sobre o código **como ele já era** no arquivo original — nada foi
alterado aqui, é só o que ficou mais visível depois de separar por arquivo:

- **Três blocos de cálculo quase paralelos.** `calc()` (Simulador), `calcEV()` (Comparativo
  Individual) e `calcModelo()`/`calcFrota()` (Frota Composta) implementam a mesma lógica de
  aquisição/depreciação/tributos/comparativo três vezes, com convenções de nome levemente
  diferentes (`ev_` / `fc_` prefixados nos ids de input). Foram mantidos como três arquivos
  deliberadamente — unificar isso é uma mudança de lógica, fora do escopo desta extração — mas
  é o principal candidato a refatoração futura (ex.: um único `calcCusto(params)` parametrizado
  por prefixo, com cada aba só montando o objeto de entrada).
- **Estado global mutável extenso.** Praticamente toda a lógica de negócio depende de
  variáveis `let` de módulo (`perfil`, `lastCalc`, `evPerfil`, `lastCalcEV`, `frota`,
  `fcPerfil`, `fcEditId`, etc.) em vez de passar estado explicitamente entre funções. Isso
  força a ordem de carregamento de scripts descrita acima e vai dificultar uma futura migração
  para módulos ES ou um framework de componentes — qualquer refatoração de arquitetura precisa
  primeiro decidir o que fazer com esse estado compartilhado.
- **`js/ui/pdf.js` gera HTML por concatenação de strings** (os três `export*()` montam um
  documento HTML completo, incluindo um `<style>` e um `<script>` inteiros como texto, para
  abrir em `window.open()` e imprimir). Isso é frágil para qualquer edição futura do layout do
  PDF — um erro de fechamento de tag dentro da string não dá erro de sintaxe JS, só quebra o
  PDF renderizado. Também foi a única fonte de falso-positivo na extração automatizada (os
  comentários CSS dentro dessas strings de template pareciam, à primeira vista de uma extração
  ingênua por regex, comentários de JS de nível superior — corrigido manualmente, mas é um
  sintoma da fragilidade desse padrão).
- **CSS já era organizado por feature/seção**, não por camada atômica (não havia uma camada de
  "componentes" isolada). `css/components.css` foi criado extraindo apenas o que claramente já
  era reutilizado entre abas com confiança (tooltip `.tip`, `.input-wrap`/`.input-row`,
  `.field-group`); o resto do CSS manteve a organização por aba/seção que já existia no
  original — forçar uma separação atômica completa exigiria decisões de design system que não
  cabem numa extração estrutural sem risco de regressão visual.
- **Glossário e Decisões são 100% estáticos** — não têm arquivo `calc/` ou `ui/` próprio porque
  não há JS dedicado a eles no original além do `switchTab()` compartilhado.
- `LOGO_OFICIAL` (constante base64 do logo, ~30KB) foi colocada em `js/ui/pdf.js` porque é o
  único consumidor identificado no código original (usada nos cabeçalhos/rodapés dos 3 PDFs).
