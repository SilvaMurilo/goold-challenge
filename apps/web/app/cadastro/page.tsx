'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import 'typeface-montserrat';


function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        background: '#f3f4f6',
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
        <svg width="24" height="24" viewBox="0 0 52 52" fill="none" aria-hidden>
          <path d="M17.3794 20.5035C24.1544 17.2661 29.4565 11.7724 32.5004 4.90515C30.5366 2.84499 27.9837 1.37344 25.2344 0.490515L23.7616 0C23.6634 0.196206 23.5652 0.490527 23.5652 0.686733C21.2087 7.35774 16.3975 12.7534 9.91704 15.7946C5.40037 17.9529 2.06196 21.877 0.490942 26.5859L0 28.0575C0.196377 28.1556 0.490947 28.2537 0.687324 28.2537C2.5529 28.9404 4.41848 29.8233 6.18588 30.9025C8.64059 26.4878 12.5681 22.7599 17.3794 20.5035Z" fill="#201B21"/>
          <path d="M45.8124 20.8955C42.1794 26.3893 37.1718 30.8039 30.9859 33.747C25.9783 36.1015 22.149 40.5162 20.3816 45.8137L19.8906 47.4815C21.7562 49.1492 24.0145 50.4246 26.4692 51.2094L27.9421 51.6999C28.0403 51.5037 28.1384 51.2094 28.1384 51.0132C30.495 44.3422 35.3062 38.9465 41.7867 35.9053C46.3033 33.747 49.7399 29.8229 51.2127 25.114L51.7037 23.6424C49.6417 23.0538 47.678 22.0727 45.8124 20.8955Z" fill="#201B21"/>
          <path d="M15.9986 42.3794C18.4533 36.4933 22.9699 31.6862 28.7631 28.9393C34.0652 26.3886 38.4837 22.4645 41.5276 17.6575C39.2692 15.4992 37.4036 13.0466 36.029 10.1035C32.396 16.7745 26.7011 22.1702 19.7297 25.5057C15.704 27.3697 12.4638 30.6071 10.5 34.5312C12.6601 36.5914 14.4275 39.142 15.8022 41.987C15.8022 41.987 15.9004 42.1832 15.9986 42.3794Z" fill="#201B21"/>
        </svg>
        <a
          href="/"
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
          Login
        </a>
      </div>
    </header>
  );
}

export default function CadastroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('redirect') || '/';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [cep, setCep] = useState('');

  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [stateUf, setStateUf] = useState('');

  const [loadingCep, setLoadingCep] = useState(false);

  // >>> ADIÇÕES <<<
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // <<< ADIÇÕES <<<

  const requiredOk = useMemo(() => {
    const emailOk = /.+@.+\..+/.test(email.trim());
    const pwdOk = password.trim().length >= 6;
    const cepOk = cep.replace(/\D/g, '').length === 8;
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      emailOk &&
      pwdOk &&
      cepOk
    );
  }, [firstName, lastName, email, password, cep]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requiredOk || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const payload = {
      name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,      
      postal_code: cep.replace(/\D/g,''),
      street,
      address_number: number,
      address_line2: complement,
      neighborhood:district,
      city,
      state: stateUf
    };

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Falha ao registrar');
      }

      setSuccess(true);
      router.replace(next); // ou router.push(next)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro inesperado');
    } finally {
      setSubmitting(false);
    }
  }

  // Busca ViaCEP ao completar 8 dígitos
  useEffect(() => {
    const onlyDigits = cep.replace(/\D/g, '');
    if (onlyDigits.length !== 8) return;

    let aborted = false;
    async function fetchCep() {
      try {
        setLoadingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`);
        const data = await res.json();
        if (aborted) return;
        if (data?.erro) return;
        setStreet(data.logradouro || '');
        setDistrict(data.bairro || '');
        setCity(data.localidade || '');
        setStateUf(data.uf || '');
      } catch (_) {
        // silêncio: não bloquear o fluxo
      } finally {
        if (!aborted) setLoadingCep(false);
      }
    }
    fetchCep();
    return () => {
      aborted = true;
    };
  }, [cep]);

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#f5f3f0',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <Header />

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
        <h1
          style={{
            margin: '24px 0',
            fontSize: 20,
            fontWeight: 700,
            color: '#111827',
            textAlign: 'center',
          }}
        >
          Cadastre-se
        </h1>

        <div
          style={{
            width: '100%',
            maxWidth: 520,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            fontFamily: 'Montserrat'
          }}
        >
          {/* trocado para handleSubmit */}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
            {/* Nome e sobrenome */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>
                  Nome <span style={{ color: '#6b7280' }}>(Obrigatório)</span>
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ex.: João"
                  required
                  autoComplete="given-name"
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
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>
                  Sobrenome <span style={{ color: '#6b7280' }}>(Obrigatório)</span>
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="ex.: Lima"
                  required
                  autoComplete="family-name"
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
            </div>

            {/* Email */}
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

            {/* Senha */}
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>
                Senha de acesso <span style={{ color: '#6b7280' }}>(Obrigatório)</span>
              </span>
              <div style={{ position: 'relative', display: 'grid' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
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
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 28,
                    height: 28,
                    display: 'grid',
                    placeItems: 'center',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    {showPwd ? (
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

            {/* CEP */}
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>
                CEP <span style={{ color: '#6b7280' }}>(Obrigatório)</span>
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={cep}
                onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="Insira seu CEP"
                required
                autoComplete="postal-code"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  background: '#fff',
                }}
              />
              {loadingCep && (
                <span style={{ fontSize: 12, color: '#6b7280' }}>Carregando endereço…</span>
              )}
            </label>

            {/* Endereço */}
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>Endereço</span>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rua Coronel linha de Castro"
                autoComplete="address-line1"
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Número</span>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="43"
                  autoComplete="address-line2"
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
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Complemento</span>
                <input
                  type="text"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Sala 302"
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
            </div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>Bairro</span>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Jardim Amália Franco"
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Cidade</span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
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
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Estado</span>
                <input
                  type="text"
                  value={stateUf}
                  onChange={(e) => setStateUf(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SP"
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
            </div>

            {/* mensagens de erro/sucesso */}
            {errorMsg && (
              <div style={{ fontSize: 12, color: '#b91c1c' }}>{errorMsg}</div>
            )}
            {success && (
              <div style={{ fontSize: 12, color: '#065f46' }}>
                Conta criada! Você já pode fazer login.
              </div>
            )}

            <button
              type="submit"
              disabled={!requiredOk || submitting}
              style={{
                marginTop: 8,
                padding: '12px 12px',
                borderRadius: 8,
                border: 'none',
                background: (!requiredOk || submitting) ? '#d1d5db' : '#111827',
                color: (!requiredOk || submitting) ? '#6b7280' : '#fff',
                fontWeight: 700,
                cursor: (!requiredOk || submitting) ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Cadastrando…' : 'Cadastrar-se'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
