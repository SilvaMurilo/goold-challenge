const API = process.env.NEXT_PUBLIC_API_URL!;

export async function api(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API}${path}`, { ...init, headers, cache: 'no-store', credentials: 'include' });
}
