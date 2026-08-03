import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Sem isso, qualquer rota "autenticada" renderizava e tentava consultar o
// Supabase mesmo sem sessão — resultado: erros confusos de permissão/401
// em vez de simplesmente mandar quem não está logado para /login.
export function RequireAuth() {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'anonymous'>('checking');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'authenticated' : 'anonymous');
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'authenticated' : 'anonymous');
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  if (status === 'checking') return null;
  if (status === 'anonymous') return <Navigate to="/login" replace />;
  return <Outlet />;
}
