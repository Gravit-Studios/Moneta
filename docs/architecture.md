# Nora — Arquitetura Técnica

Detalhamento da arquitetura definida no [Product Vision](./product-vision.md), com decisões de estrutura, padrões e requisitos não-funcionais para o MVP.

## 0. Pivô de arquitetura (pós-Sprint 1)

A Sprint 1 implementou uma API própria em NestJS (JWT, Argon2id, Prisma/PostgreSQL). Depois de revisar como o **SweetHub** (outro projeto do estúdio) está estruturado, decidimos migrar a Nora para o mesmo padrão, por uma razão prática: o SweetHub não precisa de nenhum host de API separado (Railway/Fly.io/VM) — o **Supabase** já é o back-end inteiro (Auth, Postgres, Row Level Security, Edge Functions para o que precisa de segredo), e o front-end é publicado direto no **Cloudflare Workers** como PWA estática. Isso elimina a decisão de "onde hospedar a API" que travou o deploy.

**O que isso substitui:**
- ~~API NestJS (`apps/api`)~~ → **Supabase Auth** (cadastro, login, recuperação de senha nativos) + **Supabase Postgres** com RLS.
- ~~Prisma ORM~~ → SQL direto versionado em `supabase/schema.sql`, no mesmo formato do SweetHub.
- ~~JWT/refresh token próprios~~ → sessão gerenciada pelo `supabase-js` no cliente (a lib já cuida de refresh automático).
- ~~Cloudflare só como CDN na frente do front-end~~ → **Cloudflare Workers** hospeda o front-end estático (build do Vite) diretamente, com `wrangler.jsonc` + um `worker.js` fino só para headers de segurança — exatamente como o SweetHub.

**O que se mantém:** todo o Design System (Sprint 0), o schema de domínio (entidades do MVP), e os requisitos não-funcionais de LGPD abaixo — só a camada de acesso a dados muda de "API própria" para "RLS no Postgres".

Escopo confirmado com o usuário: **projeto web/PWA, não um app nativo**.

## 1. Visão geral

```
nora/
├── apps/
│   └── web/            # front-end React + TypeScript, PWA, deploy via Cloudflare Workers
├── supabase/
│   ├── schema.sql       # schema completo + RLS, rodado manualmente no SQL Editor do Supabase
│   └── functions/       # Edge Functions (Deno), só para o que precisa de segredo
└── docs/
```

Sem back-end próprio para hospedar: o front-end fala direto com o Supabase.

## 2. Front-end

- **React + TypeScript** — SPA/PWA, Vite como bundler.
- **PWA**: `manifest.json` + `service-worker.js` (cache de assets, instalável), mesmo padrão do SweetHub.
- **Tailwind/tokens do Design System** — já implementado em `apps/web/src/styles` (Sprint 0).
- **`@supabase/supabase-js`** — client único (`src/lib/supabaseClient.ts`) para Auth e queries. A chave usada no front é a `anon`/`publishable` — segura para expor, porque a segurança real vem das políticas de RLS no banco, não da chave.
- **Roteamento**: React Router, layout autenticado (dashboard) separado do fluxo público (login/cadastro/recuperação de senha).
- **Estrutura de pastas** por feature, não por tipo de arquivo.

## 3. Back-end (Supabase)

- **Auth**: `supabase.auth.signUp` / `signInWithPassword` / `resetPasswordForEmail` — cadastro, login e recuperação de senha nativos, com confirmação de e-mail. Elimina a necessidade de gerenciar hash de senha, JWT ou refresh token no nosso código.
- **Postgres + RLS**: cada tabela de domínio (`incomes`, `expenses`, `recurring_bills`, `installments`, `cards`, `categories`, `goals`, `alerts`) tem `user_id references auth.users` e uma política de RLS restringindo `select/insert/update/delete` a `auth.uid() = user_id` — isolamento por usuário garantido no banco, não só na aplicação.
- **Edge Functions** (Deno/TypeScript, em `supabase/functions/`): só para operações que precisam de segredo ou de privilégio elevado — ex. exclusão de conta (precisa da service role, que nunca fica no client) e, futuramente, qualquer integração de pagamento/Open Finance.
- **Geração de recorrências/parcelas** (contas recorrentes, parcelamentos): via `pg_cron` no próprio Supabase ou Edge Function agendada — substitui o BullMQ/Redis do desenho anterior.

## 4. Infraestrutura

- **Cloudflare Workers** (Static Assets, não Pages — a própria Cloudflare recomenda Workers para projetos novos): serve o build do Vite (`dist/`), com `run_worker_first` + `not_found_handling: single-page-application` para as rotas do SPA funcionarem, e um `worker.js` mínimo adicionando headers de segurança (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`).
- **GitHub**: repositório único (`Gravit-Studios/Nora`). CI/CD via **Cloudflare Workers Builds**, com integração Git nativa — todo push na branch de produção builda (`npm install && npm run build`) e publica (`npx wrangler deploy`) automaticamente, sem passo manual. Requer a variável de build `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` configuradas no projeto (Settings → Build variables), já que o Vite embute essas variáveis no momento do build, não em runtime.
- **Backup**: backups automáticos do Postgres já inclusos no plano Supabase.
- **Monitoramento**: logs do Supabase (Auth, Postgres, Edge Functions) via dashboard; sem componente de observabilidade adicional no MVP.

## 5. Requisitos não-funcionais (herdados da pesquisa de mercado)

A pesquisa de mercado (`market-research.md`) identificou que o principal ponto fraco dos concorrentes é justamente segurança/confiabilidade de dados. Isso continua valendo com Supabase:

- **Minimização de dados**: só os campos definidos no MVP.
- **Consentimento e exclusão de dados**: exportação e exclusão de conta a partir do Perfil — exclusão via Edge Function com service role (o client nunca tem permissão de apagar `auth.users` diretamente).
- **Isolamento por usuário garantido por RLS**, não apenas por lógica de aplicação — mais forte que o desenho anterior, porque uma falha de código no front não basta para vazar dados de outro usuário.
- **Criptografia**: TLS ponta a ponta (Supabase + Cloudflare já operam assim por padrão).
- **Preparação para Open Finance (v3)**: mesma consideração de antes — desenhar `incomes`/`expenses` já pensando em origem "manual" vs. "importada".
