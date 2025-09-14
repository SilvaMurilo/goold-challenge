'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../../lib/api';

const UI = {
  bg: '#eee9e2',
  surface: '#f6f2ec',
  border: '#e5e7eb',
  text: '#111827',
  textMut: '#6b7280',
  activeBg: '#111827',
  activeFg: '#ffffff',
};

export default function Sidebar({ initialUser }: { initialUser?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/');

  // menu do usuário
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!openUserMenu) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (userBtnRef.current?.contains(t)) return;
      setOpenUserMenu(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openUserMenu]);

  async function handleLogout() {
    try {
      await api('/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    } finally {
      if (typeof window !== 'undefined') window.location.assign('/admin');
    }
  } 

  return (
    <aside
      style={{
        width: 260,
        background: UI.bg,
        borderRight: `1px solid ${UI.border}`,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        minHeight: '100dvh',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: `1px solid ${UI.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          aria-hidden
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 40,
            height: 40,
            borderRadius: 12,
            background: UI.surface,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.05)',
          }}
        >
          <LogoMark />
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 700, color: UI.text }}>Agendamento</div>
          <div style={{ fontSize: 12, color: UI.textMut }}></div>
        </div>
      </div>

      {/* Nav */}
      <nav
        aria-label="Seções"
        style={{
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          alignItems: 'stretch',
        }}
      >
        <NavItem href="/admin/agendamentos" active={isActive('/admin/agendamentos')} label="Agendamentos" square />
        <NavItem href="/admin/clientes" active={isActive('/admin/clientes')} label="Clientes" square />
        <NavItem href="/admin/logs" active={isActive('/admin/logs')} label="Logs" square />

        <div
          aria-hidden
          style={{
            margin: '6px 8px',
            height: 1,
            background: 'rgba(0,0,0,.06)',
            borderRadius: 1,
          }}
        />

        <NavItem href="/admin/perfil" active={isActive('/perfil')} label="Minha Conta" round />
      </nav>

      {/* User / Menu */}
      <div style={{ position: 'relative' }}>
        <button
          ref={userBtnRef}
          type="button"
          title="Conta"
          onClick={() => setOpenUserMenu(v => !v)}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '12px 14px',
            borderTop: `1px solid ${UI.border}`,
            background: 'transparent',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: UI.text }}>
              {initialUser?.name || initialUser?.last_name ? `${initialUser?.name ?? ''} ${initialUser?.last_name ?? ''}` : '—'}
            </div>
            <div style={{ color: UI.textMut, fontSize: 12 }}>
              {initialUser?.role  === 'CUSTOMER' ? 'Cliente' : 'ADMIN'}
            </div>
          </div>
          <Chevron />
        </button>

        {openUserMenu && (
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              bottom: 56,
              background: '#fff',
              border: `1px solid ${UI.border}`,
              borderRadius: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,.12)',
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            <MenuItem onClick={() => { setOpenUserMenu(false); router.push('/perfil'); }}>
              Minha Conta
            </MenuItem>
            <div style={{ height: 1, background: UI.border, opacity: .6 }} />
            <MenuItem danger onClick={handleLogout}>
              Sair
            </MenuItem>
          </div>
        )}
      </div>
    </aside>
  );
}

/* --- components --- */

function NavItem({
  href,
  label,
  active,
  square,
  round,
}: {
  href: string;
  label: string;
  active?: boolean;
  square?: boolean;
  round?: boolean;
}) {
  const itemHeight = 42;
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex',
        height: itemHeight,
        minHeight: itemHeight,
        maxHeight: itemHeight,
        boxSizing: 'border-box',
        alignItems: 'center',
        gap: 10,
        padding: '0 12px',
        borderRadius: 10,
        textDecoration: 'none',
        lineHeight: 1,
        background: active ? UI.activeBg : 'transparent',
        color: active ? UI.activeFg : UI.text,
        fontWeight: active ? 700 : 500,
        outline: 'none',
        transition: 'background .18s ease, color .18s ease',
      }}
      onFocus={(e) =>
        (e.currentTarget.style.boxShadow = active
          ? '0 0 0 3px rgba(17,24,39,.35)'
          : '0 0 0 3px rgba(17,24,39,.15)')
      }
      onBlur={(e) => (e.currentTarget.style.boxShadow = '')}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'rgba(0,0,0,.05)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <Bullet square={square} round={round} active={!!active} />
      <span style={{ fontSize: 14 }}>{label}</span>
    </Link>
  );
}

function MenuItem({ children, onClick, danger }: { children: any; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: danger ? '#b91c1c' : UI.text,
        fontWeight: 600,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,.04)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  );
}

function Bullet({
  square,
  round,
  active,
}: {
  square?: boolean;
  round?: boolean;
  active?: boolean;
}) {
  return (
    <span
      aria-hidden
      style={{
        width: 16,
        height: 16,
        borderRadius: round ? 999 : 5,
        border: `1.5px solid ${active ? UI.activeFg : UI.text}`,
        background: active ? 'rgba(255,255,255,.22)' : 'transparent',
        flex: '0 0 16px',
      }}
    />
  );
}

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 10l4 4 4-4"
        stroke={UI.textMut}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 52 52" fill="none" aria-hidden>
      <path d="M17.3794 20.5035C24.1544 17.2661 29.4565 11.7724 32.5004 4.90515C30.5366 2.84499 27.9837 1.37344 25.2344 0.490515L23.7616 0C23.6634 0.196206 23.5652 0.490527 23.5652 0.686733C21.2087 7.35774 16.3975 12.7534 9.91704 15.7946C5.40037 17.9529 2.06196 21.877 0.490942 26.5859L0 28.0575C0.196377 28.1556 0.490947 28.2537 0.687324 28.2537C2.5529 28.9404 4.41848 29.8233 6.18588 30.9025C8.64059 26.4878 12.5681 22.7599 17.3794 20.5035Z" fill="#201B21"/>
      <path d="M45.8124 20.8955C42.1794 26.3893 37.1718 30.8039 30.9859 33.747C25.9783 36.1015 22.149 40.5162 20.3816 45.8137L19.8906 47.4815C21.7562 49.1492 24.0145 50.4246 26.4692 51.2094L27.9421 51.6999C28.0403 51.5037 28.1384 51.2094 28.1384 51.0132C30.495 44.3422 35.3062 38.9465 41.7867 35.9053C46.3033 33.747 49.7399 29.8229 51.2127 25.114L51.7037 23.6424C49.6417 23.0538 47.678 22.0727 45.8124 20.8955Z" fill="#201B21"/>
      <path d="M15.9986 42.3794C18.4533 36.4933 22.9699 31.6862 28.7631 28.9393C34.0652 26.3886 38.4837 22.4645 41.5276 17.6575C39.2692 15.4992 37.4036 13.0466 36.029 10.1035C32.396 16.7745 26.7011 22.1702 19.7297 25.5057C15.704 27.3697 12.4638 30.6071 10.5 34.5312C12.6601 36.5914 14.4275 39.142 15.8022 41.987C15.8022 41.987 15.9004 42.1832 15.9986 42.3794Z" fill="#201B21"/>
    </svg>
  );
}
