// Traduz os erros crus do Supabase Auth pra mensagens no tom da Nora —
// nunca expõe a string técnica direto pro usuário (ver task #48).
export function friendlyAuthError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos. Vamos tentar de novo?';
  }
  if (msg.includes('email not confirmed')) {
    return 'Falta confirmar seu e-mail — dá uma olhada na caixa de entrada.';
  }
  if (msg.includes('user already registered')) {
    return 'Já existe uma conta com esse e-mail. Que tal entrar em vez de cadastrar?';
  }
  if (msg.includes('password') && msg.includes('least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  if (msg.includes('rate limit')) {
    return 'Muitas tentativas seguidas — espera um minuto e tenta de novo.';
  }
  if (msg.includes('session') || msg.includes('token')) {
    return 'Esse link expirou ou já foi usado — pede um novo na tela de recuperação de senha.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Não consegui falar com o servidor agora. Confere sua conexão e tenta de novo.';
  }
  return 'Algo não saiu como esperado. Tenta de novo em instantes?';
}
