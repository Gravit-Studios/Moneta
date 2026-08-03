import { FUNCTIONS_URL, supabase } from './supabaseClient';

export interface Profile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

async function signUp(name: string, email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw new Error(error.message);
}

async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

async function forgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });
  if (error) throw new Error(error.message);
}

async function me(): Promise<Profile> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Sessão não encontrada.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, created_at')
    .eq('id', userData.user.id)
    .single();
  if (profileError) throw new Error(profileError.message);

  return {
    id: profile.id,
    name: profile.name,
    email: userData.user.email ?? '',
    createdAt: profile.created_at,
  };
}

// Portabilidade de dados (LGPD): junta o perfil com todas as tabelas de
// domínio do próprio usuário — RLS já garante que só vêm linhas dele.
async function exportData(): Promise<unknown> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Sessão não encontrada.');
  const userId = userData.user.id;

  const tables = ['categories', 'incomes', 'expenses', 'recurring_bills', 'installments', 'cards', 'goals', 'alerts'] as const;
  const results = await Promise.all(
    tables.map(async (table) => {
      const { data, error } = await supabase.from(table).select('*').eq('user_id', userId);
      if (error) throw new Error(error.message);
      return [table, data] as const;
    }),
  );

  return { email: userData.user.email, data: Object.fromEntries(results) };
}

// Exclusão de conta exige privilégio de admin (apagar de auth.users), então
// roda numa Edge Function com service role — nunca no client (ver
// supabase/functions/delete-account).
async function deleteAccount(): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Sessão não encontrada.');

  const res = await fetch(`${FUNCTIONS_URL}/delete-account`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? 'Não foi possível excluir a conta.');
  }
  await supabase.auth.signOut();
}

export const api = {
  register: signUp,
  login: signIn,
  logout: signOut,
  forgotPassword,
  me,
  exportData,
  deleteAccount,
};
