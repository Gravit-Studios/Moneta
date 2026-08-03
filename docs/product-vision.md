# Moneta — Documento de Visão do Produto (Product Vision v1)

## Visão

O Moneta é uma plataforma de gestão financeira pessoal focada em planejamento, organização e evolução financeira.

Diferente dos aplicativos tradicionais, que apenas registram receitas e despesas, o Moneta atua como um assistente financeiro inteligente, ajudando o usuário a compreender sua situação atual, prever seu futuro financeiro e atingir objetivos por meio de dados, automações e gamificação.

A proposta é transformar a relação do usuário com o dinheiro, incentivando hábitos saudáveis e decisões conscientes.

## Missão

Permitir que qualquer pessoa tenha total controle sobre sua vida financeira de forma simples, visual e motivadora.

## Visão de longo prazo

Ser a principal plataforma de organização financeira pessoal da América Latina, integrando bancos, cartões, investimentos, inteligência artificial e planejamento financeiro em um único ambiente.

## Público-alvo

### Inicial

- Pessoas físicas
- Trabalhadores CLT
- Autônomos
- MEIs
- Pequenos empresários
- Famílias

Faixa etária predominante: 25 a 45 anos

## Problemas encontrados hoje

Os aplicativos atuais geralmente possuem alguns problemas:

- Muito focados em lançamentos manuais.
- Interface complexa.
- Pouco incentivo ao uso contínuo.
- Não ajudam na tomada de decisão.
- Não apresentam projeções futuras.
- Não estimulam economia.
- Não trabalham objetivos de vida.

O Moneta nasce para resolver exatamente essas dores.

## Proposta de Valor

"Organize seu dinheiro. Planeje seu futuro. Conquiste seus objetivos."

O aplicativo deve responder diariamente três perguntas:

1. Onde estou?
2. Para onde meu dinheiro está indo?
3. Quanto falta para alcançar meus objetivos?

## Princípios do Produto

### Simplicidade
Poucos toques. Poucas telas. Informações claras.

### Inteligência
O sistema deve interpretar dados e gerar recomendações. Não apenas armazenar informações.

### Motivação
O usuário deve sentir evolução. Toda interação deve gerar sensação de progresso.

### Previsibilidade
Mostrar o futuro. Não apenas o passado.

### Segurança
Dados financeiros exigem confiança. Todo o sistema deve ser desenvolvido pensando em segurança desde o início.

## MVP

### Cadastro
- Usuário
- Login
- Recuperação de senha
- Perfil

### Dashboard
Resumo geral. Widgets:
- Saldo atual
- Receitas do mês
- Despesas do mês
- Contas pendentes
- Contas vencidas
- Próximos vencimentos
- Metas
- Alertas

### Receitas
Cadastro manual. Campos:
- Nome
- Valor
- Categoria
- Data
- Recorrência
- Observações

### Despesas
Cadastro manual. Campos:
- Nome
- Valor
- Categoria
- Vencimento
- Pago
- Forma de pagamento
- Centro de custo (opcional)
- Observações

### Contas recorrentes
Cadastro único. O sistema gera automaticamente os próximos lançamentos.
Exemplos: Aluguel, Água, Energia, Internet, Academia.

### Parcelamentos
Cadastro inteligente. Campos:
- Produto
- Valor total
- Quantidade de parcelas
- Valor da parcela
- Data inicial
- Cartão
- Categoria

O sistema deve gerar automaticamente as parcelas futuras. Mostrar:
- Parcela atual
- Parcelas restantes
- Valor restante

### Cartões
Cadastro. Campos:
- Nome
- Limite
- Dia do fechamento
- Dia do vencimento

Mostrar:
- Limite disponível
- Utilizado
- Próxima fatura

### Categorias
Customizáveis. Categorias padrão:
- Moradia
- Alimentação
- Transporte
- Saúde
- Educação
- Compras
- Lazer
- Assinaturas
- Investimentos
- Outros

### Metas
Cadastro de objetivos. Exemplos: Viagem, Carro, Casa, Reserva.
Campos:
- Nome
- Valor alvo
- Valor atual
- Data prevista

### Calendário Financeiro
Visual mensal. Eventos: Contas, Parcelas, Receitas, Metas.

## Funcionalidades da versão 2
- Transferências entre contas
- Múltiplas contas bancárias
- Pix
- Investimentos
- Patrimônio
- Dívidas
- Empréstimos
- Fluxo de caixa
- Comparativo mensal
- Gráficos
- Relatórios

## Funcionalidades da versão 3
- Open Finance
- Importação automática de transações
- Sincronização bancária
- IA Financeira
- Planejamento automático
- Compartilhamento familiar
- Assinatura Premium

## Inteligência Financeira

O sistema deve gerar insights automaticamente. Exemplos:
- "Você gastou 18% menos com alimentação."
- "Seu gasto com delivery aumentou 42%."
- "Você poderá economizar R$380 neste mês."
- "Seu saldo ficará negativo no dia 24."
- "Antecipar esta dívida economizará R$210."

## Sistema de Alertas

Alertas inteligentes:
- Conta vence amanhã
- Conta venceu
- Cartão fecha hoje
- Meta atrasada
- Meta concluída
- Saldo insuficiente
- Receita prevista
- Parcela finalizada

## Gamificação

### XP
Usuário ganha experiência ao:
- Registrar despesas
- Registrar receitas
- Pagar contas
- Economizar
- Cumprir metas

### Sequência
Dias consecutivos utilizando o aplicativo.

### Conquistas
- Primeiro mês organizado
- Primeiro mês sem atraso
- Primeira meta concluída
- Reserva criada
- Dívida quitada
- 100 contas pagas

### Níveis
Iniciante → Organizado → Planejador → Controlador → Investidor → Especialista → Mestre Financeiro

## Indicadores

### Saúde Financeira
Score de 0 a 100. Baseado em:
- Dívidas
- Reserva
- Gastos
- Parcelamentos
- Pontualidade
- Economia

### Patrimônio
Evolução mensal.

### Comprometimento da renda
Percentual da renda comprometida.

### Economia mensal
Comparação com meses anteriores.

### Projeção de saldo
Hoje, 30 dias, 60 dias, 90 dias, 180 dias, 365 dias.

## Inteligência Artificial

Assistente contextual. Exemplos:
- "Posso comprar este carro?"
- "Quanto consigo economizar?"
- "Qual meu maior gasto?"
- "Como posso reduzir despesas?"
- "Posso viajar em dezembro?"

As respostas devem utilizar exclusivamente os dados financeiros do usuário.

## Arquitetura Inicial

### Front-end
- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- React Query
- React Hook Form

### Back-end
- Node.js
- NestJS
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ

### Infraestrutura
- Docker
- Cloudflare
- CDN
- Armazenamento de arquivos
- Backup automático
- Monitoramento

## Princípios de UX
- Interface limpa e minimalista.
- Informações financeiras apresentadas de forma visual.
- Pouca digitação.
- Cadastro rápido.
- Navegação por dashboards.
- Feedback imediato após cada ação.
- Uso consistente de cores para status (informativo, atenção, concluído e pendente).
- Experiência mobile-first com adaptação para desktop.

## Roadmap

### Sprint 0
- Descoberta
- Pesquisa
- Arquitetura
- Design System
- Identidade visual
- Banco de dados
- Wireframes

### Sprint 1
- Autenticação
- Dashboard
- Layout principal
- Navegação
- Perfil

### Sprint 2
- Receitas
- Despesas
- Categorias
- Calendário

### Sprint 3
- Parcelamentos
- Contas recorrentes
- Cartões
- Alertas

### Sprint 4
- Metas
- Gamificação
- Score financeiro
- Relatórios

### Sprint 5
- Inteligência Financeira
- Projeções
- IA
- Otimizações

## Diferencial Competitivo

O Moneta não será apenas um aplicativo para registrar despesas. Seu posicionamento será o de um copiloto financeiro, capaz de organizar a vida financeira, antecipar riscos, sugerir melhorias e motivar o usuário a construir patrimônio ao longo do tempo. Cada funcionalidade deverá responder à pergunta: "Como isso ajuda o usuário a tomar uma decisão melhor hoje?"
