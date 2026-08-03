-- Moneta — schema do Supabase
-- Rode este arquivo inteiro no SQL Editor do projeto Supabase
-- (Dashboard -> SQL Editor -> New query -> colar -> Run)

create extension if not exists "pgcrypto";

-- =========================================================
-- profiles — criado automaticamente no cadastro (handle_new_user)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Cria a linha em profiles assim que o usuário se cadastra no Supabase Auth,
-- lendo o nome de user_metadata (passado em supabase.auth.signUp options.data).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- categories — padrão (isDefault) ou por usuário
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- Categorias padrão (user_id nulo) são visíveis para todo mundo; as
-- customizadas só para quem criou.
create policy "categories_select" on public.categories
  for select using (user_id is null or auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- =========================================================
-- cards
-- =========================================================
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  limit_amount numeric(12, 2) not null,
  closing_day smallint not null check (closing_day between 1 and 31),
  due_day smallint not null check (due_day between 1 and 31),
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;
create policy "cards_owner" on public.cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- incomes
-- =========================================================
create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  value numeric(12, 2) not null,
  date date not null,
  recurrence text not null default 'none' check (recurrence in ('none', 'weekly', 'monthly', 'yearly')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.incomes enable row level security;
create policy "incomes_owner" on public.incomes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists incomes_user_date_idx on public.incomes (user_id, date);

-- =========================================================
-- recurring_bills — molde; expenses geradas apontam pra cá (recurring_bill_id)
-- =========================================================
create table if not exists public.recurring_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  value numeric(12, 2) not null,
  due_day smallint not null check (due_day between 1 and 31),
  payment_method text not null check (payment_method in ('cash', 'debit', 'credit_card', 'pix', 'bank_transfer', 'other')),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.recurring_bills enable row level security;
create policy "recurring_bills_owner" on public.recurring_bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- installments — molde do parcelamento; expenses geradas apontam pra cá
-- =========================================================
create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  card_id uuid not null references public.cards (id) on delete restrict,
  product text not null,
  total_value numeric(12, 2) not null,
  installments_count integer not null check (installments_count > 0),
  installment_value numeric(12, 2) not null,
  start_date date not null,
  created_at timestamptz not null default now()
);

alter table public.installments enable row level security;
create policy "installments_owner" on public.installments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- expenses
-- =========================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  card_id uuid references public.cards (id) on delete restrict,
  -- Se o molde (recurring_bill/installment) for apagado, a despesa já gerada
  -- continua existindo — histórico financeiro não pode sumir junto.
  recurring_bill_id uuid references public.recurring_bills (id) on delete set null,
  installment_id uuid references public.installments (id) on delete set null,
  installment_seq integer,
  name text not null,
  value numeric(12, 2) not null,
  due_date date not null,
  paid boolean not null default false,
  payment_method text not null check (payment_method in ('cash', 'debit', 'credit_card', 'pix', 'bank_transfer', 'other')),
  cost_center text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;
create policy "expenses_owner" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists expenses_user_due_date_idx on public.expenses (user_id, due_date);

-- =========================================================
-- goals
-- =========================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_value numeric(12, 2) not null,
  current_value numeric(12, 2) not null default 0,
  target_date date not null,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;
create policy "goals_owner" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- alerts
-- =========================================================
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in (
    'bill_due_tomorrow', 'bill_overdue', 'card_closing_today', 'goal_overdue',
    'goal_completed', 'insufficient_balance', 'income_expected', 'installment_completed'
  )),
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.alerts enable row level security;
create policy "alerts_owner" on public.alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists alerts_user_read_idx on public.alerts (user_id, read);

-- =========================================================
-- Grants — RLS por si só não basta: sem isso, o Postgres nega acesso à
-- tabela antes mesmo de avaliar as políticas ("permission denied for
-- table"), porque GRANT e RLS são camadas independentes.
-- =========================================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles, public.categories, public.incomes, public.expenses,
  public.recurring_bills, public.installments, public.cards, public.goals, public.alerts
  to authenticated;

-- =========================================================
-- Categorias padrão do MVP (ver docs/product-vision.md)
-- =========================================================
insert into public.categories (name, type, is_default) values
  ('Moradia', 'expense', true),
  ('Alimentação', 'expense', true),
  ('Transporte', 'expense', true),
  ('Saúde', 'expense', true),
  ('Educação', 'expense', true),
  ('Compras', 'expense', true),
  ('Lazer', 'expense', true),
  ('Assinaturas', 'expense', true),
  ('Investimentos', 'expense', true),
  ('Outros', 'expense', true),
  ('Salário', 'income', true),
  ('Outros', 'income', true)
on conflict do nothing;
