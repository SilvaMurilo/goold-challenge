const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || '';

function joinURL(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export async function api(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const t = token ?? (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
  if (t) headers.set('Authorization', `Bearer ${t}`);

  const url = joinURL(RAW_BASE, path);

  return fetch(url, {
    ...init,
    headers,
    credentials: 'omit',
    cache: 'no-store',
  });
}
