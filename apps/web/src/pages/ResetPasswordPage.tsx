import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NoraMark } from '../components/NoraMark';
import { friendlyAuthError } from '../lib/authErrors';
import { supabase } from '../lib/supabaseClient';

// Chegamos aqui pelo link de e-mail do resetPasswordForEmail — o
// supabase-js já detecta o token na URL e abre uma sessão temporária de
// recuperação sozinho (detectSessionInUrl, padrão do client). Só falta
// pedir a senha nova e trocar.
//
// Segurança: rota pública (fora do RequireAuth) por necessidade — o link
// chega por e-mail, sem o usuário estar logado ainda. A única credencial
// válida aqui é o token de recovery na própria URL (de posse de quem tem
// acesso ao e-mail); sem ele, supabase.auth.getSession() não retorna
// sessão nenhuma, e checamos isso explicitamente antes de mostrar o
// formulário — evita a tela confusa de "link genérico sempre aberto"
// respondendo com erro técnico só depois do submit.
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);
      setDone(true);
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      setError(err instanceof Error ? friendlyAuthError(err.message) : 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  }

  if (hasSession === false) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ margin: '8px auto 16px' }}><NoraMark size={48} state="alert" /></div>
          <h1 className="page-title" style={{ fontSize: 20 }}>Esse link não é mais válido</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Ele pode ter expirado ou já ter sido usado. Pede um novo.
          </p>
          <Link to="/esqueci-senha" className="btn btn--primary" style={{ marginTop: 20, display: 'inline-block' }}>
            Pedir novo link
          </Link>
        </div>
      </div>
    );
  }

  if (hasSession === null) {
    return <div className="auth-page" />;
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card modal-pop" style={{ textAlign: 'center' }}>
          <div style={{ margin: '8px auto 16px' }}>
            <NoraMark size={48} state="success" />
          </div>
          <h1 className="page-title" style={{ fontSize: 20 }}>Senha atualizada!</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>Já já te levo pro login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}><NoraMark size={40} /></div>
        <h1 className="page-title" style={{ fontSize: 22 }}>Crie uma senha nova</h1>

        <div className="form-field">
          <label htmlFor="password">Nova senha</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-muted" style={{ color: 'var(--color-status-danger)' }}>{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  );
}
