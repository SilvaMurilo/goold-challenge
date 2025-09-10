import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED = ['/agendamentos', '/logs', '/conta'];

async function verifyJWT(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
  return payload as { id?: number | string; role?: string; exp?: number };
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuth = pathname === '/login';
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  const token = req.cookies.get('token')?.value || '';

  if (isAuth && token) {
    try {
      await verifyJWT(token);
      return NextResponse.redirect(new URL('/agendamentos', req.url));
    } catch {
      const res = NextResponse.next();
      res.cookies.set('token', '', { path: '/', maxAge: 0 });
      return res;
    }
  }

  if (needsAuth) {
    if (!token) {
      const res = NextResponse.redirect(new URL('/', req.url));
      res.cookies.set('redirectTo', pathname + (search || ''), {
        path: '/',
        maxAge: 300,
        sameSite: 'lax',
      });
      return res;
    }
    try {
      await verifyJWT(token);
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL('/', req.url));
      res.cookies.set('token', '', { path: '/', maxAge: 0 });
      res.cookies.set('redirectTo', pathname + (search || ''), {
        path: '/', maxAge: 300, sameSite: 'lax'
      });
      return res;
    }
  }
  
  if (isAuth && req.nextUrl.searchParams.has('redirect')) {
    const res = NextResponse.redirect(new URL('/', req.url));
    res.cookies.set('redirectTo', req.nextUrl.searchParams.get('redirect') || '/', {
      path: '/', maxAge: 300, sameSite: 'lax'
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/agendamentos/:path*', '/logs/:path*', '/conta/:path*'],
};
