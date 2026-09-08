import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NoraMark } from '../components/NoraMark';
import { api } from '../lib/api';
import { friendlyAuthError } from '../lib/authErrors';
import { hasCompletedOnboarding } from './OnboardingPage';

// Referência: telas de onboarding tipo "Paytin" (fundo cheio na cor
// primária, ilustração central, título grande, CTA em pílula escura) —
// adaptado pra reforçar a personalidade da Nora como assistente, não
// como decoração: o núcleo orbital ocupa o lugar da "ilustração",
// grande o bastante pra ler como protagonista da tela, não como logo
// pequeno de canto. Quando as ilustrações do ChatGPT chegarem, entram
// aqui no lugar do NoraMark ampliado.
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
    <div className="login-hero">
      <div className="login-hero__illustration">
        <NoraMark size={112} state="welcome" />
      </div>

      <h1 className="login-hero__title">Oi, eu sou a Nora.</h1>
      <p className="login-hero__subtitle">
        Sua assistente financeira — acompanho seu dia a dia e aviso antes de virar problema.
      </p>

      <form className="login-hero__form" onSubmit={handleSubmit}>
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

        {error && <p className="login-hero__error">{error}</p>}

        <button className="login-hero__cta" type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="login-hero__link">
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
        </p>
        <p className="login-hero__link">
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
