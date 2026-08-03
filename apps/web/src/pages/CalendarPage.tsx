import { useEffect, useMemo, useState } from 'react';
import { listExpenses } from '../lib/expenses';
import { currency } from '../lib/format';
import { listIncomes } from '../lib/incomes';
import { Expense, Income } from '../lib/types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface DayEvents {
  incomes: Income[];
  expenses: Expense[];
}

export function CalendarPage() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listIncomes(), listExpenses()])
      .then(([i, e]) => {
        setIncomes(i);
        setExpenses(e);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar o calendário.'));
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, DayEvents>();
    for (const income of incomes) {
      if (!map.has(income.date)) map.set(income.date, { incomes: [], expenses: [] });
      map.get(income.date)!.incomes.push(income);
    }
    for (const expense of expenses) {
      if (!map.has(expense.due_date)) map.set(expense.due_date, { incomes: [], expenses: [] });
      map.get(expense.due_date)!.expenses.push(expense);
    }
    return map;
  }, [incomes, expenses]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }),
  ];

  return (
    <div>
      <h1 className="page-title">Calendário financeiro</h1>
      <p className="text-muted" style={{ marginBottom: 16 }}>
        Parcelas e metas entram aqui assim que os módulos de Parcelamentos e Metas existirem (Sprint 3/4).
      </p>

      {error && <p style={{ color: 'var(--color-status-danger)' }}>{error}</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn--ghost" onClick={() => setCursor(new Date(year, month - 1, 1))}>←</button>
        <strong>{MONTHS[month]} {year}</strong>
        <button className="btn btn--ghost" onClick={() => setCursor(new Date(year, month + 1, 1))}>→</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-muted" style={{ textAlign: 'center', fontSize: 12 }}>{day}</div>
        ))}
        {cells.map((date, idx) => {
          if (!date) return <div key={idx} />;
          const events = eventsByDay.get(date);
          const dayNumber = Number(date.slice(-2));
          return (
            <div
              key={date}
              className="widget"
              style={{ minHeight: 76, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <span className="text-muted" style={{ fontSize: 11 }}>{dayNumber}</span>
              {events?.incomes.map((income) => (
                <span key={income.id} className="chip chip--done" style={{ fontSize: 10 }} title={currency(income.value)}>
                  {income.name}
                </span>
              ))}
              {events?.expenses.map((expense) => (
                <span
                  key={expense.id}
                  className={`chip chip--${expense.paid ? 'done' : 'danger'}`}
                  style={{ fontSize: 10 }}
                  title={currency(expense.value)}
                >
                  {expense.name}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
