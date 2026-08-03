// Exclusão de conta (direito ao esquecimento, LGPD). Roda com a service role
// (nunca exposta ao client) porque apagar de auth.users exige privilégio de
// admin — o anon key do front-end não tem essa permissão, de propósito.
// Deploy: supabase functions deploy delete-account
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Não autenticado.' }), { status: 401 });
  }

  // Client "de leitura" com o JWT do usuário, só para descobrir quem ele é —
  // nunca confiamos num userId vindo do corpo da requisição.
  const callerClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Sessão inválida.' }), { status: 401 });
  }

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { error } = await adminClient.auth.admin.deleteUser(userData.user.id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Apagar o usuário em auth.users cascateia para profiles e todas as
  // tabelas de domínio (ver "on delete cascade" em supabase/schema.sql).
  return new Response(null, { status: 204 });
});
