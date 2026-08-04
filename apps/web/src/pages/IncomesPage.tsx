import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { SuccessOverlay } from '../components/SuccessOverlay';
import { categoryColorVar } from '../lib/categoryColor';
import { listCategories } from '../lib/categories';
import { currency, shortDate } from '../lib/format';
import { createIncome, deleteIncome, listIncomes } from '../lib/incomes';
import { Category, Income, Recurrence } from '../lib/types';

const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: 'Única',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

export function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recurrence, setRecurrence] = useState<Recurrence>('none');

  async function refresh() {
    setLoading(true);
    try {
      const [incomeList, categoryList] = await Promise.all([listIncomes(), listCategories('income')]);
      setIncomes(incomeList);
      setCategories(categoryList);
      if (!categoryId && categoryList.length > 0) setCategoryId(categoryList[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar receitas.');
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
      await createIncome({ name, value: Number(value), categoryId, date, recurrence });
      setName('');
      setValue('');
      setShowSuccess(true);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a receita.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteIncome(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a receita.');
    }
  }

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? '—';
  }

  return (
    <div>
      <h1 className="page-title">Receitas</h1>

      <form className="profile-section" onSubmit={handleSubmit}>
        <h2>Nova receita</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: 2, minWidth: 160 }}>
            <label htmlFor="income-name">Nome</label>
            <input id="income-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 120 }}>
            <label htmlFor="income-value">Valor</label>
            <input id="income-value" type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
            <label htmlFor="income-date">Data</label>
            <input id="income-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="income-category">Categoria</label>
            <select
              id="income-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
            <label htmlFor="income-recurrence">Recorrência</label>
            <select
              id="income-recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as Recurrence)}
            >
              {Object.entries(RECURRENCE_LABEL).map(([value, label]) => (
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
      ) : incomes.length === 0 ? (
        <p className="text-muted">Nenhuma receita cadastrada ainda.</p>
      ) : (
        <div className="list-card">
          {incomes.map((income) => (
            <div className="list-row" key={income.id}>
              <span>
                {income.name}{' '}
                <span
                  className="cat-tag"
                  style={{ '--cat-color': categoryColorVar(income.category_id) } as CSSProperties}
                >
                  {categoryName(income.category_id)}
                </span>{' '}
                <span className="text-muted">· {shortDate(income.date)}</span>
              </span>
              <span className="list-row__value">{currency(income.value)}</span>
              <button className="btn btn--ghost" onClick={() => handleDelete(income.id)}>Excluir</button>
            </div>
          ))}
        </div>
      )}

      {showSuccess && (
        <SuccessOverlay message="Receita adicionada!" onDone={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
