import { useEffect, useMemo, useState } from 'react';
import { listCategories } from '../lib/categories';
import { listExpenses } from '../lib/expenses';
import { currency } from '../lib/format';
import { listIncomes } from '../lib/incomes';
import { Category, Expense, Income } from '../lib/types';

const MONTH_LABEL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function ReportsPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listIncomes(), listExpenses(), listCategories()])
      .then(([i, e, c]) => {
        setIncomes(i);
        setExpenses(e);
        setCategories(c);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios.'))
      .finally(() => setLoading(false));
  }, []);

  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: monthKey(d), label: `${MONTH_LABEL[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, date: d };
    });
  }, []);

  const monthlyComparison = months.map(({ key, label, date }) => {
    const receitas = incomes
      .filter((i) => monthKey(new Date(`${i.date}T00:00:00`)) === key)
      .reduce((sum, i) => sum + i.value, 0);
    const despesas = expenses
      .filter((e) => monthKey(new Date(`${e.due_date}T00:00:00`)) === key)
      .reduce((sum, e) => sum + e.value, 0);
    return { label, date, receitas, despesas };
  });

  const maxValue = Math.max(1, ...monthlyComparison.flatMap((m) => [m.receitas, m.despesas]));

  const now = new Date();
  const categoryTotals = new Map<string, number>();
  for (const expense of expenses) {
    const d = new Date(`${expense.due_date}T00:00:00`);
    if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) continue;
    categoryTotals.set(expense.category_id, (categoryTotals.get(expense.category_id) ?? 0) + expense.value);
  }
  const categoryRows = Array.from(categoryTotals.entries())
    .map(([categoryId, total]) => ({
      name: categories.find((c) => c.id === categoryId)?.name ?? '—',
      total,
    }))
    .sort((a, b) => b.total - a.total);
  const categoryMax = Math.max(1, ...categoryRows.map((r) => r.total));

  return (
    <div>
      <h1 className="page-title">Relatórios</h1>

      {error && <p style={{ color: 'var(--color-status-danger)' }}>{error}</p>}
      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <>
          <h2 className="page-title" style={{ fontSize: 18 }}>Comparativo mensal (6 meses)</h2>
          <div className="list-card" style={{ padding: '16px 20px' }}>
            {monthlyComparison.map((m) => (
              <div key={m.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span className="text-muted">{m.label}</span>
                  <span className="text-muted">
                    <span style={{ fontFamily: 'ui-monospace, monospace' }}>{currency(m.receitas)}</span>
                    {' / '}
                    <span style={{ fontFamily: 'ui-monospace, monospace' }}>{currency(m.despesas)}</span>
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--color-subtle)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(m.receitas / maxValue) * 100}%`, background: 'var(--color-status-done)' }} />
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--color-subtle)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(m.despesas / maxValue) * 100}%`, background: 'var(--color-status-danger)' }} />
                  </div>
                </div>
              </div>
            ))}
            <p className="text-muted" style={{ marginTop: 4 }}>
              <span className="chip chip--done" style={{ marginRight: 8 }}>receitas</span>
              <span className="chip chip--danger">despesas</span>
            </p>
          </div>

          <h2 className="page-title" style={{ fontSize: 18 }}>Gastos por categoria (mês atual)</h2>
          {categoryRows.length === 0 ? (
            <p className="text-muted">Nenhuma despesa neste mês ainda.</p>
          ) : (
            <div className="list-card" style={{ padding: '16px 20px' }}>
              {categoryRows.map((row) => (
                <div key={row.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{row.name}</span>
                    <span style={{ fontFamily: 'ui-monospace, monospace' }}>{currency(row.total)}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--color-subtle)', overflow: 'hidden', marginTop: 4 }}>
                    <div style={{ height: '100%', width: `${(row.total / categoryMax) * 100}%`, background: 'var(--color-emphasis)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
