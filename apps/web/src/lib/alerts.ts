import { listCards } from './cards';
import { listExpenses } from './expenses';
import { AlertType } from './types';

export interface DerivedAlert {
  type: AlertType;
  message: string;
}

function toDateOnly(date: Date): Date {
  return new Date(date.toDateString());
}

// Alertas calculados on-demand a partir do estado atual (despesas, cartões).
// Geração persistida/agendada (pg_cron ou Edge Function rodando mesmo sem o
// app aberto, gravando em public.alerts) é pendência de infraestrutura —
// ver docs/architecture.md — não faz parte desta sprint.
export async function computeAlerts(): Promise<DerivedAlert[]> {
  const [expenses, cards] = await Promise.all([listExpenses(), listCards()]);
  const today = toDateOnly(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const alerts: DerivedAlert[] = [];

  for (const expense of expenses) {
    if (expense.paid) continue;
    const dueDate = toDateOnly(new Date(`${expense.due_date}T00:00:00`));
    if (dueDate.getTime() === tomorrow.getTime()) {
      alerts.push({ type: 'bill_due_tomorrow', message: `"${expense.name}" vence amanhã.` });
    } else if (dueDate.getTime() < today.getTime()) {
      alerts.push({ type: 'bill_overdue', message: `"${expense.name}" está vencida.` });
    }
  }

  const todayDay = today.getDate();
  for (const card of cards) {
    if (card.closing_day === todayDay) {
      alerts.push({ type: 'card_closing_today', message: `O cartão "${card.name}" fecha hoje.` });
    }
  }

  return alerts;
}
