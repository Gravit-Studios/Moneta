import { FormEvent, useEffect, useState } from 'react';
import { listCategories } from '../lib/categories';
import { createExpense } from '../lib/expenses';
import { Category } from '../lib/types';
import { SuccessOverlay } from './SuccessOverlay';

interface QuickAddExpenseProps {
  onClose: () => void;
  onCreated: () => void;
}

// Formulário reduzido, num modal — a ação mais frequente do dia a dia
// (registrar uma despesa) não deveria exigir navegar até outra tela.
export function QuickAddExpense({ onClose, onCreated }: QuickAddExpenseProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    listCategories('expense')
      .then((list) => {
        setCategories(list);
        if (list.length > 0) setCategoryId(list[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar categorias.'));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createExpense({ name, value: Number(value), categoryId, dueDate, paymentMethod: 'pix' });
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a despesa.');
    } finally {
      setSaving(false);
    }
  }

  if (showSuccess) {
    return (
      <SuccessOverlay
        message="Despesa adicionada!"
        onDone={() => {
          onCreated();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="success-overlay" style={{ backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <form
        className="auth-card modal-pop"
        style={{ maxWidth: 340, textAlign: 'left' }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 style={{ marginTop: 0, marginBottom: 4 }}>Nova despesa</h2>
        <p className="text-muted" style={{ marginBottom: 16 }}>Registro rápido — dá pra completar os detalhes depois em Despesas.</p>

        <div className="form-field">
          <label htmlFor="qa-name">Nome</label>
          <input id="qa-name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="qa-value">Valor</label>
          <input id="qa-value" type="number" step="0.01" min="0" required value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="qa-category">Categoria</label>
          <select
            id="qa-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="qa-date">Vencimento</label>
          <input id="qa-date" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        {error && <p style={{ color: 'var(--color-status-danger)', marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn--primary" style={{ flex: 1 }} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
