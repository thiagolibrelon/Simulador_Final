# Simulador Estratégico de Frota — Localiza&Co (V2 Modularizado)

Extração estrutural do arquivo único `Simulador v2.html` (raiz do repositório) em módulos de
HTML/CSS/JS separados — inicialmente um corte 1:1 do código original (ver seção "Verificação"
abaixo), depois estendida com o motor GF (ver "Motor GF" abaixo).

**⚠️ Desde 26/08/2026 esta pasta deixou de ser um espelho do arquivo monolítico.** O motor GF
(login RAC×GF, `calcCusto.js`, franquia de km, pneus, IPCA, projeção de manutenção) foi
construído **só aqui** — o `Simulador v2.html` da raiz não recebeu essas mudanças e ficou
para trás. Recomendação registrada na aba Decisões do app: adotar esta pasta como versão em
produção (e apontar o empacotamento Nativefier/Electron pra cá) em vez de manter as duas em
paralelo, já que replicar cada mudança nova em dois lugares dobra o risco de bug.

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
| Frota Composta (FC) | `js/calc/frota-composta.js` — **só** `calcModelo(m, perfil)` e `calcFrota()`, mantidos puros/sem DOM | `js/ui/frota-composta.js` — cards, dashboard, modal CRUD, import do Simulador, `saveLSFC()`/`restoreLSFC()` | `css/tabs/frota-composta.css` |
| Glossário | nenhuma — conteúdo estático, só usa `switchTab()` | — | `css/tabs/glossario.css` |

> **Removido em 31/08/2026** — a aba **Comparativo Individual** (`panelEv`, `js/calc/comparativo-individual.js`, `exportPDFEV()`, `css/tabs/comparativo-individual.css`) e a aba **Decisões** (`panelDec`, `css/tabs/decisoes.css`) saíram da ferramenta (a força de vendas não aderiu ao comparativo individual). O arquivo `css/tabs/comparativo-individual.css` foi **mantido** só porque a barra da Frota Composta reaproveita `.ev-bar*`/`.ev-badge-tag`. Também removido o toggle "Já possuo este veículo" (`jaPossui` sumiu de `calcCusto()` e do wizard).

Transversais: `js/utils.js` (formatadores `R`, `R2`, `Pct`, `pc`, `n`, `el`, `set`, `pmt`),
`js/calc/calcCusto.js` (motor único de cálculo — RAC e GF ramificam aqui; `calc()`
e `calcModelo()` só montam o objeto de entrada e chamam essa função), `js/state.js` (estado
global mutável e config compartilhada entre abas, incluindo `loginProduto`/
`loginPrazoContratoMeses`, decididos na tela de login), `js/ui/theme.js` (tema claro/escuro),
`js/ui/login.js` (tela inicial), `js/ui/client-panel.js` (painel de cliente na topbar),
`js/ui/tabs.js` (`switchTab()`), `js/ui/checklist.js` (modal de checklist para o Teams),
`js/ui/presentation.js` (modo apresentação), `js/ui/tour.js` (tour guiado),
`js/ui/pdf.js` (as 2 funções de exportação de PDF: `exportPDF()` e
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

- **Três blocos de cálculo quase paralelos — resolvido em 26/08/2026.** `calc()` (Simulador),
  `calcEV()` (Comparativo Individual) e `calcModelo()` (Frota Composta) implementavam a mesma
  lógica de aquisição/depreciação/tributos/comparativo três vezes. Extraído `calcCusto(params)`
  em `js/calc/calcCusto.js` — os três agora só montam o objeto de entrada (lendo de `ev_`/`fc_`
  ou do estado global `loginProduto`, conforme o caso) e chamam essa função única. Pré-requisito
  para o motor GF não precisar ser replicado em 3 lugares.
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

## Motor GF (26/08/2026)

Reverte a decisão anterior de tratar GF como um simples parâmetro do fluxo RAC (registrada na
aba Decisões em 20-21/08). RAC e GF agora são escolhidos uma vez na tela de login
(`selectStartProduto()` em `js/ui/login.js`), gravados em `loginProduto`/
`loginPrazoContratoMeses` (`js/state.js`), e `js/calc/calcCusto.js` ramifica o cálculo a partir
desse estado — sem tocar em `cAlq`/`fAno` para RAC (mesmo comportamento de sempre).

Campos operacionais / "Configuração do Aluguel": **Pneus** (`pneusAnual`, valor anual fixo —
custo de **frota própria**, entra em `opAno` e na base de crédito `manut+pneus+deprA`, **não**
no `cAlq`: GF/RAC já incluem troca de pneus no pacote; linha separada da manutenção, rótulo
"exceto pneus" — corrigido 31/08 conforme a ata),
Franquia de Km (`franquiaKm`, texto livre, só PDF, GF), **Carro reserva** (`carroReservaGf`,
checkbox, GF — se desmarcado, o custo de indisponibilidade também entra no lado da locação via
`indispLoc`), **Aumento anual da manutenção** (`manutIncrementoAnualPct`, campo editável default
15%, campo sempre visível — alimenta `manutPctNoAno()`). É estimativa **pendente de validação
contábil**, marcada como tal na UI e no PDF. Risco de reclassificação para arrendamento
mercantil financeiro (prazo ≥45 meses) é só nota no PDF (Parecer 07). O campo IPCA (`ipcaRef`)
foi **removido** em 31/08/2026 (comparação a valor presente — aplicar IPCA só ao contrato
Localiza distorceria a comparação).

**Prazo do contrato** — sempre visível no painel direito, opções por produto montadas em
`syncProdutoUI()` / `fcTogglePrazo()`: **RAC 6/12/18/24** (default 12), **GF 12/18/24/36/48**
(default = `loginPrazoContratoMeses`).

**Ajustes da auditoria (Parecer 12, itens 2/3/4 — 31/08/2026):**
- `hintFinPrazo` (Passo 2) + nota no PDF quando `parcelas > prazoMeses` — mostra quantas parcelas
  ficam em aberto e que são abatidas da revenda.
- Toggle "atividade fim" (`atividadeFim`) — rótulo virou "Veículo ligado à atividade da empresa?",
  opções "Sim — crédito total (PIS/COFINS + IRPJ + CSLL)" / "Não — só IRPJ/CSLL"; `hintAtividadeFim`
  aparece quando "não". Comportamento do motor não mudou (só zera `pisA`), só a comunicação.
- "Custo de oportunidade" → **"Custo de capital (TMA)"** em toda a UI (campo `oportunidadePct` mantém
  o id), `mc2box`, glossário, tour, PDF (`Custo de capital / TMA`), modal FC.

**Toggle "Incluir itens opcionais no cálculo" (`toggleAdic` / `toggleAdicionais()`, 31/08/2026):**
os 3 campos de adicionais (`adicSeguroTotal`/`adicVidros`/`adicTelemetria`) ficam num wrapper
`#adicWrap` escondido por padrão. Spin comercial: apresenta a economia limpa primeiro, o executivo
marca o toggle para inserir Proteção Total / Vidros / Telemetria e ver o impacto. Ao desmarcar,
zera os 3 campos. **Não persistem em localStorage** (removidos de `LS_IDS`) — toggle começa
desmarcado a cada sessão. Só no Simulador (o modal da Frota Composta mantém os campos visíveis).

**Motor plurianual (`result.periodo`, implementado 31/08/2026 — base: Parecer 11 do Heitor).**
Vale para RAC e GF. `calcCusto()` continua retornando o snapshot anual (`fAno`/`cAlq`/`econ`)
e agora também `periodo` com o **contrato inteiro** — a comparação-título para prazos
≠ 12 meses. **Para prazo = 12 meses a UI/PDF NÃO mostram o bloco de período** (o snapshot
anual já é a comparação de 12 meses).
**Correção de 04/09/2026:** até então, o snapshot anual (`revnd`, dentro de `fAno`/`cAlq`)
não descontava o saldo devedor do financiamento ainda em aberto após 12 meses — só o
período fazia isso (`revendaFimLiq`/`saldoFim`) — então para `np > 12` os dois podiam
divergir mesmo em contratos de 12 meses, incluindo o veredito de qual lado vence (foi o que
apareceu na tela do hero: "frota própria economiza R$64.964" contra "RAC mais barato por
R$1.440" no período, pro mesmo cenário). Corrigido reaproveitando `saldo` (já calculado,
nunca usado): `revnd = precoRevenda − impGanhoCap − saldo`, espelhando `revendaFimLiq`.
Como `saldo` (ano‑1) e `saldoFim` com `meses=12` são a mesma fórmula, os dois cálculos agora
**convergem por construção** quando o prazo é de 12 meses. O guard
`mostraPeriodo = per.meses !== 12 || c.np > per.meses` em `locacao-individual.js` (e o
`vencFinal`/`econVeicFinal` do `econPill`) ficou redundante pro caso `np > meses` — os dois
lados já concordam — mas continua correto e foi mantido, sem necessidade de reverter.
Classificação (Parecer 11): aquisição = `entrada + parcelas pagas dentro do contrato` **uma
vez**; saldo devedor ao fim quitado com o produto da revenda (`revendaFimLiq = revenda − imp.
ganho − saldoFim`); ativação/desativação **uma vez**; revenda **uma vez** sobre `valorContabilFim
= vV − deprA·anos` (quota mensal × nº de meses); aluguel/seguro/IPVA/licenciamento/indispon./
adm/oportunidade/créditos **× período**; **pneus** × período (lado próprio); manutenção pela
curva por idade com ano final parcial (18m → ano 1 inteiro + ano 2 a 50%). Exposto no finalist
(`vFrotaContratoVal`/`vAluguelContratoVal`/`epPeriodoRow`, escondidos quando meses=12), no PDF
(seção "Comparação no Contrato Inteiro", idem) e no card da Frota Composta.
Testado com 6 cenários reais em `Testes Reais/` (3 RAC 6/12/18m + 3 GF 24/36/48m, valores de
mercado ago/2026) — PDFs + `_VALORES_E_RESULTADOS.md`.

Frota Composta **não** migrou para o produto global — cada modelo em `frota[]` mantém seu
próprio `produtoLocacao`/`prazoContratoMeses`, já que uma frota heterogênea pode misturar RAC e
GF. O modal da FC ganhou `fc_pneusAnual`, `fc_manutIncrementoAnualPct` e `fc_carroReservaGf`
nesta rodada.
