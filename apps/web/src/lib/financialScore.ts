import { listExpenses } from './expenses';
import { listGoals } from './goals';
import { listIncomes } from './incomes';

export interface FinancialScoreBreakdown {
  score: number;
  pontualidade: number;
  reserva: number;
  comprometimento: number;
  economia: number;
}

function isSameMonth(dateStr: string, ref: Date): boolean {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

// Score 0-100, heurístico e transparente (não é IA) — soma de 4 componentes:
//
// - Pontualidade (30 pts): % de contas em aberto que NÃO estão vencidas.
//   Aproximação: o schema ainda não tem "paid_at", então não dá pra saber se
//   uma conta paga foi paga antes ou depois do vencimento — só olhamos o que
//   está em aberto agora.
// - Reserva (20 pts): existe alguma meta concluída com "reserva" no nome
//   (heurística simples, mesma lógica de texto usada nas conquistas).
// - Comprometimento com parcelamentos (20 pts): quanto do total de parcelas
//   ainda restantes, em valor, cabe dentro de uma folga de 3x a receita do
//   mês — quanto menor a proporção, melhor o score.
// - Economia (30 pts): (receita - despesa) do mês corrente como % da
//   receita do mês.
export async function computeFinancialScore(): Promise<FinancialScoreBreakdown> {
  const now = new Date();
  const [incomes, expenses, goals] = await Promise.all([listIncomes(), listExpenses(), listGoals()]);

  const openExpenses = expenses.filter((e) => !e.paid);
  const overdue = openExpenses.filter((e) => new Date(e.due_date) < new Date(now.toDateString()));
  const pontualidadePct = openExpenses.length === 0 ? 1 : 1 - overdue.length / openExpenses.length;
  const pontualidade = Math.round(pontualidadePct * 30);

  const reservaCompleta = goals.some(
    (g) => g.name.toLowerCase().includes('reserva') && g.current_value >= g.target_value,
  );
  const reserva = reservaCompleta ? 20 : 0;

  const receitaMes = incomes.filter((i) => isSameMonth(i.date, now)).reduce((sum, i) => sum + i.value, 0);
  const parcelasRestantes = expenses
    .filter((e) => e.installment_id && !e.paid)
    .reduce((sum, e) => sum + e.value, 0);
  const folga = receitaMes * 3;
  const comprometimentoPct = folga === 0 ? (parcelasRestantes > 0 ? 0 : 1) : Math.max(0, 1 - parcelasRestantes / folga);
  const comprometimento = Math.round(comprometimentoPct * 20);

  const despesaMes = expenses.filter((e) => isSameMonth(e.due_date, now)).reduce((sum, e) => sum + e.value, 0);
  const economiaPct = receitaMes === 0 ? 0 : Math.max(0, Math.min(1, (receitaMes - despesaMes) / receitaMes));
  const economia = Math.round(economiaPct * 30);

  return {
    score: pontualidade + reserva + comprometimento + economia,
    pontualidade,
    reserva,
    comprometimento,
    economia,
  };
}
