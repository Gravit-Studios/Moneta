import { FormEvent, useEffect, useState } from 'react';
import { Card, cardUsage, createCard, deleteCard, listCards } from '../lib/cards';
import { currency } from '../lib/format';

// Decorativo — nunca guardamos número de cartão de verdade (ver
// supabase/schema.sql). Só dá um toque visual de "cartão de verdade" em
// vez de um card de texto genérico.
function decorativeDigits(cardId: string): string {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) hash = (hash * 31 + cardId.charCodeAt(i)) >>> 0;
  return String(hash % 10000).padStart(4, '0');
}

export function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [closingDay, setClosingDay] = useState('1');
  const [dueDay, setDueDay] = useState('10');

  async function refresh() {
    setLoading(true);
    try {
      const cardList = await listCards();
      setCards(cardList);
      const usageEntries = await Promise.all(cardList.map(async (c) => [c.id, await cardUsage(c.id)] as const));
      setUsage(Object.fromEntries(usageEntries));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cartões.');
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
      await createCard({
        name,
        limitAmount: Number(limitAmount),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
      });
      setName('');
      setLimitAmount('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o cartão.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCard(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir o cartão.');
    }
  }

  return (
    <div>
      <h1 className="page-title">Cartões</h1>

      <form className="profile-section" onSubmit={handleSubmit}>
        <h2>Novo cartão</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ flex: 2, minWidth: 160, marginBottom: 0 }}>
            <label htmlFor="card-name">Nome</label>
            <input id="card-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 120, marginBottom: 0 }}>
            <label htmlFor="card-limit">Limite</label>
            <input id="card-limit" type="number" step="0.01" min="0" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 100, marginBottom: 0 }}>
            <label htmlFor="card-closing">Fechamento (dia)</label>
            <input id="card-closing" type="number" min="1" max="31" value={closingDay} onChange={(e) => setClosingDay(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 100, marginBottom: 0 }}>
            <label htmlFor="card-due">Vencimento (dia)</label>
            <input id="card-due" type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required />
          </div>
          <button className="btn btn--primary" type="submit">Adicionar</button>
        </div>
        {error && <p style={{ color: 'var(--color-status-danger)', marginTop: 8 }}>{error}</p>}
      </form>

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : cards.length === 0 ? (
        <p className="text-muted">Nenhum cartão cadastrado ainda.</p>
      ) : (
        <div className="widget-grid">
          {cards.map((card) => {
            const used = usage[card.id] ?? 0;
            const available = card.limit_amount - used;
            const pct = card.limit_amount > 0 ? Math.min(100, (used / card.limit_amount) * 100) : 0;
            return (
              <div key={card.id}>
                <div className="credit-card">
                  <div className="credit-card__top">
                    <span className="credit-card__name">{card.name}</span>
                    <span className="credit-card__chip" />
                  </div>
                  <div>
                    <div className="credit-card__number">•••• •••• •••• {decorativeDigits(card.id)}</div>
                    <div className="hero-number" style={{ fontSize: 24, color: 'inherit' }}>{currency(used)}</div>
                  </div>
                  <div className="credit-card__bottom">
                    <span>fecha dia {card.closing_day}</span>
                    <span>vence dia {card.due_day}</span>
                  </div>
                </div>

                <div className="widget" style={{ marginTop: 8 }}>
                  <div className="widget__label">Limite</div>
                  <div style={{ height: 6, borderRadius: 100, background: 'var(--color-subtle)', marginTop: 6, overflow: 'hidden' }}>
                    <div className="bar-fill" style={{ height: '100%', width: `${pct}%`, background: 'var(--color-status-warn)' }} />
                  </div>
                  <p className="text-muted" style={{ marginTop: 8 }}>
                    disponível: {currency(available)} de {currency(card.limit_amount)}
                  </p>
                  <button className="btn btn--ghost" onClick={() => handleDelete(card.id)} style={{ marginTop: 8 }}>Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
