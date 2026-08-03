import { supabase } from './supabaseClient';
import { Goal } from './types';
import { recordActivity } from './gamification';

export interface GoalInput {
  name: string;
  targetValue: number;
  targetDate: string;
}

export async function listGoals(): Promise<Goal[]> {
  const { data, error } = await supabase.from('goals').select('*').order('target_date');
  if (error) throw new Error(error.message);
  return data;
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Sessão não encontrada.');

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userData.user.id,
      name: input.name,
      target_value: input.targetValue,
      target_date: input.targetDate,
      current_value: 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  await recordActivity(5);
  return data;
}

// Registra aporte na meta (soma ao valor atual). Se atingir o alvo, conta
// como meta concluída para a gamificação (ver lib/gamification.ts).
export async function contributeToGoal(goal: Goal, amount: number): Promise<Goal> {
  const newValue = goal.current_value + amount;
  const { data, error } = await supabase
    .from('goals')
    .update({ current_value: newValue })
    .eq('id', goal.id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (goal.current_value < goal.target_value && newValue >= goal.target_value) {
    await recordActivity(30, 'primeira_meta_concluida');
  } else {
    await recordActivity(5);
  }
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
