import { supabase } from './supabaseClient';

export interface Card {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  created_at: string;
}

export interface CardInput {
  name: string;
  limitAmount: number;
  closingDay: number;
  dueDay: number;
}

export async function listCards(): Promise<Card[]> {
  const { data, error } = await supabase.from('cards').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function createCard(input: CardInput): Promise<Card> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Sessão não encontrada.');

  const { data, error } = await supabase
    .from('cards')
    .insert({
      user_id: userData.user.id,
      name: input.name,
      limit_amount: input.limitAmount,
      closing_day: input.closingDay,
      due_day: input.dueDay,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Usado (fatura em aberto) = soma das despesas não pagas vinculadas ao
// cartão. Simplificação do MVP: não considera o ciclo de fechamento ainda,
// só "tudo que está lançado no cartão e ainda não foi pago".
export async function cardUsage(cardId: string): Promise<number> {
  const { data, error } = await supabase
    .from('expenses')
    .select('value')
    .eq('card_id', cardId)
    .eq('paid', false);
  if (error) throw new Error(error.message);
  return data.reduce((sum, row) => sum + Number(row.value), 0);
}
