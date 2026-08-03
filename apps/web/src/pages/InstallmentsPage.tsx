import { FormEvent, useEffect, useState } from 'react';
import { Card, listCards } from '../lib/cards';
import { listCategories } from '../lib/categories';
import { currency, shortDate } from '../lib/format';
import {
  createInstallment,
  deleteInstallment,
  Installment,
  installmentProgress,
  InstallmentProgress,
  listInstallments,
} from '../lib/installments';
import { Category } from '../lib/types';

export function InstallmentsPage() {
  const [progress, setProgress] = useState<InstallmentProgress[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [product, setProduct] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('12');
  const [cardId, setCardId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));

  async function refresh() {
    setLoading(true);
    try {
      const [installments, cardList, categoryList] = await Promise.all([
        listInstallments(),
        listCards(),
        listCategories('expense'),
      ]);
      setProgress(await Promise.all(installments.map(installmentProgress)));
      setCards(cardList);
      setCategories(categoryList);
      if (!cardId && cardList.length > 0) setCardId(cardList[0].id);
      if (!categoryId && categoryList.length > 0) setCategoryId(categoryList[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar parcelamentos.');
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
    if (!cardId) {
      setError('Cadastre um cartão antes de criar um parcelamento.');
      return;
    }
    try {
      await createInstallment({
        product,
        totalValue: Number(totalValue),
        installmentsCount: Number(installmentsCount),
        cardId,
        categoryId,
        startDate,
      });
      setProduct('');
      setTotalValue('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o parcelamento.');
    }
  }

  async function handleDelete(installment: Installment) {
    try {
      await deleteInstallment(installment.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir.');
    }
  }

  return (
    <div>
      <h1 className="page-title">Parcelamentos</h1>

      <form className="profile-section" onSubmit={handleSubmit}>
        <h2>Novo parcelamento</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: 2, minWidth: 160 }}>
            <label htmlFor="inst-product">Produto</label>
            <input id="inst-product" value={product} onChange={(e) => setProduct(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 120 }}>
            <label htmlFor="inst-total">Valor total</label>
            <input id="inst-total" type="number" step="0.01" min="0" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 100 }}>
            <label htmlFor="inst-count">Parcelas</label>
            <input id="inst-count" type="number" min="1" max="48" value={installmentsCount} onChange={(e) => setInstallmentsCount(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
            <label htmlFor="inst-start">Data inicial</label>
            <input id="inst-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="inst-card">Cartão</label>
            <select
              id="inst-card"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-subtle)' }}
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>{card.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="inst-category">Categoria</label>
            <select
              id="inst-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-subtle)' }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn--primary" type="submit">Adicionar</button>
        </div>
        {error && <p style={{ color: 'var(--color-status-danger)', marginTop: 8 }}>{error}</p>}
      </form>

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : progress.length === 0 ? (
        <p className="text-muted">Nenhum parcelamento cadastrado ainda.</p>
      ) : (
        <div className="widget-grid">
          {progress.map(({ installment, paidCount, remainingCount, remainingValue }) => (
            <div key={installment.id} className="widget">
              <div className="widget__label">{installment.product}</div>
              <div className="widget__value" style={{ fontSize: 18 }}>
                {paidCount}/{installment.installments_count} parcelas
              </div>
              <p className="text-muted" style={{ marginTop: 8 }}>
                restam {remainingCount} · {currency(remainingValue)} · início {shortDate(installment.start_date)}
              </p>
              <button className="btn btn--ghost" onClick={() => handleDelete(installment)} style={{ marginTop: 8 }}>Excluir</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
