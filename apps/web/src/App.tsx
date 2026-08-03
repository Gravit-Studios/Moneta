import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/receitas" element={<PlaceholderPage title="Receitas" />} />
        <Route path="/despesas" element={<PlaceholderPage title="Despesas" />} />
        <Route path="/cartoes" element={<PlaceholderPage title="Cartões" />} />
        <Route path="/metas" element={<PlaceholderPage title="Metas" />} />
        <Route path="/calendario" element={<PlaceholderPage title="Calendário financeiro" />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
