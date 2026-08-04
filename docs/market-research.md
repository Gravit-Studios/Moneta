# Nora — Pesquisa de Mercado (Sprint 0 — Descoberta)

## 1. Concorrentes diretos (Brasil/LatAm)

**Organizze** — proposta de valor: simplicidade e disciplina manual; app mais antigo do mercado (desde 2011). Features: controle de contas/cartões, compartilhamento com cônjuge (melhor do segmento), suporte a Open Finance. Monetização: assinatura anual ~R$199,90/ano, versão gratuita generosa. Avaliação 4,5 na Play Store. Pontos fracos: interface "básica demais" para quem quer automação; poucas projeções futuras.

**Mobills** — proposta de valor: automação e integração com investimentos. Features: robusta versão free + premium (R$19,90/mês ou R$119,90/ano), sincronização bancária. Pontos fracos recorrentes (Reclame Aqui, nota ~5,4): bugs de sincronização, duplicidade de lançamentos, cobrança indevida após cancelamento de assinatura, dificuldade de excluir dados pessoais, suporte lento (~9 dias de resposta).

**GuiaBolso** — histórico de importação automática via Open Finance, mas foi comprado pelo PicPay em 2021 e está sendo descontinuado/absorvido pelo próprio PicPay — hoje não é mais concorrente ativo relevante.

**Money Lover** — diferencial: plano vitalício (pagamento único). Pouca penetração relatada no mercado brasileiro comparado aos nacionais.

**Minhas Economias / FinVibe / Serafin / FinançasPro** — players menores; FinançasPro já testa conexão via Open Finance + "metas gamificadas", indicando que gamificação começa a aparecer no radar de concorrentes, ainda de forma incipiente.

**Padrão geral de reclamações**: sincronização bancária instável, duplicidade de transações, dificuldade de cancelamento/exclusão de dados, suporte lento — e nenhuma menção relevante a "projeção financeira" ou "objetivos de vida" como diferenciais fortes em nenhum concorrente pesquisado.

## 2. Gaps de mercado

- **Já bem resolvido pelos concorrentes**: registro/categorização de receitas e despesas, integração bancária via Open Finance (Organizze, GuiaBolso/PicPay, FinançasPro), compartilhamento familiar (Organizze).
- **Espaço aberto para a Nora**:
  - (a) Projeção financeira de médio/longo prazo — nenhum concorrente pesquisado destaca isso como pilar.
  - (b) Gamificação robusta e contínua ligada a metas de vida — apenas menções superficiais/incipientes (FinançasPro; tendência emergente ainda não consolidada).
  - (c) Simplicidade + engajamento contínuo — a queixa recorrente hoje é ou complexidade (Mobills) ou simplicidade sem incentivo de uso (Organizze). A Nora pode se posicionar no meio, unindo simplicidade de entrada com jornada gamificada orientada a objetivos (aposentadoria, casa própria, viagem etc.) — combinação não encontrada consolidada em nenhum player nacional pesquisado.

## 3. Validação do público-alvo

Indícios qualitativos fortes de adoção digital: 66% dos brasileiros usam apps para pagamentos/consulta de saldo (Ipsos/Nubank); 95% das gerações Z/Y e 93% da geração X acessam contas via apps; mais de 42 milhões de usuários aderiram ao Open Finance até 2024.

Por outro lado, ~47% dos jovens da Geração Z não fazem controle financeiro algum (CNDL/SPC Brasil), sugerindo que a adoção de apps de *pagamento* é alta, mas a adoção de apps de *planejamento* ainda é baixa — o que valida a tese de que existe demanda latente não atendida por ferramentas de puro registro, reforçando a oportunidade da Nora com foco em planejamento/projeção, não apenas lançamento de gastos.

## 4. Riscos/considerações regulatórias

- **Open Finance (Banco Central)**: integração bancária exige consentimento explícito, revogável e com prazo definido — a Nora precisará implementar um fluxo de consentimento robusto caso venha a integrar contas bancárias (previsto para a v3 do produto). Mudança relevante em 2026: portabilidade de crédito via Open Finance com prazo reduzido para 3 dias úteis (crédito pessoal desde fev/2026, consignado previsto até nov/2026) — não afeta diretamente o MVP, mas mostra o escopo crescente do sistema.
- **LGPD**: dados financeiros exigem consentimento livre, informado e específico (não vale "aceitar tudo"), minimização de dados, medidas de segurança adequadas, e notificação à ANPD em caso de vazamento. Esses pontos devem constar nos requisitos não-funcionais desde o desenho técnico, especialmente considerando que a Nora planeja sincronização bancária automatizada na v3.

## Fontes

- https://focca-ai.com/melhor-app-financeiro-2026
- https://zapgastos.com/blog/mobills-ou-organizze/
- https://www.finvibe.app/blog/mobills-x-organizze-x-finvibe-x-minhas-economias-qual-o-melhor-app-de-financas
- https://www.reclameaqui.com.br/empresa/mobills-educacao-financeira/
- https://www.reclameaqui.com.br/mobills-educacao-financeira/mobills-com-problema-na-sincronizacao-ha-mais-de-um-mes_nDVScQW5GmUl6imO/
- https://international.nubank.com.br/pt-br/companhia/summit-de-impacto-financeiro/
- https://cndl.org.br/politicaspublicas/47-dos-jovens-da-geracao-z-nao-realizam-o-controle-das-financas-aponta-pesquisa-cndl-spc-brasil/
- https://sejarelevante.fdc.org.br/como-jovens-e-pessoas-maduras-lidam-com-o-dinheiro/
- https://www.mercadopago.com.br/blog/open-finance-2026-mudancas-novidades
- https://verticefin.com.br/open-finance-brasil/
- https://legale.com.br/blog/open-finance-regulacao-lgpd-e-responsabilidade-legal/
- https://blog.bgcbrasil.com.br/lgpd-no-mercado-financeiro
- https://emprestimo.beneficioja.com.br/2026/05/13/gamificacao-nas-financas-como-apps-brasileiros-estimulam-a-poupanca/
- https://napratica.org.br/noticias/6-apps-gratuitos-para-organizar-a-vida-financeira
