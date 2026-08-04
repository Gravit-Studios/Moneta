# Nora — Design System e Wireframes (Sprint 0)

Referência visual publicada: [Design System & Wireframes (artifact)](https://claude.ai/code/artifact/5f38c7ac-7390-4074-a338-0f819d76a61e)

## Convenção de tokens

Segue o mesmo formato já usado em outros projetos da Gravit Studio (`color-palette-auto`): escalas de cor com 11 stops (`50 → 950`), 8 tokens semânticos (`background`, `surface`, `subtle`, `muted`, `default`, `emphasis`, `strong`, `on-primary`), variáveis CSS `--color-*`/`--scale-*`, e a mesma escala de spacing/radius/transição (`$sp1..$sp12`, `$r-sm..$r-2xl`, `$t-fast`/`$t-base`). Implementação em código: [`apps/web/src/styles/`](../apps/web/src/styles/) — `_variables.scss` (spacing/radius/transições/fontes), `_colors.scss` (escalas gray/brand/gold + status), `_tokens.scss` (mapeamento semântico light/dark como CSS custom properties), `main.scss` (entry point).

Componentes devem consumir sempre as variáveis CSS (`var(--color-emphasis)` etc.), nunca as variáveis Sass diretamente — é o que permite trocar de tema (`prefers-color-scheme` ou `data-theme`) sem reprocessar Sass em runtime, replicando o mesmo mecanismo do `color-palette-auto`.

## Conceito

"Copiloto financeiro, não planilha" — a identidade precisa ter a seriedade de um livro-razão (fonte serifada em títulos, números tabulares) sem perder a leveza de um app de uso diário. O dourado representa conquista/gamificação e é usado com moderação (nunca como fundo), nunca confundido com as cores semânticas de status.

## Paleta

| Token | Hex (light) | Hex (dark) | Uso |
|---|---|---|---|
| Brand | `#145C49` | `#3FA383` | Cor de marca, CTA primário, progresso positivo |
| Gold | `#C89144` | `#D9A85C` | Conquista/gamificação — nunca decorativo |
| Ink | `#12211C` | `#EDEAE0` | Texto principal |
| Paper | `#F7F5EF` | `#0F1815` | Fundo base |
| Status · Informativo | `#3B6E99` | `#6FA3CC` | Ex.: receita prevista |
| Status · Atenção | `#C89144` | `#D9A85C` | Ex.: cartão fecha hoje |
| Status · Concluído | `#145C49` | `#3FA383` | Ex.: meta concluída |
| Status · Pendente | `#9C8F7B` | `#B8ACA0` | Ex.: aguardando pagamento |
| Status · Vencido | `#B4432F` | `#E08063` | Ex.: conta vencida |

As 4 cores de status pedidas no Product Vision (informativo, atenção, concluído, pendente) mais um 5º estado de "vencido/crítico" (necessário porque o MVP distingue "pendente" de "vencida" nos cadastros de despesa) — semântica desacoplada do dourado de marca, para não misturar "conquista" com "alerta".

## Tipografia

- **Display** (títulos, wordmark): serifada do sistema (Georgia/Iowan Old Style) — peso editorial, evita o clichê de app financeiro 100% geométrico/sans.
- **Body**: sans humanista do sistema (-apple-system/Segoe UI) — leve, legível em telas pequenas, sem dependência de webfont externa.
- **Dados monetários**: monoespaçada (`ui-monospace`/SF Mono) com `tabular-nums` — colunas de R$ sempre alinhadas.

## Componentes

Botão primário (verde de marca), botão ghost, campos de formulário com foco visível em dourado, e chips de status como unidade reutilizável em qualquer tela (dashboard, listas, calendário) — a mesma cor de chip em qualquer lugar do produto, conforme o princípio de "uso consistente de cores para status" do Product Vision.

## Wireframes (mobile-first)

Baixa fidelidade, 9 telas cobrindo o MVP: Login, Dashboard, Receitas, Despesas, Contas recorrentes, Parcelamentos, Cartões, Metas, Calendário financeiro. Estrutura em blocos representa hierarquia de informação, não estética — o objetivo é validar fluxo e agrupamento de conteúdo antes de qualquer alta-fidelidade.

## Pendências para antes da implementação

- Auditoria formal de contraste WCAG AA (incluindo dark mode) nos pares texto/fundo definidos acima.
- Validação de acessibilidade de foco/teclado nos componentes reais (Shadcn/UI), não só no wireframe estático.
- Alta-fidelidade das 9 telas, a partir destes wireframes, já na Sprint 1/2 conforme o roadmap.
