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
        <div
          aria-label="Logo"
          style={{
            width: 24,
            height: 24,
            background: '#111827',
            clipPath:
              'polygon(50% 0, 80% 20%, 50% 40%, 80% 60%, 50% 80%, 20% 60%, 50% 40%, 20% 20%)',
          }}
        />
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
  const next = searchParams.get('redirect') || '/A';
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
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
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
        console.log(data)
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
