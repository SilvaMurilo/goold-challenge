'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../../lib/api';

const Icon = {
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.83 20.83 0 0 1 5.06-5.94" />
      <path d="M1 1l22 22" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a21.2 21.2 0 0 1-3.58 4.49" />
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
    </svg>
  ),
};

type ProfileUI = {
  first_name: string;   // <- mapeado de data.name
  last_name: string;    // <- mapeado de data.last_name
  email: string;
  password: string;
  cep?: string;         // <- data.postal_code
  address?: string;     // <- data.street
  number?: string;      // <- data.address_number
  complement?: string;  // <- data.address_line2
  district?: string;    // <- data.neighborhood
  city?: string;        // <- data.city
  state?: string;       // <- data.state
};

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [p, setP] = useState<ProfileUI>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
  });

  // snapshot do que veio do backend (para diff)
  const origRef = useRef<ProfileUI | null>(null);

  // Mapeamento UI -> API
  const mapToAPI = (ui: ProfileUI) => ({
    name: ui.first_name,
    last_name: ui.last_name,
    email: ui.email,
    // password só entra se preenchida
    ...(ui.password?.trim() ? { password: ui.password } : {}),
    postal_code: ui.cep ?? '',
    street: ui.address ?? '',
    address_number: ui.number ?? '',
    address_line2: ui.complement ?? '',
    neighborhood: ui.district ?? '',
    city: ui.city ?? '',
    state: ui.state ?? '',
  });

  // Gera patch contendo apenas chaves alteradas
  function buildPatch(origUI: ProfileUI, currUI: ProfileUI) {
    const apiOrig = mapToAPI(origUI);
    const apiCurr = mapToAPI(currUI);
    const patch: Record<string, any> = {};
    for (const key of Object.keys(apiCurr)) {
      // Considera diferente também quando muda para '' (limpeza)
      if (apiCurr[key] !== (apiOrig as any)[key]) {
        patch[key] = apiCurr[key];
      }
    }
    return patch;
  }

  // Carrega perfil (GET /users -> { data: {...} })
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api('/users/me', { method: 'GET' });
        if (!res.ok) {
          let msg = `Falha ao carregar perfil (HTTP ${res.status})`;
          try {
            const d = await res.json();
            if (d?.error) msg = d.error + ` (HTTP ${res.status})`;
          } catch {}
          throw new Error(msg);
        }
        const payload = await res.json();
        const data = payload?.data || payload;

        const ui: ProfileUI = {
          first_name: data.name ?? '',
          last_name:  data.last_name ?? '',
          email:      data.email ?? '',
          password:   '',
          cep:         data.postal_code ?? '',
          address:     data.street ?? '',
          number:      data.address_number ? String(data.address_number) : '',
          complement:  data.address_line2 ?? '',
          district:    data.neighborhood ?? '',
          city:        data.city ?? '',
          state:       data.state ?? '',
        };
        setP(ui);
        origRef.current = ui; // snapshot original
      } catch (e: any) {
        setError(e.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function tryCEPFill(raw: string) {
    const clean = (raw || '').replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      if (!res.ok) return;
      const d = await res.json();
      if (d?.erro) return;
      setP(prev => ({
        ...prev,
        address:  d.logradouro ?? prev.address,
        district: d.bairro ?? prev.district,
        city:     d.localidade ?? prev.city,
        state:    d.uf ?? prev.state,
      }));
    } catch {}
  }
  

  function set<K extends keyof ProfileUI>(k: K, v: ProfileUI[K]) {
    setP((prev) => ({ ...prev, [k]: v }));
  }

  const canSave = useMemo(() => {
    return (
      !saving &&
      p.first_name.trim() &&
      p.last_name.trim() &&
      p.email.trim()
    );
  }, [p, saving]);

  async function handleSave() {
    if (!canSave || !origRef.current) return;
    setSaving(true);
    try {
      const patch = buildPatch(origRef.current, p);

      // se não mudou nada, evita request
      const changedKeys = Object.keys(patch);
      if (changedKeys.length === 0) {
        alert('Nada para atualizar.');
        setSaving(false);
        return;
      }

      const res = await api('/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || `Falha ao salvar (HTTP ${res.status})`);
      }

      // Atualiza snapshot com o salvo (limpa senha local)
      const savedPayload = await res.json().catch(() => ({}));
      const saved = savedPayload?.data || null;

      const newUI: ProfileUI = saved ? {
        first_name: saved.name ?? p.first_name,
        last_name:  saved.last_name ?? p.last_name,
        email:      saved.email ?? p.email,
        password:   '',
        cep:         saved.postal_code ?? p.cep,
        address:     saved.street ?? p.address,
        number:      saved.address_number ? String(saved.address_number) : (p.number ?? ''),
        complement:  saved.address_line2 ?? p.complement,
        district:    saved.neighborhood ?? p.district,
        city:        saved.city ?? p.city,
        state:       saved.state ?? p.state,
      } : { ...p, password: '' };

      setP(newUI);
      origRef.current = newUI;
      alert('Perfil atualizado!');
    } catch (e: any) {
      alert(e.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }
  return (
    <section style={{ padding: 0 }}>
      <header style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 16, marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Minha conta</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
          Ajuste informações da sua conta de forma simples
        </p>
      </header>

      <div
        style={{
          maxWidth: 520,
          margin: '0 auto',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          background: '#fff',
          padding: 16,
        }}
      >
        {loading ? (
          <div style={{ height: 260, display: 'grid', placeItems: 'center', color: '#6b7280' }}>Carregando…</div>
        ) : error ? (
          <div style={{ height: 260, display: 'grid', placeItems: 'center', color: '#b91c1c' }}>{error}</div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            style={{ display: 'grid', gap: 12 }}
          >
            {/* Nome e Sobrenome */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>
                  Nome <b>(Obrigatório)</b>
                </span>
                <input
                  value={p.first_name}
                  onChange={(e) => set('first_name', e.target.value)}
                  placeholder="Seu nome"
                  style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>
                  Sobrenome <b>(Obrigatório)</b>
                </span>
                <input                
                  value={p.last_name}
                  onChange={(e) => set('last_name', e.target.value)}
                  placeholder="Seu sobrenome"
                  style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                />
              </label>
            </div>
            {/* Email */}
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>
                E-mail <b>(Obrigatório)</b>
              </span>
              <input
                type="email"
                value={p.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="voce@exemplo.com"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                disabled
              />
            </label>

            {/* Senha (opcional) */}
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>
                Senha de acesso <span style={{ color: '#6b7280' }}>(Opcional)</span>
              </span>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={p.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="********"
                  style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  title={showPass ? 'Ocultar' : 'Mostrar'}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 8,
                  }}
                >
                  {showPass ? Icon.eyeOff : Icon.eye}
                </button>
              </div>
            </label>

            {/* CEP */}
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>
                CEP <b>(Obrigatório)</b>
              </span>
              <input
                value={p.cep || ''}
                onChange={(e) => set('cep', e.target.value)}
                onBlur={(e) => tryCEPFill(e.target.value)}
                placeholder="00000-000"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
              />
            </label>

            {/* Endereço */}
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>Endereço</span>
              <input
                value={p.address || ''}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Rua / Avenida"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Número</span>
                <input
                  value={p.number || ''}
                  onChange={(e) => set('number', e.target.value)}
                  placeholder="nº"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Complemento</span>
                <input
                  value={p.complement || ''}
                  onChange={(e) => set('complement', e.target.value)}
                  placeholder="Apto / Sala"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>Bairro</span>
              <input
                value={p.district || ''}
                onChange={(e) => set('district', e.target.value)}
                placeholder="Bairro"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Cidade</span>
                <input
                  value={p.city || ''}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Cidade"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>Estado</span>
                <input
                  value={p.state || ''}
                  onChange={(e) => set('state', e.target.value)}
                  placeholder="Estado/UF"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={!canSave}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                background: canSave ? '#111827' : '#d1d5db',
                color: canSave ? '#fff' : '#6b7280',
                fontWeight: 700,
                cursor: canSave ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
