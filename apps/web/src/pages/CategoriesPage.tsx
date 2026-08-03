import { FormEvent, useEffect, useState } from 'react';
import { createCategory, deleteCategory, listCategories } from '../lib/categories';
import { Category, CategoryType } from '../lib/types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      setCategories(await listCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createCategory(name, type);
      setName('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a categoria.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a categoria.');
    }
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div>
      <h1 className="page-title">Categorias</h1>

      <form className="profile-section" onSubmit={handleSubmit}>
        <h2>Nova categoria</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
            <label htmlFor="cat-name">Nome</label>
            <input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label htmlFor="cat-type">Tipo</label>
            <select
              id="cat-type"
              value={type}
              onChange={(e) => setType(e.target.value as CategoryType)}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-subtle)' }}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          <button className="btn btn--primary" type="submit">Adicionar</button>
        </div>
        {error && <p style={{ color: 'var(--color-status-danger)', marginTop: 8 }}>{error}</p>}
      </form>

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : (
        <>
          <h2 className="page-title" style={{ fontSize: 18 }}>Despesas</h2>
          <div className="list-card">
            {expenseCategories.map((cat) => (
              <div className="list-row" key={cat.id}>
                <span>{cat.name}{cat.is_default && <span className="text-muted"> · padrão</span>}</span>
                {!cat.is_default && (
                  <button className="btn btn--ghost" onClick={() => handleDelete(cat.id)}>Excluir</button>
                )}
              </div>
            ))}
          </div>

          <h2 className="page-title" style={{ fontSize: 18 }}>Receitas</h2>
          <div className="list-card">
            {incomeCategories.map((cat) => (
              <div className="list-row" key={cat.id}>
                <span>{cat.name}{cat.is_default && <span className="text-muted"> · padrão</span>}</span>
                {!cat.is_default && (
                  <button className="btn btn--ghost" onClick={() => handleDelete(cat.id)}>Excluir</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
