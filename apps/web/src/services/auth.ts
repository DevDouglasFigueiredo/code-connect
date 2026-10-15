import { http } from './http';

export type User = { id: string; name: string; email: string };
export type LoginInput = { email: string; password: string };
export type RegistrationInput = LoginInput & { name: string };
export type Token = { access_token: string; token_type: 'Bearer'; expires_in: number };
export type ApiResponse<T> = { data: T; links: Record<string, string> };

export async function register({ name, email, password }: RegistrationInput) {
  const response = await http.post<ApiResponse<User>>('/users', { name: name.trim(), email: email.trim().toLowerCase(), password });
  return response.data.data;
}
export async function signIn({ email, password }: LoginInput) {
  const response = await http.post<ApiResponse<Token>>('/sessions', { email: email.trim().toLowerCase(), password });
  return response.data.data;
}
export async function getProfile(signal?: AbortSignal) {
  const response = await http.get<ApiResponse<User>>('/users/me', { signal });
  return response.data.data;
}
