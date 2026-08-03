import { supabase } from './supabaseClient';
import { PaymentMethod } from './types';

export interface RecurringBill {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  value: number;
  due_day: number;
  payment_method: PaymentMethod;
  active: boolean;
  created_at: string;
}

export interface RecurringBillInput {
  name: string;
  value: number;
  categoryId: string;
  dueDay: number;
  paymentMethod: PaymentMethod;
}

export async function listRecurringBills(): Promise<RecurringBill[]> {
  const { data, error } = await supabase.from('recurring_bills').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function createRecurringBill(input: RecurringBillInput): Promise<RecurringBill> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Sessão não encontrada.');

  const { data, error } = await supabase
    .from('recurring_bills')
    .insert({
      user_id: userData.user.id,
      category_id: input.categoryId,
      name: input.name,
      value: input.value,
      due_day: input.dueDay,
      payment_method: input.paymentMethod,
      active: true,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteRecurringBill(id: string): Promise<void> {
  const { error } = await supabase.from('recurring_bills').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Gera a despesa do mês corrente a partir do molde. Sem cron ainda (ver
// docs/architecture.md) — por enquanto é uma ação manual do usuário; a
// geração automática mensal fica registrada como pendência de infra
// (pg_cron/Edge Function agendada).
export async function generateExpenseForCurrentMonth(bill: RecurringBill): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Sessão não encontrada.');

  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dueDate = new Date(now.getFullYear(), now.getMonth(), Math.min(bill.due_day, lastDayOfMonth));

  const { error } = await supabase.from('expenses').insert({
    user_id: userData.user.id,
    category_id: bill.category_id,
    recurring_bill_id: bill.id,
    name: bill.name,
    value: bill.value,
    due_date: dueDate.toISOString().slice(0, 10),
    payment_method: bill.payment_method,
    paid: false,
  });
  if (error) throw new Error(error.message);
}
