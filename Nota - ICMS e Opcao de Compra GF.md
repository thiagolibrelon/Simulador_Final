# Nota do Heitor — ICMS: dedução do cliente e opção de compra no GF

## ICMS entraria como dedução para o cliente, tipo IRPJ/CSLL/PIS?

Heitor de novo. Não — e a razão é a mesma lógica que já vale pro ISS na seção 05 do Parecer 07.

Os créditos de IRPJ/CSLL e a vedação de PIS/COFINS que já estão no simulador modelam a posição do cliente (locatário) em relação à sua própria base tributável: ele paga aluguel, deduz essa despesa do lucro (IRPJ/CSLL, só no Real) e tenta creditar o PIS/COFINS não-cumulativo pago embutido na fatura (vedado, pela SC COSIT 155/2023). Isso funciona porque IRPJ/CSLL e PIS/COFINS incidem sobre a receita/lucro do próprio cliente, e a nota fiscal de aluguel dá base documental pra esse cálculo.

ICMS não entra nesse jogo pelo lado do cliente, por um motivo estrutural: locação de bem móvel está fora do campo de incidência do ICMS. A nota fiscal de aluguel que o cliente recebe da Localiza não tem ICMS destacado — não existe, porque não há circulação de mercadoria. Sem ICMS destacado na nota, não há o que o cliente credite ou deduza como "ICMS sobre o aluguel". Diferente de IRPJ/CSLL/PIS/COFINS, que taxam a operação em si (ou a receita do cliente), o ICMS que discuti antes é inteiramente do lado da Localiza — pago na compra do carro, preso no CIAP por causa da proporção baixa de saídas tributadas, e só recuperado (parcialmente) na revenda do usado.

Ou seja: o ICMS é custo invisível embutido no preço que a Localiza pratica — pode (ou não) estar refletido indiretamente na mensalidade do aluguel — mas não é uma linha de crédito/dedução que o cliente possa lançar na própria apuração, como faz com IRPJ/CSLL. Adicionar um campo de "dedução de ICMS" no simulador, do lado do cliente, seria tecnicamente incorreto — não existe base legal pra isso.

O único lugar onde ICMS teria efeito visível e legítimo no simulador, do ponto de vista de precificação, é indiretamente — se algum dia vocês quiserem modelar o custo interno da Localiza (aquisição de frota) e como o ICMS não recuperado pressiona a mensalidade cobrada. Mas isso é modelagem de custo da locadora, não dedução do cliente.

## E no caso do GF, em que o cliente tem opção de compra do carro ao final do contrato?

Heitor. Boa pergunta — isso já está mapeado, com um risco em aberto, no Adendo de 21/08/2026 que anexei ao Parecer 07 (RAC×GF). Deixa eu conectar com o que discutimos de ICMS.

**1. A opção de compra em si não gera ICMS — só o exercício dela gera.**

Enquanto o contrato está rodando (o carro está locado, sem transferência de propriedade), não há fato gerador de ICMS — é a mesma lógica de sempre: locação de bem móvel está fora do campo do imposto. O ICMS só nasce se e quando o cliente exerce a opção e a Localiza efetivamente vende o carro pra ele no fim do contrato. Nesse momento, é uma venda de veículo usado como qualquer outra revenda — mesmo mecanismo que já expliquei: novo fato gerador, potencialmente com base de cálculo reduzida (tributação por margem, se o estado equiparar a locadora a revendedor de usados), e é o gatilho que libera (parcialmente) o crédito de ICMS que ficou preso no CIAP desde a compra do carro pela Localiza.

**2. O ponto que realmente importa aqui não é o ICMS — é como o preço dessa opção está desenhado.**

Isso é o que levantei no Adendo: recebi o texto da cláusula-padrão de GF, e ela prevê que o cliente adimplente pode "ficar isento de devolver o carro" mediante pagamento. O dado que falta, e que decide tudo, é como esse valor é calculado:

- Se for **valor de mercado do veículo na data** (tipo tabela FIPE) → a operação se sustenta como locação operacional com venda posterior autônoma. Baixo risco. O tratamento de aluguel dedutível (IRPJ/CSLL no Real, vedação de PIS/COFINS) que já está no simulador continua valendo normalmente durante todo o contrato.
- Se for **valor pré-fixado, simbólico, ou diluído/antecipado nas parcelas mensais** (o clássico VRG antecipado de leasing) → a Lei 6.099/1974 classifica isso como arrendamento mercantil desde a origem, não locação. Consequência prática: o art. 13, VIII da Lei 9.249/95 tira a dedutibilidade plena do aluguel e obriga o cliente a tratar como depreciação + encargo financeiro — um regime fiscal diferente do que o simulador modela hoje para GF.

**3. Efeito prático pro simulador:** enquanto o jurídico não confirmar qual dos dois cenários é o real (pedido que já fiz no Adendo — como o valor é calculado, se está diluído nas parcelas, se é cláusula padrão ou pontual), eu não mudaria nada na modelagem de GF por causa da opção de compra. Mas é um risco pendente: se vier confirmado que o valor é pré-fixado/diluído, o simulador estaria superestimando o benefício fiscal do GF para o cliente, porque estaria tratando como locação pura algo que juridicamente é mais parecido com financiamento.

ICMS, nesse cenário todo, fica marginal — é só o gatilho da venda final, que já não afeta o cliente como dedução (ele só compra o carro, sem crédito de ICMS possível numa aquisição assim). O ponto que pesa é o IRPJ/CSLL/PIS-COFINS na natureza do contrato inteiro, não o ICMS pontual da venda residual.
