# Testes Reais — Simulador Estratégico de Frota (Localiza&Co)

**Gerado em 31/08/2026** · motor `Simulador V2 Modulos/` (versão modular, pós-reunião 31/08 + motor plurianual do Parecer 11).

6 cenários com valores realistas: **3 RAC PJ** (prazos 6/12/18 meses) e **3 GF — Gestão de Frotas** (prazos 24/36/48 meses).
Cada teste foi rodado isoladamente (estado limpo entre execuções — `localStorage` zerado e formulário refeito do zero) para não haver contaminação cruzada.

Para cada teste há dois arquivos nesta pasta:
- `Teste_N_....html` — o relatório executivo como sai do botão "Exportar PDF" (abra e Ctrl+P → Salvar como PDF se quiser regerar).
- `Teste_N_....pdf` — o mesmo relatório já convertido para PDF (Chrome headless, A4, sem cabeçalho/rodapé do navegador).

---

## Fontes dos valores (pesquisa de mercado, ago/2026)

| Item | Referência usada | Fonte |
|---|---|---|
| Fiat Argo Drive 1.3 CVT | tabela ~R$ 103.000 (Argo parte de R$ 94.790) | Mercado Livre / Capital Fiat |
| VW Polo / T-Cross | Polo Track R$ 95.490 · T-Cross assinatura VW ~R$ 1.899/mês (1.800 km/mês) | InfoMoney (comparativo assinatura) |
| Toyota Corolla XEi 2.0 | tabela ~R$ 175.000 | catálogo Mobiauto (faixa Corolla) |
| Toyota Corolla Cross XRX Hybrid | R$ 219.890 | Guarulhos Todo Dia / Garagem360 |
| Jeep Compass Longitude T270 | linha 2026 parte de ~R$ 170.000 (Sport) — Longitude ~R$ 195.000 | Auto+ / Carro.Blog.Br / Mobiauto |
| Fiat Toro Freedom 1.3 T270 | ~R$ 175.000 (faixa Freedom/Ranch) | estimativa de mercado |
| Aluguel mensal popular (Onix/Argo) | R$ 1.559 (Porto) · R$ 1.669 (Onix Plus) · Localiza Meoo ~R$ 1.000/mês (48m, 3.000 km/mês) | InfoMoney |
| Aluguel SUV compacto | T-Cross R$ 1.899/mês (assinatura VW) | InfoMoney |
| Franquia de km típica | 1.800–3.000 km/mês nos planos citados | InfoMoney |
| Terceirização de frota inclui | manutenção preventiva, seguro, documentação, IPVA, troca de óleo, **troca de pneus**, gestão de multas, assistência 24h | Edenred / CityCar |

> As mensalidades de RAC PJ e GF nos testes foram estimadas **acima** das tarifas PF de assinatura (contrato empresarial, prazo mais curto/longo, pacote completo com reserva). São valores plausíveis para negociação, não tabelas oficiais.

---

## Premissas comuns a todos os testes

- **Alíquotas fiscais:** PIS/COFINS 9,25% · IRPJ 25% · CSLL 9%
- **Depreciação:** Contábil/Fiscal — 20% a.a. (5 anos), quota mensal (IN RFB 1.700/2017, Anexo III)
- **Pneus:** custo de **frota própria** (linha separada da manutenção — "exceto pneus"). O pacote GF/RAC já inclui troca de pneus, portanto **não** entra no custo do aluguel. (Confirmado na reunião: "mostrar quanto o cliente gastaria com a própria frota".)
- **Motor plurianual (Parecer 11):** para prazo ≠ 12 meses, a comparação-título é o **custo no contrato inteiro** — aquisição, ativação/desativação e revenda entram 1×; aluguel/manutenção/seguro/IPVA/oportunidade/créditos acompanham o prazo; depreciação = quota mensal × nº de meses; saldo devedor do financiamento ao fim é quitado com o produto da revenda. Para prazo = 12 meses, a comparação-título é o snapshot anual (modelo validado).

---

# TESTE 1 — RAC PJ · Frota comercial popular · 12 meses

**Cliente:** Distribuidora Norte Alimentos Ltda · **Executivo:** Carlos Menezes · **Frota:** 20 veículos
**Veículo simulado:** Fiat Argo Drive 1.3 CVT 2026 · **Regime:** Lucro Real

### Entradas

| Variável | Valor |
|---|---|
| Produto de locação | RAC PJ |
| Prazo do contrato | 12 meses |
| Preço de tabela | R$ 103.000,00 |
| Desconto negociado | 8,0% |
| Percentual de entrada | 30% |
| Financiamento | 24 meses |
| Juros mensais | 1,49% a.m. |
| Custo de oportunidade | 12,5% a.a. |
| Manutenção anual (exceto pneus) | 2,0% |
| Aumento anual da manutenção | 15% a.a. |
| Pneus / ano | R$ 2.400,00 |
| Seguro anual | 4,0% |
| Estado (IPVA) | São Paulo — 4,0% |
| Custo de indisponibilidade / ano | R$ 4.000,00 |
| Depreciação | Contábil / Fiscal (20% a.a.) |
| Preço estimado de revenda | R$ 68.000,00 |
| Licenciamento / ano | R$ 160,00 |
| Custo de ativação | R$ 1.200,00 |
| Custo de desativação | R$ 900,00 |
| Administração de frota / mês | R$ 180,00 |
| Mensalidade do aluguel | R$ 2.190,00 |
| Administração do aluguel / mês | R$ 0,00 |
| Proteção Total Avarias / mês | R$ 0,00 |
| Proteção Vidros e Pneus / mês | R$ 0,00 |
| Telemetria (Carro Conectado) / mês | R$ 120,00 |
| Atividade fim? | Sim — dedução total |
| Categoria do veículo | Econômico |

### Valores calculados de aquisição

| | |
|---|---|
| Valor negociado do veículo (após desconto) | R$ 94.760,00 |
| Entrada (30%) | R$ 28.428,00 |
| Parcela (24×) | R$ 3.308,00 |
| Total de juros no financiamento | R$ 13.053,00 |

### Resultado — comparação anual (prazo = 12 meses)

| | Frota Própria | Aluguel (RAC PJ) |
|---|---|---|
| Custo efetivo / veículo / ano | **R$ 30.449** | **R$ 16.354** |
| Aluguel bruto no contrato | — | R$ 26.280 |

**Vencedor: LOCAÇÃO.** Economia estimada **R$ 14.095 / veículo / ano** → **R$ 281.906 / ano para a frota de 20 veículos**.

---

# TESTE 2 — RAC PJ · Sedan executivo · projeto temporário · 6 meses

**Cliente:** Vega & Associados Auditoria Contábil · **Executivo:** Fernanda Prado · **Frota:** 5 veículos
**Veículo simulado:** Toyota Corolla XEi 2.0 Flex 2026 · **Regime:** Lucro Presumido

### Entradas

| Variável | Valor |
|---|---|
| Produto de locação | RAC PJ |
| Prazo do contrato | 6 meses |
| Preço de tabela | R$ 175.000,00 |
| Desconto negociado | 5,0% |
| Percentual de entrada | 40% |
| Financiamento | 36 meses |
| Juros mensais | 1,65% a.m. |
| Custo de oportunidade | 11,0% a.a. |
| Manutenção anual (exceto pneus) | 1,8% |
| Aumento anual da manutenção | 15% a.a. |
| Pneus / ano | R$ 3.200,00 |
| Seguro anual | 3,2% |
| Estado (IPVA) | Minas Gerais — 4,0% |
| Custo de indisponibilidade / ano | R$ 6.000,00 |
| Depreciação | Contábil / Fiscal (20% a.a.) |
| Preço estimado de revenda | R$ 150.000,00 |
| Licenciamento / ano | R$ 150,00 |
| Custo de ativação | R$ 1.500,00 |
| Custo de desativação | R$ 1.500,00 |
| Administração de frota / mês | R$ 250,00 |
| Mensalidade do aluguel | R$ 3.850,00 |
| Administração do aluguel / mês | R$ 0,00 |
| Adicionais (todos) | R$ 0,00 |
| Atividade fim? | Não |
| Categoria do veículo | Intermediário Sedan |

### Valores calculados de aquisição

| | |
|---|---|
| Valor negociado do veículo | R$ 166.250,00 |
| Entrada (40%) | R$ 66.500,00 |
| Parcela (36×) | R$ 3.697,00 |
| Total de juros no financiamento | R$ 33.339,00 |
| Saldo devedor ao fim dos 6 meses (30 parcelas) | R$ 110.907,00 |

### Resultado — comparação no contrato inteiro (6 meses)

| | Frota Própria | Aluguel (RAC PJ) |
|---|---|---|
| Custo no contrato de 6 meses / veículo | **R$ 72.470** | **R$ 23.100** |
| _(snapshot anual — só referência)_ | _R$ 39.317_ | _R$ 46.200_ |

**Vencedor: LOCAÇÃO.** Economia **R$ 49.370 / veículo** no contrato → **R$ 246.850 para a frota de 5 veículos**.

> **Caso ilustrativo do motor plurianual:** o snapshot anual sugeriria *comprar* (R$ 39,3 mil < R$ 46,2 mil). Mas comprar um Corolla de R$ 166 mil para usar 6 meses e revender — ainda devendo R$ 111 mil de financiamento — custa R$ 72,5 mil no período. Alugar por 6 meses custa R$ 23,1 mil. A projeção do contrato mostra o resultado correto.

---

# TESTE 3 — RAC PJ · SUV compacto para gestores · 18 meses

**Cliente:** Construtora Alvorada Engenharia S.A. · **Executivo:** Rodrigo Tavares · **Frota:** 8 veículos
**Veículo simulado:** Volkswagen T-Cross Comfortline 200 TSI 2026 · **Regime:** Lucro Real

### Entradas

| Variável | Valor |
|---|---|
| Produto de locação | RAC PJ |
| Prazo do contrato | 18 meses |
| Preço de tabela | R$ 165.000,00 |
| Desconto negociado | 6,0% |
| Percentual de entrada | 25% |
| Financiamento | 24 meses |
| Juros mensais | 1,55% a.m. |
| Custo de oportunidade | 13,0% a.a. |
| Manutenção anual (exceto pneus) | 2,2% |
| Aumento anual da manutenção | 15% a.a. |
| Pneus / ano | R$ 2.800,00 |
| Seguro anual | 3,5% |
| Estado (IPVA) | Paraná — 3,5% |
| Custo de indisponibilidade / ano | R$ 5.000,00 |
| Depreciação | Contábil / Fiscal (20% a.a.) |
| Preço estimado de revenda | R$ 108.000,00 |
| Licenciamento / ano | R$ 170,00 |
| Custo de ativação | R$ 1.400,00 |
| Custo de desativação | R$ 1.100,00 |
| Administração de frota / mês | R$ 220,00 |
| Mensalidade do aluguel | R$ 3.100,00 |
| Administração do aluguel / mês | R$ 0,00 |
| Proteção Total Avarias / mês | R$ 280,00 |
| Proteção Vidros e Pneus / mês | R$ 90,00 |
| Telemetria (Carro Conectado) / mês | R$ 130,00 |
| Atividade fim? | Sim — dedução total |
| Categoria do veículo | Intermediário Hatch Automático |

### Valores calculados de aquisição

| | |
|---|---|
| Valor negociado do veículo | R$ 155.100,00 |
| Entrada (25%) | R$ 38.775,00 |
| Parcela (24×) | R$ 5.841,00 |
| Total de juros no financiamento | R$ 23.864,00 |
| Saldo devedor ao fim dos 18 meses (6 parcelas) | R$ 35.047,00 |

### Resultado — comparação no contrato inteiro (18 meses)

| | Frota Própria | Aluguel (RAC PJ) |
|---|---|---|
| Custo no contrato de 18 meses / veículo | **R$ 109.767** | **R$ 40.667** |
| _(snapshot anual — só referência)_ | _R$ 45.835_ | _R$ 27.111_ |
| Manutenção no contrato (curva por idade) | R$ 5.374 | — |
| Pneus no contrato (R$ 2.800 × 1,5 ano) | R$ 4.200 | — |

**Vencedor: LOCAÇÃO.** Economia **R$ 69.101 / veículo** no contrato → **R$ 552.808 para a frota de 8 veículos**.

---

# TESTE 4 — GF (Gestão de Frotas) · Frota operacional pick-up · 36 meses

**Cliente:** Agropecuária Vale Verde Ltda · **Executivo:** Juliana Campos · **Frota:** 15 veículos
**Veículo simulado:** Fiat Toro Freedom 1.3 T270 AT 2026 · **Regime:** Lucro Real
**Franquia de Km:** 3.000 km/mês (36.000 km/ano) · **Carro reserva:** incluído no contrato

### Entradas

| Variável | Valor |
|---|---|
| Produto de locação | GF — Gestão de Frotas |
| Prazo do contrato | 36 meses |
| Preço de tabela | R$ 175.000,00 |
| Desconto negociado | 10,0% |
| Percentual de entrada | 20% |
| Financiamento | 48 meses |
| Juros mensais | 1,45% a.m. |
| Custo de oportunidade | 12,0% a.a. |
| Manutenção anual (exceto pneus) | 2,5% |
| Aumento anual da manutenção | 15% a.a. |
| Pneus / ano | R$ 4.200,00 |
| Seguro anual | 3,8% |
| Estado (IPVA) | Goiás — 3,75% |
| Custo de indisponibilidade / ano | R$ 7.000,00 |
| Depreciação | Contábil / Fiscal (20% a.a.) |
| Preço estimado de revenda (ao fim de 36 meses) | R$ 82.000,00 |
| Licenciamento / ano | R$ 180,00 |
| Custo de ativação | R$ 2.000,00 |
| Custo de desativação | R$ 1.800,00 |
| Administração de frota / mês | R$ 300,00 |
| Mensalidade do aluguel | R$ 4.450,00 |
| Administração do aluguel / mês | R$ 0,00 |
| Adicionais (todos) | R$ 0,00 (pacote GF) |
| Carro reserva | Incluído |
| Atividade fim? | Sim — dedução total |
| Categoria do veículo | Pick-up Com Ar Plus |

### Valores calculados de aquisição

| | |
|---|---|
| Valor negociado do veículo | R$ 157.500,00 |
| Entrada (20%) | R$ 31.500,00 |
| Parcela (48×) | R$ 3.662,00 |
| Total de juros no financiamento | R$ 49.769,00 |
| Saldo devedor ao fim dos 36 meses (12 parcelas) | R$ 43.942,00 |

### Resultado — comparação no contrato inteiro (36 meses)

| | Frota Própria | Aluguel (GF) |
|---|---|---|
| Custo no contrato de 36 meses / veículo | **R$ 208.539** | **R$ 90.914** |
| _(snapshot anual — só referência)_ | _R$ 49.088_ | _R$ 30.305_ |
| Manutenção no contrato (curva +15% a.a.) | R$ 13.673 | — |
| Pneus no contrato (R$ 4.200 × 3) | R$ 12.600 | — |
| Valor contábil ao fim / ganho de capital | R$ 63.000 / R$ 19.000 | — |
| Revenda líquida (revenda − imposto − saldo devedor) | R$ 31.598 | — |

**Vencedor: LOCAÇÃO.** Economia **R$ 117.626 / veículo** no contrato → **R$ 1.764.388 para a frota de 15 veículos**.

---

# TESTE 5 — GF · SUV para diretoria · 24 meses · SEM carro reserva

**Cliente:** Holding Participações Meridiano S.A. · **Executivo:** André Bittencourt · **Frota:** 6 veículos
**Veículo simulado:** Toyota Corolla Cross XRX Hybrid 2026 · **Regime:** Lucro Real
**Franquia de Km:** 2.000 km/mês (24.000 km/ano) · **Carro reserva:** NÃO incluído

### Entradas

| Variável | Valor |
|---|---|
| Produto de locação | GF — Gestão de Frotas |
| Prazo do contrato | 24 meses |
| Preço de tabela | R$ 219.900,00 |
| Desconto negociado | 4,0% |
| Percentual de entrada | 50% |
| Financiamento | 24 meses |
| Juros mensais | 1,50% a.m. |
| Custo de oportunidade | 11,5% a.a. |
| Manutenção anual (exceto pneus) | 1,8% |
| **Aumento anual da manutenção** | **12% a.a.** (padrão é 15% — alterado neste teste) |
| Pneus / ano | R$ 3.600,00 |
| Seguro anual | 3,0% |
| Estado (IPVA) | São Paulo — 4,0% |
| Custo de indisponibilidade / ano | R$ 9.000,00 |
| Depreciação | Contábil / Fiscal (20% a.a.) |
| Preço estimado de revenda (ao fim de 24 meses) | R$ 152.000,00 |
| Licenciamento / ano | R$ 170,00 |
| Custo de ativação | R$ 1.800,00 |
| Custo de desativação | R$ 1.500,00 |
| Administração de frota / mês | R$ 280,00 |
| Mensalidade do aluguel | R$ 5.200,00 |
| Administração do aluguel / mês | R$ 0,00 |
| Adicionais (todos) | R$ 0,00 |
| **Carro reserva** | **Não incluído** |
| Atividade fim? | Não |
| Categoria do veículo | Executivo Híbrido |

### Valores calculados de aquisição

| | |
|---|---|
| Valor negociado do veículo | R$ 211.104,00 |
| Entrada (50%) | R$ 105.552,00 |
| Parcela (24×) | R$ 5.270,00 |
| Total de juros no financiamento | R$ 20.918,00 |
| Saldo devedor ao fim dos 24 meses | R$ 0,00 (financiamento quitado) |

### Resultado — comparação no contrato inteiro (24 meses)

| | Frota Própria | Aluguel (GF) |
|---|---|---|
| Custo no contrato de 24 meses / veículo | **R$ 160.645** | **R$ 100.368** |
| _(snapshot anual — só referência)_ | _R$ 70.064_ | _R$ 50.184_ |
| **Indisponibilidade aplicada ao aluguel (sem carro reserva)** | — | **R$ 18.000** (R$ 9.000/ano × 2) |
| Manutenção no contrato (curva +12% a.a.) | R$ 8.056 | — |
| Pneus no contrato (R$ 3.600 × 2) | R$ 7.200 | — |
| Valor contábil ao fim / ganho de capital | R$ 126.662 / R$ 25.338 | — |
| Revenda líquida | R$ 143.385 | — |

**Vencedor: LOCAÇÃO.** Economia **R$ 60.277 / veículo** no contrato → **R$ 361.660 para a frota de 6 veículos**.

> **Caso ilustrativo do toggle "carro reserva":** como o contrato foi marcado **sem** carro reserva, o custo de indisponibilidade (R$ 9.000/ano) foi somado **também ao lado do aluguel** (R$ 18.000 no contrato), reduzindo a vantagem do GF nesse item. Com carro reserva incluído, o custo do aluguel cairia para ~R$ 82.368 e a economia subiria.

---

# TESTE 6 — GF · Frota longa · 48 meses (dispara alerta de arrendamento)

**Cliente:** Logística Integrada Continental Ltda · **Executivo:** Patrícia Nogueira · **Frota:** 25 veículos
**Veículo simulado:** Jeep Compass Longitude T270 2026 · **Regime:** Lucro Real
**Franquia de Km:** 2.500 km/mês (30.000 km/ano) · **Carro reserva:** incluído

### Entradas

| Variável | Valor |
|---|---|
| Produto de locação | GF — Gestão de Frotas |
| Prazo do contrato | 48 meses |
| Preço de tabela | R$ 195.000,00 |
| Desconto negociado | 9,0% |
| Percentual de entrada | 15% |
| Financiamento | 60 meses |
| Juros mensais | 1,39% a.m. |
| Custo de oportunidade | 12,5% a.a. |
| Manutenção anual (exceto pneus) | 2,0% |
| **Aumento anual da manutenção** | **18% a.a.** (padrão é 15% — alterado neste teste) |
| Pneus / ano | R$ 3.800,00 |
| Seguro anual | 3,5% |
| Estado (IPVA) | Rio de Janeiro — 4,0% |
| Custo de indisponibilidade / ano | R$ 8.000,00 |
| Depreciação | Contábil / Fiscal (20% a.a.) |
| Preço estimado de revenda (ao fim de 48 meses) | R$ 58.000,00 |
| Licenciamento / ano | R$ 180,00 |
| Custo de ativação | R$ 2.200,00 |
| Custo de desativação | R$ 2.000,00 |
| Administração de frota / mês | R$ 320,00 |
| Mensalidade do aluguel | R$ 4.900,00 |
| Administração do aluguel / mês | R$ 0,00 |
| Adicionais (todos) | R$ 0,00 |
| Carro reserva | Incluído |
| Atividade fim? | Sim — dedução total |
| Categoria do veículo | SUV Compacto |

### Valores calculados de aquisição

| | |
|---|---|
| Valor negociado do veículo | R$ 177.450,00 |
| Entrada (15%) | R$ 26.618,00 |
| Parcela (60×) | R$ 3.723,00 |
| Total de juros no financiamento | R$ 72.528,00 |
| Saldo devedor ao fim dos 48 meses (12 parcelas) | R$ 44.672,00 |

### Resultado — comparação no contrato inteiro (48 meses)

| | Frota Própria | Aluguel (GF) |
|---|---|---|
| Custo no contrato de 48 meses / veículo | **R$ 304.048** | **R$ 133.476** |
| _(snapshot anual — só referência)_ | _R$ 61.618_ | _R$ 33.369_ |
| Manutenção no contrato (curva +18% a.a.) | R$ 18.510 | — |
| Pneus no contrato (R$ 3.800 × 4) | R$ 15.200 | — |
| Valor contábil ao fim / ganho de capital | R$ 35.490 / R$ 22.510 | — |
| Revenda líquida (revenda − imposto − saldo devedor) | R$ 5.675 | — |

**Vencedor: LOCAÇÃO.** Economia **R$ 170.572 / veículo** no contrato → **R$ 4.264.308 para a frota de 25 veículos**.

> ⚠️ **Alerta do relatório (Parecer 07/11):** prazo de 48 meses ≥ 45 meses (75% da vida útil fiscal de 60 meses) → risco de reclassificação do contrato como **arrendamento mercantil financeiro** (Lei 6.099/1974, Res. BACEN 2.309/96), o que mudaria a dedutibilidade do aluguel. A ferramenta exibe esse aviso no PDF; confirmar as cláusulas com a área contábil antes de fechar.

---

## Resumo dos 6 testes

| # | Produto | Prazo | Veículo | Frota | Regime | Custo próprio (contrato/veíc.) | Custo aluguel (contrato/veíc.) | Vencedor | Economia (frota) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | RAC PJ | 12 m | Fiat Argo 1.3 | 20 | Real | R$ 30.449 /ano | R$ 16.354 /ano | Locação | **R$ 281.906 /ano** |
| 2 | RAC PJ | 6 m | Corolla XEi 2.0 | 5 | Presumido | R$ 72.470 | R$ 23.100 | Locação | **R$ 246.850** |
| 3 | RAC PJ | 18 m | VW T-Cross | 8 | Real | R$ 109.767 | R$ 40.667 | Locação | **R$ 552.808** |
| 4 | GF | 36 m | Fiat Toro | 15 | Real | R$ 208.539 | R$ 90.914 | Locação | **R$ 1.764.388** |
| 5 | GF | 24 m | Corolla Cross Hyb. | 6 | Real | R$ 160.645 | R$ 100.368 | Locação | **R$ 361.660** |
| 6 | GF | 48 m | Jeep Compass | 25 | Real | R$ 304.048 | R$ 133.476 | Locação | **R$ 4.264.308** |

> Nos 6 cenários a locação vence — esperado, dado que os valores de aluguel foram calibrados como propostas comerciais competitivas e a frota própria carrega aquisição, depreciação pesada no período, oportunidade do capital e pneus. Para inverter o resultado num teste, basta subir a mensalidade do aluguel ou baixar o custo de oportunidade / preço do veículo.

### O que cada teste exercita no motor

| # | Cobre |
|---|---|
| 1 | RAC 12 meses = snapshot anual · pneus como custo próprio · telemetria como adicional do aluguel |
| 2 | **Prazo quebrado curto (6 m)** · Lucro Presumido (sem créditos) · financiamento > prazo (saldo devedor abatido na revenda) · snapshot anual enganoso vs. contrato |
| 3 | **Prazo de 18 meses** (novo) · ano final parcial na curva de manutenção · adicionais de locação (Proteção Total, Vidros, Telemetria) |
| 4 | GF 36 meses · curva de manutenção plurianual (+15% a.a.) · ganho de capital na revenda · financiamento de 48 m com contrato de 36 m |
| 5 | GF 24 meses · **toggle "carro reserva" desligado** (indisponibilidade some no aluguel) · % de aumento de manutenção customizado (12%) · atividade fim "Não" |
| 6 | GF 48 meses · **alerta de arrendamento mercantil** (≥ 45 m) · % de manutenção 18% · revenda líquida ~zero após quitar financiamento longo |
