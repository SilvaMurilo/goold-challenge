import { cookies } from 'next/headers';

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function getSession() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);

  try {
    const res = await fetch(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const user = await res.json();
    return { token, user };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}