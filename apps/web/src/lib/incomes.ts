import { supabase } from './supabaseClient';
import { Income, Recurrence } from './types';

export interface IncomeInput {
  name: string;
  value: number;
  categoryId: string;
  date: string;
  recurrence: Recurrence;
  notes?: string;
}

export async function listIncomes(): Promise<Income[]> {
  const { data, error } = await supabase.from('incomes').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createIncome(input: IncomeInput): Promise<Income> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Sessão não encontrada.');

  const { data, error } = await supabase
    .from('incomes')
    .insert({
      user_id: userData.user.id,
      category_id: input.categoryId,
      name: input.name,
      value: input.value,
      date: input.date,
      recurrence: input.recurrence,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteIncome(id: string): Promise<void> {
  const { error } = await supabase.from('incomes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
