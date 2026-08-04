import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AchievementBadge } from '../components/AchievementBadge';
import { api, Profile } from '../lib/api';
import {
  ACHIEVEMENTS,
  AchievementKey,
  getProfileStats,
  getUnlockedAchievements,
  levelFor,
  ProfileStats,
} from '../lib/gamification';

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [unlocked, setUnlocked] = useState<AchievementKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    api.me().then((p) => {
      setProfile(p);
      setError(null);
    }).catch((err) => setError(err.message));
    getProfileStats().then(setStats).catch(() => {});
    getUnlockedAchievements().then(setUnlocked).catch(() => {});
  }, []);

  async function handleExport() {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'meus-dados-nora.json';
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

      {stats && (
        <div className="profile-section">
          <h2>Progresso</h2>
          {(() => {
            const level = levelFor(stats.xp);
            const pct = level.nextMinXp
              ? Math.min(100, ((stats.xp - level.minXp) / (level.nextMinXp - level.minXp)) * 100)
              : 100;
            return (
              <>
                <p>
                  <strong>{level.name}</strong> <span className="text-muted">· {stats.xp} XP</span>
                </p>
                <div style={{ height: 6, borderRadius: 100, background: 'var(--color-subtle)', margin: '8px 0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-emphasis)' }} />
                </div>
                <p className="text-muted">
                  Sequência atual: {stats.current_streak} {stats.current_streak === 1 ? 'dia' : 'dias'} · recorde: {stats.longest_streak}
                </p>
              </>
            );
          })()}
          <p className="text-muted" style={{ marginTop: 12, marginBottom: 6 }}>Conquistas</p>
          <div className="achievement-grid">
            {(Object.entries(ACHIEVEMENTS) as [AchievementKey, string][]).map(([key, label]) => (
              <AchievementBadge key={key} label={label} unlocked={unlocked.includes(key)} />
            ))}
          </div>
        </div>
      )}

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
