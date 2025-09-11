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
        <svg width="50" height="50" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.3794 20.5035C24.1544 17.2661 29.4565 11.7724 32.5004 4.90515C30.5366 2.84499 27.9837 1.37344 25.2344 0.490515L23.7616 0C23.6634 0.196206 23.5652 0.490527 23.5652 0.686733C21.2087 7.35774 16.3975 12.7534 9.91704 15.7946C5.40037 17.9529 2.06196 21.877 0.490942 26.5859L0 28.0575C0.196377 28.1556 0.490947 28.2537 0.687324 28.2537C2.5529 28.9404 4.41848 29.8233 6.18588 30.9025C8.64059 26.4878 12.5681 22.7599 17.3794 20.5035Z" fill="#201B21"/>
          <path d="M45.8124 20.8955C42.1794 26.3893 37.1718 30.8039 30.9859 33.747C25.9783 36.1015 22.149 40.5162 20.3816 45.8137L19.8906 47.4815C21.7562 49.1492 24.0145 50.4246 26.4692 51.2094L27.9421 51.6999C28.0403 51.5037 28.1384 51.2094 28.1384 51.0132C30.495 44.3422 35.3062 38.9465 41.7867 35.9053C46.3033 33.747 49.7399 29.8229 51.2127 25.114L51.7037 23.6424C49.6417 23.0538 47.678 22.0727 45.8124 20.8955Z" fill="#201B21"/>
          <path d="M15.9986 42.3794C18.4533 36.4933 22.9699 31.6862 28.7631 28.9393C34.0652 26.3886 38.4837 22.4645 41.5276 17.6575C39.2692 15.4992 37.4036 13.0466 36.029 10.1035C32.396 16.7745 26.7011 22.1702 19.7297 25.5057C15.704 27.3697 12.4638 30.6071 10.5 34.5312C12.6601 36.5914 14.4275 39.142 15.8022 41.987C15.8022 41.987 15.9004 42.1832 15.9986 42.3794Z" fill="#201B21"/>
        </svg>
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

        <Link href="/perfil"
          aria-current={active('/perfil') ? 'page' : undefined}
          style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
            borderRadius:10, textDecoration:'none',
            background: active('/perfil') ? '#111827' : 'transparent',
            color: active('/perfil') ? '#fff' : '#111827',
            fontWeight: active('/perfil') ? 700 : 500,
          }}>
          <span aria-hidden style={{ width:18, height:18, borderRadius:999, border:`1px solid ${active('/perfil') ? '#fff' : '#111827'}` }} />
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
