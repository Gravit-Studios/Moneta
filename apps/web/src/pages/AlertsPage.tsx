import { useEffect, useState } from 'react';
import { computeAlerts, DerivedAlert } from '../lib/alerts';

const CHIP_BY_TYPE: Record<DerivedAlert['type'], string> = {
  bill_due_tomorrow: 'warn',
  bill_overdue: 'danger',
  card_closing_today: 'warn',
  goal_overdue: 'danger',
  goal_completed: 'done',
  insufficient_balance: 'danger',
  income_expected: 'info',
  installment_completed: 'done',
};

export function AlertsPage() {
  const [alerts, setAlerts] = useState<DerivedAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    computeAlerts()
      .then((a) => {
        setAlerts(a);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao calcular alertas.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">Alertas</h1>
      <p className="text-muted" style={{ marginBottom: 16 }}>
        Calculados a partir dos seus dados agora — alertas de metas e receita prevista chegam junto com
        os módulos de Metas (Sprint 4). Notificação fora do app (push/e-mail) é backlog de infraestrutura.
      </p>

      {error && <p style={{ color: 'var(--color-status-danger)' }}>{error}</p>}
      {loading ? (
        <p className="text-muted">Carregando…</p>
      ) : alerts.length === 0 ? (
        <p className="text-muted">Nenhum alerta no momento.</p>
      ) : (
        <div className="list-card">
          {alerts.map((alert, idx) => (
            <div className="list-row" key={idx}>
              <span className={`chip chip--${CHIP_BY_TYPE[alert.type]}`}>{alert.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
