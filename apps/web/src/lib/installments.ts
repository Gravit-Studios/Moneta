import { supabase } from './supabaseClient';

export interface Installment {
  id: string;
  user_id: string;
  category_id: string;
  card_id: string;
  product: string;
  total_value: number;
  installments_count: number;
  installment_value: number;
  start_date: string;
  created_at: string;
}

export interface InstallmentInput {
  product: string;
  totalValue: number;
  installmentsCount: number;
  cardId: string;
  categoryId: string;
  startDate: string;
}

export interface InstallmentProgress {
  installment: Installment;
  paidCount: number;
  remainingCount: number;
  remainingValue: number;
}

export async function listInstallments(): Promise<Installment[]> {
  const { data, error } = await supabase.from('installments').select('*').order('start_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// Cadastro "inteligente": ao criar o parcelamento, já gera as N despesas
// futuras vinculadas (installment_seq 1..N), uma por mês a partir de
// start_date — não fica esperando um cron gerar mês a mês.
export async function createInstallment(input: InstallmentInput): Promise<Installment> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Sessão não encontrada.');
  const userId = userData.user.id;

  const { data: installment, error } = await supabase
    .from('installments')
    .insert({
      user_id: userId,
      category_id: input.categoryId,
      card_id: input.cardId,
      product: input.product,
      total_value: input.totalValue,
      installments_count: input.installmentsCount,
      installment_value: Number((input.totalValue / input.installmentsCount).toFixed(2)),
      start_date: input.startDate,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const start = new Date(`${input.startDate}T00:00:00`);
  const expenseRows = Array.from({ length: input.installmentsCount }, (_, i) => {
    const dueDate = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
    return {
      user_id: userId,
      category_id: input.categoryId,
      card_id: input.cardId,
      installment_id: installment.id,
      installment_seq: i + 1,
      name: `${input.product} (${i + 1}/${input.installmentsCount})`,
      value: installment.installment_value,
      due_date: dueDate.toISOString().slice(0, 10),
      payment_method: 'credit_card' as const,
      paid: false,
    };
  });

  const { error: expensesError } = await supabase.from('expenses').insert(expenseRows);
  if (expensesError) throw new Error(expensesError.message);

  return installment;
}

export async function deleteInstallment(id: string): Promise<void> {
  // As despesas já geradas continuam existindo (installment_id vira null —
  // ver "on delete set null" no schema): histórico financeiro não some
  // junto com o cadastro-molde.
  const { error } = await supabase.from('installments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function installmentProgress(installment: Installment): Promise<InstallmentProgress> {
  const { data, error } = await supabase
    .from('expenses')
    .select('paid, value')
    .eq('installment_id', installment.id);
  if (error) throw new Error(error.message);

  const paidCount = data.filter((row) => row.paid).length;
  const remaining = data.filter((row) => !row.paid);
  return {
    installment,
    paidCount,
    remainingCount: remaining.length,
    remainingValue: remaining.reduce((sum, row) => sum + Number(row.value), 0),
  };
}
