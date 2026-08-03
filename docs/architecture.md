# Moneta — Arquitetura Técnica (Sprint 0)

Detalhamento da arquitetura inicial definida no [Product Vision](./product-vision.md), com decisões de estrutura, padrões e requisitos não-funcionais para o MVP.

## 1. Visão geral

Monorepo com front-end SPA (React) consumindo uma API REST/NestJS, banco relacional PostgreSQL via Prisma, cache/filas via Redis + BullMQ, containerizado com Docker e servido atrás de Cloudflare (CDN/WAF).

```
moneta/
├── apps/
│   ├── web/          # front-end React + TypeScript
│   └── api/          # back-end NestJS
├── packages/
│   ├── shared-types/ # DTOs e tipos compartilhados front/back
│   └── config/       # eslint/tsconfig/prettier compartilhados
├── docker/
├── docs/
└── infra/            # IaC, scripts de deploy
```

Monorepo gerenciado com pnpm workspaces (ou Turborepo, a avaliar no início da Sprint 1) para evitar duplicação de tipos entre front e back.

## 2. Front-end

- **React + TypeScript** — SPA, Vite como bundler.
- **Tailwind CSS + Shadcn/UI** — design tokens do Design System (task #3) mapeados para as variáveis Tailwind.
- **React Query** — cache e sincronização de estado do servidor; nenhuma chamada de API direta em componentes.
- **React Hook Form + Zod** — formulários e validação de schema compartilhada com os DTOs do back-end.
- **Roteamento**: React Router, com layout autenticado (dashboard) separado do fluxo público (login/cadastro/recuperação de senha).
- **Estrutura de pastas** por feature (`features/receitas`, `features/despesas`, `features/metas`...), não por tipo de arquivo — reduz acoplamento entre módulos do MVP.

## 3. Back-end

- **NestJS** organizado em módulos por domínio, espelhando as entidades do MVP: `auth`, `users`, `incomes`, `expenses`, `recurring-bills`, `installments`, `cards`, `categories`, `goals`, `calendar`, `alerts`.
- **Prisma ORM** sobre **PostgreSQL** — schema único versionado (ver task #4 — Modelagem de banco de dados).
- **Autenticação**: JWT (access + refresh token), hash de senha com Argon2id, fluxo de recuperação de senha por e-mail com token de uso único e expiração curta.
- **Redis + BullMQ**: filas para geração de lançamentos recorrentes (contas recorrentes, parcelas futuras), envio de e-mails e cálculo de alertas/insights — processamento assíncrono fora do request-response principal.
- **Validação**: DTOs com `class-validator`, mesmas regras de negócio refletidas nos schemas Zod do front (via `packages/shared-types` quando possível).
- **Versionamento de API**: prefixo `/api/v1` desde o início, para não quebrar o front quando a v2/v3 introduzirem novos endpoints.

## 4. Infraestrutura

- **Docker Compose** para ambiente de desenvolvimento local (Postgres, Redis, API, Web).
- **Cloudflare**: CDN + proteção DDoS/WAF na frente do front-end e da API pública.
- **Armazenamento de arquivos**: object storage compatível com S3 (ex. Cloudflare R2) para eventuais anexos futuros (ex. comprovantes) — não faz parte do MVP, mas a interface de storage deve ser abstraída desde já para não acoplar o código a um provedor específico.
- **Backup automático**: dump diário do PostgreSQL com retenção mínima de 30 dias, armazenado fora do provedor principal do banco.
- **Monitoramento**: logs estruturados (JSON) na API, health-check endpoint (`/health`), e observabilidade básica (ex. Sentry para erros, uptime monitor). Métricas de fila (BullMQ) expostas para acompanhar atrasos no processamento de recorrências.
- **CI/CD**: pipeline com lint + testes + build obrigatórios antes de qualquer merge na branch principal; deploy automatizado por ambiente (staging/produção).

## 5. Requisitos não-funcionais (herdados da pesquisa de mercado)

A pesquisa de mercado (`market-research.md`) identificou que o principal ponto fraco dos concorrentes é justamente segurança/confiabilidade de dados (sincronização instável, dificuldade de excluir dados, reclamações sobre LGPD). Isso vira requisito de arquitetura desde o MVP, mesmo sem integração bancária ainda:

- **Minimização de dados**: coletar apenas os campos definidos no MVP; nenhum campo especulativo "para o futuro".
- **Consentimento e exclusão de dados**: usuário deve poder exportar e excluir todos os seus dados a partir do Perfil — implementar já no MVP (Sprint 1), não esperar a v3/Open Finance.
- **Criptografia**: dados sensíveis (senha, tokens) nunca em texto plano; TLS obrigatório ponta a ponta.
- **Isolamento por usuário**: toda query no back-end deve ser escopada por `userId` a nível de aplicação (e idealmente reforçada por constraints/índices no banco) para eliminar risco de vazamento entre contas.
- **Preparação para Open Finance (v3)**: desenhar o módulo de contas/transações hoje já pensando em uma futura fonte "manual" vs. "importada", para que a integração bancária futura não exija reescrever o modelo de dados do zero.

## 6. Decisões fechadas (revisão de Segurança/Infra — Sprint 1)

- **E-mail transacional**: **Resend** (recuperação de senha, alertas) — conta já existente no estúdio.
- **Rate-limiting**: `@nestjs/throttler` com storage em Redis (já presente no stack). Limite geral da API + limite mais restrito especificamente em `/auth/login` e `/auth/forgot-password` (proteção contra brute force).
- **Retenção de logs**: logs estruturados (JSON) com redação obrigatória de senha/token em qualquer campo logado; retenção de 90 dias para logs operacionais.

## 7. Autenticação — pontos corrigidos antes da implementação

A revisão de Segurança/Infra identificou dois pontos críticos no desenho original (JWT stateless) que exigiram ajuste no schema antes de qualquer código:

- **Refresh tokens são stateful**: armazenados hasheados na tabela `RefreshToken`, com rotação a cada uso (uso único) — permite revogação real (logout, troca de senha), o que um JWT puro não permitiria.
- **Refresh token no cliente**: cookie `HttpOnly` + `Secure` + `SameSite=Strict`, nunca em `localStorage` (mitiga roubo de sessão via XSS).
- **Token de recuperação de senha**: também armazenado hasheado (`PasswordResetToken`), nunca em texto puro no banco, mesmo padrão da senha.
