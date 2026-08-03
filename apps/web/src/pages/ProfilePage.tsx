import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Profile } from '../lib/api';

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    api.me().then(setProfile).catch((err) => setError(err.message));
  }, []);

  async function handleExport() {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'meus-dados-moneta.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível exportar os dados.');
    }
  }

  async function handleDelete() {
    try {
      await api.deleteAccount();
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a conta.');
    }
  }

  return (
    <div>
      <h1 className="page-title">Perfil</h1>

      {error && <p style={{ color: 'var(--color-status-danger)' }}>{error}</p>}

      <div className="profile-section">
        <h2>Dados da conta</h2>
        {profile ? (
          <>
            <p>{profile.name}</p>
            <p className="text-muted">{profile.email}</p>
          </>
        ) : (
          <p className="text-muted">Carregando…</p>
        )}
      </div>

      <div className="profile-section">
        <h2>Meus dados</h2>
        <p className="text-muted">
          Você pode exportar todos os seus dados financeiros a qualquer momento, ou excluir
          permanentemente sua conta e tudo que está associado a ela.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button className="btn btn--ghost" onClick={handleExport}>
            Exportar meus dados
          </button>
          {!confirmingDelete ? (
            <button className="btn btn--danger" onClick={() => setConfirmingDelete(true)}>
              Excluir minha conta
            </button>
          ) : (
            <>
              <button className="btn btn--danger" onClick={handleDelete}>
                Confirmar exclusão definitiva
              </button>
              <button className="btn btn--ghost" onClick={() => setConfirmingDelete(false)}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
