import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/receitas', label: 'Receitas' },
  { to: '/despesas', label: 'Despesas' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/cartoes', label: 'Cartões' },
  { to: '/contas-recorrentes', label: 'Contas recorrentes' },
  { to: '/parcelamentos', label: 'Parcelamentos' },
  { to: '/metas', label: 'Metas' },
  { to: '/calendario', label: 'Calendário' },
  { to: '/alertas', label: 'Alertas' },
  { to: '/relatorios', label: 'Relatórios' },
  { to: '/perfil', label: 'Perfil' },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar__brand">moneta</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
