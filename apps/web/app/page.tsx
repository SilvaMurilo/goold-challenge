'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


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
        <svg width="24" height="24" viewBox="0 0 52 52" fill="none" aria-hidden>
          <path d="M17.3794 20.5035C24.1544 17.2661 29.4565 11.7724 32.5004 4.90515C30.5366 2.84499 27.9837 1.37344 25.2344 0.490515L23.7616 0C23.6634 0.196206 23.5652 0.490527 23.5652 0.686733C21.2087 7.35774 16.3975 12.7534 9.91704 15.7946C5.40037 17.9529 2.06196 21.877 0.490942 26.5859L0 28.0575C0.196377 28.1556 0.490947 28.2537 0.687324 28.2537C2.5529 28.9404 4.41848 29.8233 6.18588 30.9025C8.64059 26.4878 12.5681 22.7599 17.3794 20.5035Z" fill="#201B21"/>
          <path d="M45.8124 20.8955C42.1794 26.3893 37.1718 30.8039 30.9859 33.747C25.9783 36.1015 22.149 40.5162 20.3816 45.8137L19.8906 47.4815C21.7562 49.1492 24.0145 50.4246 26.4692 51.2094L27.9421 51.6999C28.0403 51.5037 28.1384 51.2094 28.1384 51.0132C30.495 44.3422 35.3062 38.9465 41.7867 35.9053C46.3033 33.747 49.7399 29.8229 51.2127 25.114L51.7037 23.6424C49.6417 23.0538 47.678 22.0727 45.8124 20.8955Z" fill="#201B21"/>
          <path d="M15.9986 42.3794C18.4533 36.4933 22.9699 31.6862 28.7631 28.9393C34.0652 26.3886 38.4837 22.4645 41.5276 17.6575C39.2692 15.4992 37.4036 13.0466 36.029 10.1035C32.396 16.7745 26.7011 22.1702 19.7297 25.5057C15.704 27.3697 12.4638 30.6071 10.5 34.5312C12.6601 36.5914 14.4275 39.142 15.8022 41.987C15.8022 41.987 15.9004 42.1832 15.9986 42.3794Z" fill="#201B21"/>
        </svg>
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

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('redirect') || '/agendamentos';
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);

  // >>> ADIÇÕES <<<
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  // <<< ADIÇÕES <<<

  const canSubmit = email.trim() !== '' && pwd.trim() !== '';

  // >>> ADIÇÕES: handleSubmit que chama /auth/login <<<
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccess(false);

      const API_URL = process.env.NEXT_PUBLIC_API_URL; // ex.: http://localhost:4000
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // caso você opte por cookie httpOnly no backend
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: pwd,
        }),
      });

      // Trata respostas 4xx/5xx com mensagem do backend
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Falha no login');
      }

      // Se o backend retorna { token }, salva localmente.
      // (Se você setar cookie httpOnly no backend, esse passo vira opcional.)
      const data = await res.json().catch(() => ({}));
      if (data?.token && data?.role === 'CUSTOMER') {
        localStorage.setItem('auth_token', data.token);
      }
      else throw new Error(data?.error || 'Credenciais inválidas');
      setSuccess(true);

      // router.replace(next); // ou router.push(next)
      // depois de salvar cookie/token (seu backend define o cookie httpOnly)
const m = document.cookie.match(/(?:^|; )redirectTo=([^;]+)/);
const redirectTo = m ? decodeURIComponent(m[1]) : '/agendamentos';
// limpa
document.cookie = 'redirectTo=; Path=/; Max-Age=0; SameSite=Lax';
// navega
router.replace(redirectTo);

    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro inesperado');
    } finally {
      setSubmitting(false);
    }
  }
  // <<< ADIÇÕES <<<

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
          {/* trocado para onSubmit={handleSubmit} */}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
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
                disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 28, height: 28,
                    display: 'grid', placeItems: 'center',
                    border: 'none',
                    background: 'transparent',
                    cursor: submitting ? 'not-allowed' : 'pointer',
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

            {/* mensagens de erro/sucesso */}
            {errorMsg && (
              <div style={{ marginTop: 4, fontSize: 12, color: '#b91c1c' }}>
                {errorMsg}
              </div>
            )}
            {success && (
              <div style={{ marginTop: 4, fontSize: 12, color: '#065f46' }}>
                Login realizado!
              </div>
            )}

            {/* botão acessar */}
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              style={{
                marginTop: 8,
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                background: (!canSubmit || submitting) ? '#d1d5db' : '#111827',
                color: (!canSubmit || submitting) ? '#6b7280' : '#fff',
                fontWeight: 600,
                cursor: (!canSubmit || submitting) ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Acessando…' : 'Acessar conta'}
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


export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Carregando…</div>}>
      <LoginPageInner />
    </Suspense>
  );
}