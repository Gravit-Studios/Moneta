import { supabase } from './supabaseClient';
import { Category, CategoryType } from './types';

// RLS já garante que só vêm as categorias padrão (user_id nulo) + as do
// próprio usuário — não precisamos filtrar por user_id aqui.
export async function listCategories(type?: CategoryType): Promise<Category[]> {
  let query = supabase.from('categories').select('*').order('name');
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function createCategory(name: string, type: CategoryType): Promise<Category> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Sessão não encontrada.');

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, type, user_id: userData.user.id, is_default: false })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
