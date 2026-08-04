import { checkHundredPaidExpenses, recordActivity } from './gamification';
import { supabase } from './supabaseClient';
import { Expense, PaymentMethod } from './types';

export interface ExpenseInput {
  name: string;
  value: number;
  categoryId: string;
  dueDate: string;
  paymentMethod: PaymentMethod;
  costCenter?: string;
  notes?: string;
}

export async function listExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase.from('expenses').select('*').order('due_date', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Sessão não encontrada.');

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userData.user.id,
      category_id: input.categoryId,
      name: input.name,
      value: input.value,
      due_date: input.dueDate,
      payment_method: input.paymentMethod,
      cost_center: input.costCenter ?? null,
      notes: input.notes ?? null,
      paid: false,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  recordActivity(5).catch(() => {});
  return data;
}

export async function setExpensePaid(id: string, paid: boolean): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .update({ paid, paid_at: paid ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) throw new Error(error.message);

  if (paid) {
    recordActivity(10).catch(() => {});
    checkHundredPaidExpenses().catch(() => {});
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
