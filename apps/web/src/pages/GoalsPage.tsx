import { FormEvent, useEffect, useState } from 'react';
import { currency, shortDate } from '../lib/format';
import { contributeToGoal, createGoal, deleteGoal, listGoals } from '../lib/goals';
import { Goal } from '../lib/types';

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      setGoals(await listGoals());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar metas.');
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
      await createGoal({ name, targetValue: Number(targetValue), targetDate });
      setName('');
      setTargetValue('');
      setTargetDate('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a meta.');
    }
  }

  async function handleContribute(goal: Goal) {
    const raw = contributions[goal.id];
    const amount = Number(raw);
    if (!raw || Number.isNaN(amount) || amount <= 0) return;
    try {
      await contributeToGoal(goal, amount);
      setContributions((prev) => ({ ...prev, [goal.id]: '' }));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível registrar o aporte.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteGoal(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a meta.');
    }
  }

  return (
    <div>
      <h1 className="page-title">Metas</h1>

      <form className="profile-section" onSubmit={handleSubmit}>
        <h2>Nova meta</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ flex: 2, minWidth: 160, marginBottom: 0 }}>
            <label htmlFor="goal-name">Nome</label>
            <input id="goal-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 120, marginBottom: 0 }}>
            <label htmlFor="goal-target">Valor alvo</label>
            <input id="goal-target" type="number" step="0.01" min="0" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required />
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
            <label htmlFor="goal-date">Data prevista</label>
            <input id="goal-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
          </div>
          <button className="btn btn--primary" type="submit">Adicionar</button>
        </div>
        {error && <p style={{ color: 'var(--color-status-danger)', marginTop: 8 }}>{error}</p>}
      </form>

      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : goals.length === 0 ? (
        <p className="text-muted">Nenhuma meta cadastrada ainda.</p>
      ) : (
        <div className="widget-grid">
          {goals.map((goal) => {
            const pct = goal.target_value > 0 ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0;
            const done = goal.current_value >= goal.target_value;
            return (
              <div key={goal.id} className="widget">
                <div className="widget__label">{goal.name}</div>
                <div className="widget__value" style={{ fontSize: 18 }}>
                  {currency(goal.current_value)} de {currency(goal.target_value)}
                </div>
                <div style={{ height: 6, borderRadius: 100, background: 'var(--color-subtle)', marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: done ? 'var(--color-status-done)' : 'var(--color-emphasis)' }} />
                </div>
                <p className="text-muted" style={{ marginTop: 8 }}>
                  {done ? 'concluída' : `previsão: ${shortDate(goal.target_date)}`}
                </p>
                {!done && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Aportar"
                      value={contributions[goal.id] ?? ''}
                      onChange={(e) => setContributions((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-subtle)' }}
                    />
                    <button className="btn btn--ghost" onClick={() => handleContribute(goal)}>Adicionar</button>
                  </div>
                )}
                <button className="btn btn--ghost" onClick={() => handleDelete(goal.id)} style={{ marginTop: 8 }}>Excluir</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
