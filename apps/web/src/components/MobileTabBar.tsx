import { NavLink } from 'react-router-dom';
import { BellIcon, ExpenseIcon, GridIcon, HomeIcon, UserIcon } from './icons';

const TABS = [
  { to: '/', label: 'Início', icon: HomeIcon, end: true },
  { to: '/despesas', label: 'Despesas', icon: ExpenseIcon, end: false },
  { to: '/alertas', label: 'Alertas', icon: BellIcon, end: false },
  { to: '/perfil', label: 'Perfil', icon: UserIcon, end: false },
  { to: '/mais', label: 'Mais', icon: GridIcon, end: false },
];

// Só aparece em telas estreitas (ver .tabbar em _layout.scss) — o
// equivalente mobile da sidebar, com os 4 destinos mais usados + "Mais"
// para o resto, em vez de uma barra horizontal com scroll sem indicação.
export function MobileTabBar() {
  return (
    <nav className="tabbar">
      {TABS.map(({ to, label, icon: TabIcon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `tabbar-item${isActive ? ' is-active' : ''}`}
        >
          <TabIcon className="tabbar-item__icon" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
