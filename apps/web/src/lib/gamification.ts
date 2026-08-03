import { supabase } from './supabaseClient';

export interface ProfileStats {
  xp: number;
  current_streak: number;
  longest_streak: number;
}

export type AchievementKey = 'primeira_meta_concluida' | 'cem_contas_pagas' | 'divida_quitada';

export const ACHIEVEMENTS: Record<AchievementKey, string> = {
  primeira_meta_concluida: 'Primeira meta concluída',
  cem_contas_pagas: '100 contas pagas',
  divida_quitada: 'Dívida quitada',
};

export const LEVELS = [
  { name: 'Iniciante', minXp: 0 },
  { name: 'Organizado', minXp: 100 },
  { name: 'Planejador', minXp: 300 },
  { name: 'Controlador', minXp: 700 },
  { name: 'Investidor', minXp: 1500 },
  { name: 'Especialista', minXp: 3000 },
  { name: 'Mestre Financeiro', minXp: 6000 },
] as const;

export function levelFor(xp: number): { name: string; minXp: number; nextMinXp: number | null } {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXp) current = level;
  }
  const nextIndex = LEVELS.indexOf(current) + 1;
  return { ...current, nextMinXp: LEVELS[nextIndex]?.minXp ?? null };
}

// Chama a função no Postgres que soma XP e atualiza a sequência de dias
// consecutivos (ver record_activity em supabase/schema.sql). Falhas aqui
// nunca devem quebrar a ação principal do usuário (cadastrar despesa etc.),
// por isso o caller trata isso como "melhor esforço".
export async function recordActivity(xpGain = 5, achievement?: string): Promise<void> {
  const { error } = await supabase.rpc('record_activity', { xp_gain: xpGain, achievement: achievement ?? null });
  if (error) throw new Error(error.message);
}

export async function getProfileStats(): Promise<ProfileStats> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Sessão não encontrada.');

  const { data, error } = await supabase
    .from('profiles')
    .select('xp, current_streak, longest_streak')
    .eq('id', userData.user.id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getUnlockedAchievements(): Promise<AchievementKey[]> {
  const { data, error } = await supabase.from('user_achievements').select('achievement_key');
  if (error) throw new Error(error.message);
  return data.map((row) => row.achievement_key as AchievementKey);
}

// "100 contas pagas" só pode ser verificado contando o real no banco, não
// incrementando um contador no client (evita drift se despesas forem
// apagadas). Chamar depois de marcar uma despesa como paga.
export async function checkHundredPaidExpenses(): Promise<void> {
  const { count, error } = await supabase
    .from('expenses')
    .select('id', { count: 'exact', head: true })
    .eq('paid', true);
  if (error) throw new Error(error.message);
  if ((count ?? 0) >= 100) {
    await recordActivity(50, 'cem_contas_pagas');
  }
}
