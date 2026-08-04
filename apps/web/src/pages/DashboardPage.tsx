import { useEffect, useMemo, useState } from 'react';
import { NoraMessage } from '../components/NoraMessage';
import { QuickAddExpense } from '../components/QuickAddExpense';
import { listExpenses } from '../lib/expenses';
import { currency } from '../lib/format';
import { listGoals } from '../lib/goals';
import { listIncomes } from '../lib/incomes';
import { noraMessage } from '../lib/noraMessage';
import { Expense, Goal, Income } from '../lib/types';

function isSameMonth(dateStr: string, ref: Date): boolean {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

// Estrutura definida no briefing de marca (docs/nora-brand-brief.md,
// seção Interface): saldo, próximas contas, meta principal, resumo do
// mês, mensagem da Nora — poucos elementos, não um grid denso de widgets.
export function DashboardPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [mainGoal, setMainGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  function refresh() {
    Promise.all([noraMessage(), listExpenses(), listIncomes(), listGoals()])
      .then(([m, e, i, goals]) => {
        setMessage(m);
        setExpenses(e);
        setIncomes(i);
        // "Meta principal" — a mais próxima da data prevista, entre as
        // ainda não concluídas.
        const open = goals.filter((g) => g.current_value < g.target_value);
        open.sort((a, b) => a.target_date.localeCompare(b.target_date));
        setMainGoal(open[0] ?? null);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar o dashboard.'))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  const now = useMemo(() => new Date(), []);

  const receitasMes = incomes.filter((i) => isSameMonth(i.date, now)).reduce((sum, i) => sum + i.value, 0);
  const despesasMes = expenses.filter((e) => isSameMonth(e.due_date, now)).reduce((sum, e) => sum + e.value, 0);
  const saldo = receitasMes - despesasMes;

  const proximasContas = expenses
    .filter((e) => !e.paid)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 3);

  return (
    <div>
      {error && <p style={{ color: 'var(--color-status-danger)' }}>{error}</p>}
      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <>
          {message && <NoraMessage message={message} />}

          <div className="hero-card">
            <div className="widget__label">Saldo</div>
            <div className="hero-number">{currency(saldo)}</div>
          </div>

          <h2 className="page-title" style={{ fontSize: 17, marginTop: 32 }}>Próximas contas</h2>
          {proximasContas.length === 0 ? (
            <p className="text-muted">Nenhuma conta em aberto.</p>
          ) : (
            <div className="list-card">
              {proximasContas.map((expense) => (
                <div className="list-row" key={expense.id}>
                  <span>{expense.name}</span>
                  <span className="text-muted">{expense.due_date.split('-').reverse().join('/')}</span>
                  <span className="list-row__value">{currency(expense.value)}</span>
                </div>
              ))}
            </div>
          )}

          <h2 className="page-title" style={{ fontSize: 17, marginTop: 32 }}>Meta principal</h2>
          {mainGoal ? (
            <div className="widget" style={{ maxWidth: 320 }}>
              <div className="widget__label">{mainGoal.name}</div>
              <div className="widget__value" style={{ fontSize: 18 }}>
                {currency(mainGoal.current_value)} de {currency(mainGoal.target_value)}
              </div>
              <div style={{ height: 6, borderRadius: 100, background: 'var(--color-subtle)', marginTop: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (mainGoal.current_value / mainGoal.target_value) * 100)}%`,
                    background: 'var(--color-emphasis)',
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-muted">Nenhuma meta em andamento.</p>
          )}

          <h2 className="page-title" style={{ fontSize: 17, marginTop: 32 }}>Resumo do mês</h2>
          <div className="widget-grid" style={{ maxWidth: 420 }}>
            <div className="widget">
              <div className="widget__label">Receitas</div>
              <div className="widget__value">{currency(receitasMes)}</div>
            </div>
            <div className="widget">
              <div className="widget__label">Despesas</div>
              <div className="widget__value">{currency(despesasMes)}</div>
            </div>
          </div>
        </>
      )}

      <button className="fab" aria-label="Adicionar despesa" onClick={() => setShowQuickAdd(true)}>+</button>

      {showQuickAdd && (
        <QuickAddExpense onClose={() => setShowQuickAdd(false)} onCreated={refresh} />
      )}
    </div>
  );
}
