'use client';
import { useState } from 'react';

function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        background: '#f3f4f6',          // barra clara
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo simples (placeholder) */}
        <div
          aria-label="Logo"
          style={{
            width: 24, height: 24, background: '#111827',
            clipPath: 'polygon(50% 0, 80% 20%, 50% 40%, 80% 60%, 50% 80%, 20% 60%, 50% 40%, 20% 20%)',
          }}
        />
        <a
          href="/cadastro"
          style={{
            fontSize: 12,
            fontWeight: 600,
            background: '#111827',
            color: '#fff',
            borderRadius: 10,
            padding: '8px 12px',
            textDecoration: 'none',
          }}
        >
          Cadastre-se
        </a>
      </div>
    </header>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);

  const canSubmit = email.trim() !== '' && pwd.trim() !== '';

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#f5f3f0', // bege bem claro como no mock
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <Header />

      {/* container */}
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          width: '100%',
          padding: '40px 16px',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {/* título */}
        <h1
          style={{
            margin: '24px 0',
            fontSize: 20,
            fontWeight: 700,
            color: '#111827',
            textAlign: 'center',
          }}
        >
          Entre na sua conta
        </h1>

        {/* card */}
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'grid', gap: 10 }}>
            {/* email */}
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>
                E-mail <span style={{ color: '#6b7280' }}>(Obrigatório)</span>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Insira seu e-mail"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  background: '#fff',
                }}
              />
            </label>

            {/* senha + toggle */}
            <label style={{ display: 'grid', gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>
                Senha de acesso <span style={{ color: '#6b7280' }}>(Obrigatório)</span>
              </span>
              <div
                style={{
                  position: 'relative',
                  display: 'grid',
                }}
              >
                <input
                  type={show ? 'text' : 'password'}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    outline: 'none',
                    background: '#fff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 28, height: 28,
                    display: 'grid', placeItems: 'center',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {/* ícone olho simples */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    {show ? (
                      <>
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="3" y1="3" x2="21" y2="21" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </label>

            {/* botão acessar */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                marginTop: 8,
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                background: canSubmit ? '#111827' : '#d1d5db',
                color: canSubmit ? '#fff' : '#6b7280',
                fontWeight: 600,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              Acessar conta
            </button>

            {/* rodapé do card */}
            <div
              style={{
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                Ainda não tem um cadastro?
              </span>
              <a
                href="/cadastro"
                style={{
                  fontSize: 12,
                  color: '#111827',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Cadastre-se
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
