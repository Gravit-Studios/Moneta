import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CategoryDonut } from '../components/CategoryDonut';
import { NoraMessage } from '../components/NoraMessage';
import { QuickAddExpense } from '../components/QuickAddExpense';
import { listCategories } from '../lib/categories';
import { categoryColorVar } from '../lib/categoryColor';
import { listExpenses } from '../lib/expenses';
import { currency } from '../lib/format';
import { listGoals } from '../lib/goals';
import { listIncomes } from '../lib/incomes';
import { noraMessage, NoraMessageResult } from '../lib/noraMessage';
import { Category, Expense, Goal, Income } from '../lib/types';

// Ícones em SVG line-icon (1.5px stroke) — o Documento Técnico de
// Identidade Visual pede pra evitar ícone financeiro genérico com
// cifrão/dinheiro dominante, então nada de emoji 💰💸 aqui.
function IconDespesas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 5 5 13m0-8h8v8" />
    </svg>
  );
}
function IconReceitas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11 19 8-8m0 8V11m0 8h-8" />
    </svg>
  );
}
function IconMetas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconCartoes() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2.2" />
      <path d="M3 10.5h18" />
    </svg>
  );
}

const SHORTCUTS = [
  { to: '/despesas', icon: <IconDespesas />, label: 'Despesas' },
  { to: '/receitas', icon: <IconReceitas />, label: 'Receitas' },
  { to: '/metas', icon: <IconMetas />, label: 'Metas' },
  { to: '/cartoes', icon: <IconCartoes />, label: 'Cartões' },
];

function isSameMonth(dateStr: string, ref: Date): boolean {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

// Estrutura definida no briefing de marca (docs/nora-brand-brief.md,
// seção Interface): saldo, próximas contas, meta principal, resumo do
// mês, mensagem da Nora — poucos elementos, não um grid denso de widgets.
export function DashboardPage() {
  const [message, setMessage] = useState<NoraMessageResult | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [mainGoal, setMainGoal] = useState<Goal | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  function refresh() {
    Promise.all([noraMessage(), listExpenses(), listIncomes(), listGoals(), listCategories('expense')])
      .then(([m, e, i, goals, cats]) => {
        setMessage(m);
        setExpenses(e);
        setIncomes(i);
        setCategories(cats);
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

  // Top 4 categorias do mês por valor gasto, pro donut + cards de
  // destaque — o resto agrupado em "outros" pra não competir com o
  // padrão "poucos elementos" da Nora.
  const categoriaTotais = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const e of expenses) {
      if (!isSameMonth(e.due_date, now)) continue;
      byCategory.set(e.category_id, (byCategory.get(e.category_id) ?? 0) + e.value);
    }
    const rows = Array.from(byCategory.entries())
      .map(([categoryId, value]) => ({
        categoryId,
        name: categories.find((c) => c.id === categoryId)?.name ?? '—',
        value,
      }))
      .sort((a, b) => b.value - a.value);
    const top = rows.slice(0, 4);
    const outrosValue = rows.slice(4).reduce((sum, r) => sum + r.value, 0);
    return outrosValue > 0 ? [...top, { categoryId: 'outros', name: 'Outros', value: outrosValue }] : top;
  }, [expenses, categories, now]);

  return (
    <div>
      {error && <p style={{ color: 'var(--color-status-danger)' }}>{error}</p>}
      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <>
          {message && <NoraMessage message={message.text} state={message.state} />}

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

          <div className="shortcut-row">
            {SHORTCUTS.map((s) => (
              <Link key={s.to} to={s.to} className="shortcut-item">
                <span className="shortcut-item__icon">{s.icon}</span>
                <span>{s.label}</span>
              </Link>
            ))}
          </div>

          {categoriaTotais.length > 0 && (
            <>
              <h2 className="page-title" style={{ fontSize: 17, marginTop: 32 }}>Gastos por categoria</h2>
              <div className="category-highlight">
                <CategoryDonut
                  centerLabel="no mês"
                  centerValue={currency(despesasMes)}
                  slices={categoriaTotais.map((c) => ({
                    colorVar: c.categoryId === 'outros' ? 'var(--color-muted)' : categoryColorVar(c.categoryId),
                    value: c.value,
                  }))}
                />
                <div className="category-highlight__tiles">
                  {categoriaTotais.map((c) => (
                    <div
                      key={c.categoryId}
                      className="category-tile"
                      style={{ '--cat-color': c.categoryId === 'outros' ? 'var(--color-muted)' : categoryColorVar(c.categoryId) } as CSSProperties}
                    >
                      <div className="category-tile__name">{c.name}</div>
                      <div className="category-tile__value">{currency(c.value)}</div>
                      <div className="category-tile__pct">{Math.round((c.value / (despesasMes || 1)) * 100)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
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
                  className="bar-fill"
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

          <h2 className="page-title" style={{ fontSize: 17, marginTop: 32 }}>Receitas do mês</h2>
          <div className="widget" style={{ maxWidth: 220 }}>
            <div className="widget__label">Receitas</div>
            <div className="widget__value">{currency(receitasMes)}</div>
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
