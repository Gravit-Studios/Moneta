# Moneta — Modelagem de Banco de Dados (Sprint 0)

Schema Prisma/PostgreSQL para as entidades do MVP, definido em [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma).

## Entidades

- **User** — conta do usuário (autenticação, perfil).
- **Category** — categorias de receita/despesa. `isDefault=true` e `userId=null` para as categorias padrão (Moradia, Alimentação, Transporte...); categorias customizadas ficam associadas a um `userId`.
- **Income** — receitas, com `recurrence` (NONE/WEEKLY/MONTHLY/YEARLY).
- **Expense** — despesas. É o centro do modelo: pode nascer de um lançamento manual, de uma `RecurringBill` (via `recurringBillId`) ou de um `Installment` (via `installmentId` + `installmentSeq`, o número da parcela).
- **RecurringBill** — cadastro único de conta recorrente (aluguel, água, energia...); o job assíncrono (BullMQ) gera as `Expense` futuras a partir daqui.
- **Installment** — cadastro do parcelamento (produto, valor total, nº de parcelas, cartão); o job gera as `Expense` futuras vinculadas, uma por parcela.
- **Card** — cartão de crédito (limite, dia de fechamento/vencimento).
- **Goal** — metas financeiras (valor alvo x valor atual x data prevista).
- **Alert** — alertas gerados pelo sistema (tipos cobrem os alertas do vision doc: conta vence amanhã, conta venceu, cartão fecha hoje, meta atrasada/concluída, saldo insuficiente, receita prevista, parcela finalizada).

O **Calendário Financeiro** não tem tabela própria — é uma view/agregação em tempo de consulta sobre `Income`, `Expense`, `RecurringBill` e `Installment` por data, então não introduz uma nova fonte de verdade.

## Decisões de modelagem

- **Isolamento por usuário**: toda tabela de domínio tem `userId` obrigatório (exceto categorias padrão do sistema) e índice composto por `userId`, seguindo o requisito não-funcional definido na Arquitetura (`docs/architecture.md`) para reduzir risco de vazamento entre contas.
- **Valores monetários** em `Decimal(12,2)`, nunca float, para evitar erro de arredondamento em somas financeiras.
- **Geração de parcelas/recorrências como `Expense` concretas** (não calculadas on-the-fly) — permite marcar cada parcela/mês como paga individualmente e mantém histórico estável mesmo se o cadastro original (`Installment`/`RecurringBill`) for editado depois.
- **Categorias padrão vs. customizadas** no mesmo modelo (`Category` com `isDefault` + `userId` opcional) em vez de duas tabelas — evita duplicar lógica de categoria em todo o resto do schema.

## Próximos passos (fora do escopo desta task)

- Gerar a migration inicial (`prisma migrate dev`) contra o Postgres do projeto Supabase — depende de conexão direta ao banco, que este ambiente remoto não permite (ver decisão registrada na conversa: bloqueio de rede a portas fora de HTTPS). Deve ser rodado localmente por quem tem acesso ao `supabase-moneta` MCP autenticado, ou via `DATABASE_URL` local.
- Seed das categorias padrão (`isDefault=true`) listadas no Product Vision.
