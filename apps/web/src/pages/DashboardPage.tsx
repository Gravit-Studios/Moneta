// Dados de exemplo — os endpoints reais de receitas/despesas/metas chegam na
// Sprint 2. O objetivo aqui é validar layout e hierarquia dos widgets do MVP.
const summary = {
  saldoAtual: 4280.17,
  receitasMes: 7100.0,
  despesasMes: 3620.4,
  contasPendentes: 4,
  contasVencidas: 2,
};

const proximosVencimentos = [
  { nome: 'Aluguel', valor: 1500, status: 'danger' as const, label: 'vencida' },
  { nome: 'Energia', valor: 210, status: 'warn' as const, label: 'amanhã' },
  { nome: 'Internet', valor: 99, status: 'done' as const, label: 'paga' },
];

const metas = [
  { nome: 'Viagem', atual: 3200, alvo: 6000 },
  { nome: 'Reserva de emergência', atual: 9000, alvo: 9000 },
];

const alertas = ['Seu saldo ficará negativo no dia 24.', 'Você gastou 18% menos com alimentação este mês.'];

function currency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function DashboardPage() {
  return (
    <div>
      <h1 className="page-title">Onde estou?</h1>

      <div className="widget-grid">
        <div className="widget">
          <div className="widget__label">Saldo atual</div>
          <div className="widget__value">{currency(summary.saldoAtual)}</div>
        </div>
        <div className="widget">
          <div className="widget__label">Receitas do mês</div>
          <div className="widget__value">{currency(summary.receitasMes)}</div>
        </div>
        <div className="widget">
          <div className="widget__label">Despesas do mês</div>
          <div className="widget__value">{currency(summary.despesasMes)}</div>
        </div>
        <div className="widget">
          <div className="widget__label">Contas pendentes</div>
          <div className="widget__value">{summary.contasPendentes}</div>
        </div>
        <div className="widget">
          <div className="widget__label">Contas vencidas</div>
          <div className="widget__value">{summary.contasVencidas}</div>
        </div>
      </div>

      <h2 className="page-title" style={{ fontSize: 18 }}>Próximos vencimentos</h2>
      <div className="list-card">
        {proximosVencimentos.map((item) => (
          <div className="list-row" key={item.nome}>
            <span>{item.nome}</span>
            <span className={`chip chip--${item.status}`}>{item.label}</span>
            <span className="list-row__value">{currency(item.valor)}</span>
          </div>
        ))}
      </div>

      <h2 className="page-title" style={{ fontSize: 18 }}>Metas</h2>
      <div className="list-card">
        {metas.map((meta) => (
          <div className="list-row" key={meta.nome}>
            <span>{meta.nome}</span>
            <span className="list-row__value">
              {currency(meta.atual)} de {currency(meta.alvo)}
            </span>
          </div>
        ))}
      </div>

      <h2 className="page-title" style={{ fontSize: 18 }}>Alertas</h2>
      <div className="list-card">
        {alertas.map((texto) => (
          <div className="list-row" key={texto}>
            <span>{texto}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
