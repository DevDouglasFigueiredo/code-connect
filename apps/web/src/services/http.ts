import axios from 'axios';
import { clearSession, readSession } from '../auth/session';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10_000,
});

http.interceptors.request.use((config) => {
  const session = readSession();
  if (session && config.url !== '/sessions' && !(config.url === '/users' && config.method === 'post')) config.headers.set('Authorization', `Bearer ${session.token}`);
  return config;
});

http.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    const authorization = error.config?.headers.get('Authorization');
    const session = readSession();
    if (session && authorization === `Bearer ${session.token}`) clearSession();
  }
  return Promise.reject(error);
});

export function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Não foi possível concluir a operação. Tente novamente.';
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return 'A solicitação demorou demais. Tente novamente.';
  if (!error.response) return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
  if (error.response.status === 401) return 'Email ou senha inválidos, ou sessão expirada. Faça login novamente.';
  if (error.response.status === 422) {
    if (error.response.data?.message === 'Email already registered') return 'Este email já está cadastrado.';
    return 'Confira os dados informados. Use um email válido e, no cadastro, uma senha de 8 a 128 caracteres.';
  }
  return 'O serviço está indisponível no momento. Tente novamente.';
}
