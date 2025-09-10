// apps/web/app/(app)/sidebar.tsx  (Client Component)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ initialUser }: { initialUser?: any }) {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <aside style={{ background:'#eee9e2', borderRight:'1px solid #e5e7eb', display:'grid', gridTemplateRows:'auto 1fr auto' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', gap:10 }}>
        <div aria-label="Logo" style={{ width:24, height:24, background:'#111827', borderRadius:6 }} />
      </div>

      <nav style={{ padding:'16px 12px', display:'grid', gap:6 }}>
        <Link href="/agendamentos"
          aria-current={active('/agendamentos') ? 'page' : undefined}
          style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            borderRadius:10, textDecoration:'none',
            background: active('/agendamentos') ? '#111827' : 'transparent',
            color: active('/agendamentos') ? '#fff' : '#111827',
            fontWeight: active('/agendamentos') ? 700 : 500,
          }}>
          <span aria-hidden style={{ width:18, height:18, borderRadius:4, border:`1px solid ${active('/agendamentos') ? '#fff' : '#111827'}` }} />
          Agendamentos
        </Link>

        <Link href="/logs"
          aria-current={active('/logs') ? 'page' : undefined}
          style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            borderRadius:10, textDecoration:'none',
            background: active('/logs') ? '#111827' : 'transparent',
            color: active('/logs') ? '#fff' : '#111827',
            fontWeight: active('/logs') ? 700 : 500,
          }}>
          <span aria-hidden style={{ width:18, height:18, borderRadius:4, border:`1px solid ${active('/logs') ? '#fff' : '#111827'}` }} />
          Logs
        </Link>

        <Link href="/conta"
          aria-current={active('/conta') ? 'page' : undefined}
          style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            borderRadius:10, textDecoration:'none',
            background: active('/conta') ? '#111827' : 'transparent',
            color: active('/conta') ? '#fff' : '#111827',
            fontWeight: active('/conta') ? 700 : 500,
          }}>
          <span aria-hidden style={{ width:18, height:18, borderRadius:999, border:`1px solid ${active('/conta') ? '#fff' : '#111827'}` }} />
          Minha Conta
        </Link>
      </nav>

      <div style={{ padding:'12px 16px', borderTop:'1px solid #e5e7eb', fontSize:13 }}>
        <div style={{ fontWeight:600 }}>{initialUser?.name ?? '—'}</div>
        <div style={{ color:'#6b7280' }}>{initialUser?.role ?? ''}</div>
      </div>
    </aside>
  );
}
