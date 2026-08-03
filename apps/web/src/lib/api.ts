const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? 'Erro inesperado ao falar com o servidor.');
  }

  if (res.status === HTTP_NO_CONTENT) return undefined as T;
  return res.json() as Promise<T>;
}

const HTTP_NO_CONTENT = 204;

export interface Profile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) =>
    request<void>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  me: () => request<Profile>('/users/me'),
  exportData: () => request<unknown>('/users/me/export'),
  deleteAccount: () => request<void>('/users/me', { method: 'DELETE' }),
};
