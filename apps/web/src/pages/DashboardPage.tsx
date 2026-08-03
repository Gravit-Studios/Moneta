import { useEffect, useMemo, useState } from 'react';
import { listExpenses } from '../lib/expenses';
import { currency } from '../lib/format';
import { listIncomes } from '../lib/incomes';
import { Expense, Income } from '../lib/types';

function isSameMonth(dateStr: string, ref: Date): boolean {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function DashboardPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listIncomes(), listExpenses()])
      .then(([i, e]) => {
        setIncomes(i);
        setExpenses(e);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar o dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const now = useMemo(() => new Date(), []);

  const receitasMes = incomes.filter((i) => isSameMonth(i.date, now)).reduce((sum, i) => sum + i.value, 0);
  const despesasMes = expenses.filter((e) => isSameMonth(e.due_date, now)).reduce((sum, e) => sum + e.value, 0);
  const saldoAtual = receitasMes - despesasMes;
  const contasPendentes = expenses.filter((e) => !e.paid && new Date(e.due_date) >= new Date(now.toDateString())).length;
  const contasVencidas = expenses.filter((e) => !e.paid && new Date(e.due_date) < new Date(now.toDateString())).length;

  const proximosVencimentos = expenses
    .filter((e) => !e.paid)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  function statusOf(expense: Expense) {
    if (expense.paid) return { label: 'paga', chip: 'done' as const };
    const overdue = new Date(expense.due_date) < new Date(now.toDateString());
    return overdue ? { label: 'vencida', chip: 'danger' as const } : { label: 'a vencer', chip: 'warn' as const };
  }

  return (
    <div>
      <h1 className="page-title">Onde estou?</h1>

      {error && <p style={{ color: 'var(--color-status-danger)' }}>{error}</p>}
      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <>
          <div className="widget-grid">
            <div className="widget">
              <div className="widget__label">Saldo do mês</div>
              <div className="widget__value">{currency(saldoAtual)}</div>
            </div>
            <div className="widget">
              <div className="widget__label">Receitas do mês</div>
              <div className="widget__value">{currency(receitasMes)}</div>
            </div>
            <div className="widget">
              <div className="widget__label">Despesas do mês</div>
              <div className="widget__value">{currency(despesasMes)}</div>
            </div>
            <div className="widget">
              <div className="widget__label">Contas pendentes</div>
              <div className="widget__value">{contasPendentes}</div>
            </div>
            <div className="widget">
              <div className="widget__label">Contas vencidas</div>
              <div className="widget__value">{contasVencidas}</div>
            </div>
          </div>

          <h2 className="page-title" style={{ fontSize: 18 }}>Próximos vencimentos</h2>
          {proximosVencimentos.length === 0 ? (
            <p className="text-muted">Nenhuma conta em aberto.</p>
          ) : (
            <div className="list-card">
              {proximosVencimentos.map((expense) => {
                const status = statusOf(expense);
                return (
                  <div className="list-row" key={expense.id}>
                    <span>{expense.name}</span>
                    <span className={`chip chip--${status.chip}`}>{status.label}</span>
                    <span className="list-row__value">{currency(expense.value)}</span>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-muted">
            Metas e alertas aparecem aqui assim que os módulos de Metas e Gamificação existirem (Sprint 3/4).
          </p>
        </>
      )}
    </div>
  );
}
