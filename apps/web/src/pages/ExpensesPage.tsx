import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { SuccessOverlay } from '../components/SuccessOverlay';
import { categoryColorVar } from '../lib/categoryColor';
import { listCategories } from '../lib/categories';
import { createExpense, deleteExpense, listExpenses, setExpensePaid } from '../lib/expenses';
import { currency, shortDate } from '../lib/format';
import { Category, Expense, PaymentMethod } from '../lib/types';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  debit: 'Débito',
  credit_card: 'Cartão de crédito',
  pix: 'Pix',
  bank_transfer: 'Transferência',
  other: 'Outro',
};

function statusOf(expense: Expense): { label: string; chip: string } {
  if (expense.paid) return { label: 'paga', chip: 'done' };
  const isOverdue = new Date(expense.due_date) < new Date(new Date().toDateString());
  return isOverdue ? { label: 'vencida', chip: 'danger' } : { label: 'pendente', chip: 'pending' };
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  async function refresh() {
    setLoading(true);
    try {
      const [expenseList, categoryList] = await Promise.all([listExpenses(), listCategories('expense')]);
      setExpenses(expenseList);
      setCategories(categoryList);
      if (!categoryId && categoryList.length > 0) setCategoryId(categoryList[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar despesas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createExpense({ name, value: Number(value), categoryId, dueDate, paymentMethod });
      setName('');
      setValue('');
      setShowSuccess(true);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a despesa.');
    }
  }

  async function handleTogglePaid(expense: Expense) {
    try {
      await setExpensePaid(expense.id, !expense.paid);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a despesa.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteExpense(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a despesa.');
    }
  }

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? '—';
  }

  return (
    <div>
      <h1 className="page-title">Despesas</h1>

      <form className="profile-section" onSubmit={handleSubmit}>
        <h2>Nova despesa</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: 2, minWidth: 160 }}>
            <label htmlFor="expense-name">Nome</label>
            <input id="expense-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 120 }}>
            <label htmlFor="expense-value">Valor</label>
            <input id="expense-value" type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
            <label htmlFor="expense-due">Vencimento</label>
            <input id="expense-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="expense-category">Categoria</label>
            <select
              id="expense-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-subtle)' }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="expense-payment">Forma de pagamento</label>
            <select
              id="expense-payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-subtle)' }}
            >
              {Object.entries(PAYMENT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn--primary" type="submit">Adicionar</button>
        </div>
        {error && <p style={{ color: 'var(--color-status-danger)', marginTop: 8 }}>{error}</p>}
      </form>

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : expenses.length === 0 ? (
        <p className="text-muted">Nenhuma despesa cadastrada ainda.</p>
      ) : (
        <div className="list-card">
          {expenses.map((expense) => {
            const status = statusOf(expense);
            return (
              <div className="list-row" key={expense.id}>
                <span>
                  {expense.name}{' '}
                  <span
                    className="cat-tag"
                    style={{ '--cat-color': categoryColorVar(expense.category_id) } as CSSProperties}
                  >
                    {categoryName(expense.category_id)}
                  </span>{' '}
                  <span className="text-muted">· {shortDate(expense.due_date)}</span>
                </span>
                <button className={`chip chip--${status.chip}`} onClick={() => handleTogglePaid(expense)} style={{ border: 'none', cursor: 'pointer' }}>
                  {status.label}
                </button>
                <span className="list-row__value">{currency(expense.value)}</span>
                <button className="btn btn--ghost" onClick={() => handleDelete(expense.id)}>Excluir</button>
              </div>
            );
          })}
        </div>
      )}

      {showSuccess && (
        <SuccessOverlay message="Despesa adicionada!" onDone={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
