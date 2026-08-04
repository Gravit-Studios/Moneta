import { listExpenses } from './expenses';
import { listGoals } from './goals';
import { listIncomes } from './incomes';

function isSameMonth(dateStr: string, ref: Date): boolean {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

// Uma única mensagem contextual, priorizada — a Nora "surge em momentos
// importantes com mensagens curtas e úteis" (briefing de marca), não uma
// lista de alertas. Prioridade: urgência financeira > conquista > boa
// notícia > saudação neutra.
export async function noraMessage(): Promise<string> {
  const now = new Date();
  const today = new Date(now.toDateString());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [expenses, goals, incomes] = await Promise.all([listExpenses(), listGoals(), listIncomes()]);

  const overdue = expenses.find((e) => !e.paid && new Date(e.due_date) < today);
  if (overdue) return `"${overdue.name}" venceu — que tal resolver isso agora?`;

  const dueTomorrow = expenses.find((e) => !e.paid && new Date(`${e.due_date}T00:00:00`).getTime() === tomorrow.getTime());
  if (dueTomorrow) return `Percebi que "${dueTomorrow.name}" vence amanhã.`;

  const justCompletedGoal = goals.find((g) => g.current_value >= g.target_value);
  if (justCompletedGoal) return `Parabéns! Sua meta "${justCompletedGoal.name}" foi concluída.`;

  const despesasMes = expenses.filter((e) => isSameMonth(e.due_date, now)).reduce((sum, e) => sum + e.value, 0);
  const now2 = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const despesasMesAnterior = expenses.filter((e) => isSameMonth(e.due_date, now2)).reduce((sum, e) => sum + e.value, 0);
  if (despesasMesAnterior > 0 && despesasMes < despesasMesAnterior) {
    const pct = Math.round((1 - despesasMes / despesasMesAnterior) * 100);
    if (pct > 0) return `Você gastou ${pct}% menos que no mês passado. Encontrei uma oportunidade para economizar ainda mais.`;
  }

  const receitasMes = incomes.filter((i) => isSameMonth(i.date, now)).reduce((sum, i) => sum + i.value, 0);
  if (receitasMes > 0 && despesasMes > receitasMes) {
    return 'Suas despesas do mês já passaram das receitas — vamos dar uma olhada juntos?';
  }

  return 'Tudo tranquilo por aqui. Continue assim.';
}
