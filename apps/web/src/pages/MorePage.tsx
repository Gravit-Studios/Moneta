import { Link } from 'react-router-dom';

// Só existe na navegação mobile (ver tabbar "Mais") — reúne os destinos que
// não cabem nos 4 slots principais da tab bar. No desktop a sidebar já
// mostra tudo, então essa rota simplesmente não é linkada lá.
const MORE_ITEMS = [
  { to: '/receitas', label: 'Receitas' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/cartoes', label: 'Cartões' },
  { to: '/contas-recorrentes', label: 'Contas recorrentes' },
  { to: '/parcelamentos', label: 'Parcelamentos' },
  { to: '/metas', label: 'Metas' },
  { to: '/calendario', label: 'Calendário' },
  { to: '/relatorios', label: 'Relatórios' },
  { to: '/perfil', label: 'Perfil' },
];

export function MorePage() {
  return (
    <div>
      <h1 className="page-title">Mais</h1>
      <div className="list-card">
        {MORE_ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className="list-row" style={{ color: 'var(--color-default)', textDecoration: 'none' }}>
            <span>{item.label}</span>
            <span className="text-muted">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
