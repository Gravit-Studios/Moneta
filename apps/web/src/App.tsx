import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { CalendarPage } from './pages/CalendarPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { IncomesPage } from './pages/IncomesPage';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/receitas" element={<IncomesPage />} />
        <Route path="/despesas" element={<ExpensesPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/cartoes" element={<PlaceholderPage title="Cartões" />} />
        <Route path="/metas" element={<PlaceholderPage title="Metas" />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
