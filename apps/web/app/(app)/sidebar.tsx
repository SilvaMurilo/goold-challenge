'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const item = (href: string, label: string, activeBg = '#111827') => {
    const active = pathname === href || pathname?.startsWith(href + '/');
    return (
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderRadius: 10,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: active ? 600 : 500,
          background: active ? activeBg : 'transparent',
          color: active ? '#fff' : '#111827',
          outline: 'none',
        }}
      >
        <span
          aria-hidden
          style={{
            width: 18, height: 18, borderRadius: 4,
            border: `1px solid ${active ? '#fff' : '#111827'}`,
            background: active ? '#fff2' : 'transparent',
          }}
        />
        {label}
      </Link>
    );
  };

  return (
    <aside
      style={{
        background: '#eee9e2',
        borderRight: '1px solid #e5e7eb',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div aria-label="Logo" style={{ width: 24, height: 24, background: '#111827', borderRadius: 6 }} />
      </div>

      <nav style={{ padding: '16px 12px', display: 'grid', gap: 6 }}>
        {item('/agendamentos', 'Agendamentos')}
        {item('/logs', 'Logs')}
        {item('/conta', 'Minha Conta')}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', fontSize: 13 }}>
        <div style={{ fontWeight: 600 }}>Camila Mendes</div>
        <div style={{ color: '#6b7280' }}>Cliente</div>
      </div>
    </aside>
  );
}
