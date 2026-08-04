import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NoraMark } from '../components/NoraMark';
import { api } from '../lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.register(name, email, password);
      // Login automático depois do cadastro, se o projeto Supabase não
      // exigir confirmação de e-mail; se exigir, o login vai pedir de novo
      // depois que a pessoa confirmar — sem quebrar o fluxo.
      try {
        await api.login(email, password);
      } catch {
        // segue mesmo assim
      }
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}><NoraMark size={40} /></div>
        <h1 className="page-title" style={{ fontSize: 22 }}>Criar conta na Nora</h1>

        <div className="form-field">
          <label htmlFor="name">Nome</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-field">
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="text-muted" style={{ color: 'var(--color-status-danger)' }}>{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Criando conta…' : 'Criar conta'}
        </button>

        <p className="text-muted" style={{ marginTop: 16, textAlign: 'center' }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
