import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AlertsPage } from './pages/AlertsPage';
import { CalendarPage } from './pages/CalendarPage';
import { CardsPage } from './pages/CardsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { IncomesPage } from './pages/IncomesPage';
import { InstallmentsPage } from './pages/InstallmentsPage';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ProfilePage } from './pages/ProfilePage';
import { RecurringBillsPage } from './pages/RecurringBillsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/receitas" element={<IncomesPage />} />
        <Route path="/despesas" element={<ExpensesPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/cartoes" element={<CardsPage />} />
        <Route path="/contas-recorrentes" element={<RecurringBillsPage />} />
        <Route path="/parcelamentos" element={<InstallmentsPage />} />
        <Route path="/alertas" element={<AlertsPage />} />
        <Route path="/metas" element={<PlaceholderPage title="Metas" />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
