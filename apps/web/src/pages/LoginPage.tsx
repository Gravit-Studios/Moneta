import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NoraMark } from '../components/NoraMark';
import { api } from '../lib/api';
import { friendlyAuthError } from '../lib/authErrors';
import { hasCompletedOnboarding } from './OnboardingPage';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login(email, password);
      setSuccess(true);
      // Primeiro acesso (ou onboarding nunca concluído nesse navegador) —
      // mostra o tutorial em vez de ir direto pro Dashboard, mesmo fora
      // do fluxo de cadastro (ex.: sessão expirou e a pessoa loga de novo).
      const destination = hasCompletedOnboarding() ? '/' : '/onboarding';
      setTimeout(() => navigate(destination), 650);
    } catch (err) {
      setError(err instanceof Error ? friendlyAuthError(err.message) : 'Não foi possível entrar.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="success-overlay">
        <div className="success-burst"><NoraMark size={40} state="success" /></div>
        <div className="success-message">Bem-vindo(a) de volta!</div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}><NoraMark size={40} /></div>
        <h1 className="page-title" style={{ fontSize: 22 }}>Entrar na Nora</h1>

        <div className="form-field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-muted" style={{ color: 'var(--color-status-danger)' }}>{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="text-muted" style={{ marginTop: 12, textAlign: 'center' }}>
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
        </p>
        <p className="text-muted" style={{ marginTop: 4, textAlign: 'center' }}>
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
