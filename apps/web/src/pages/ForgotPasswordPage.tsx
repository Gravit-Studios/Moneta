import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { NoraMark } from '../components/NoraMark';
import { api } from '../lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o link de recuperação.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card modal-pop" style={{ textAlign: 'center' }}>
          <div style={{ margin: '8px auto 16px' }}>
            <NoraMark size={48} state="success" />
          </div>
          <h1 className="page-title" style={{ fontSize: 20 }}>Te mandei um link</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Olha sua caixa de entrada — enviei um link pra você criar uma senha nova.
          </p>
          <Link to="/login" className="btn btn--ghost" style={{ marginTop: 20, display: 'inline-block' }}>
            Voltar pro login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}><NoraMark size={40} state="informing" /></div>
        <h1 className="page-title" style={{ fontSize: 22 }}>Esqueceu sua senha?</h1>
        <p className="text-muted" style={{ marginTop: -8, marginBottom: 16 }}>
          Sem problema — me diz seu e-mail que eu te mando um link pra criar uma nova.
        </p>

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

        {error && <p className="text-muted" style={{ color: 'var(--color-status-danger)' }}>{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Enviando…' : 'Enviar link'}
        </button>

        <p className="text-muted" style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/login">Voltar pro login</Link>
        </p>
      </form>
    </div>
  );
}
