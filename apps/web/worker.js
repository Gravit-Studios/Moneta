// Worker mínimo — só serve os assets estáticos do build (via env.ASSETS,
// binding configurado em wrangler.jsonc) e acrescenta headers básicos de
// segurança em cima da resposta. Nenhuma outra lógica: Auth e dados vêm
// direto do Supabase a partir do client, não passam por aqui.
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
