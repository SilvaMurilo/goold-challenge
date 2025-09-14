// apps/web/app/admin/clientes/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '../../../../lib/api';

/* ---------- helpers ---------- */
const ptBRdatetime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} às ${hh}:${mi}`;
};

const addressLine = (u: any) => {
  const bits = [
    u.street ? `R. ${u.street}` : '',
    u.address_number ? `nº ${u.address_number}` : '',
    u.address_line2,
    u.neighborhood,
    u.city,
    u.state ? `- ${u.state}` : '',
  ]
    .filter(Boolean)
    .join(', ')
    .replace(', -', ' -');
  return bits || '—';
};

/* ---------- UI bits ---------- */
const Icon = {
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  dot: (active=false)=>(
    <svg width="12" height="12" viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="5" fill={active ? '#111827' : '#d1d5db'} />
    </svg>
  ),
};

const Tag = ({ children, tone='neutral' }: { children: any; tone?: 'neutral'|'dark' }) => {
  const tones: any = {
    neutral: { color:'#374151', background:'#f9fafb', border:'#e5e7eb' },
    dark:    { color:'#fff',    background:'#111827', border:'#111827' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display:'inline-block', padding:'4px 10px', borderRadius:999,
      fontSize:12, fontWeight:700, lineHeight:1,
      color:t.color, background:t.background, border:`1px solid ${t.border}`,
    }}>
      {children}
    </span>
  );
};

/* ---------- page ---------- */
type Row = {
  id: number;
  createdAt: string;
  nome: string;
  subt: string;
  address: string;
  active: boolean;
  raw: any;
};

export default function AdminClientesPage() {
  const [q, setQ] = useState('');
  const [date, setDate] = useState(''); // filtro client-side por data (opcional)
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  // paginação vinda da API
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  async function fetchUsers(p = page) {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('pageSize', String(pageSize));
      if (q) params.set('q', q);

      const res = await api(`/users?${params.toString()}`);
      if (!res.ok) {
        let msg = `Falha ao listar clientes (HTTP ${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error + ` (HTTP ${res.status})`;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();

      // data no formato: { page, pageSize, total, data: [...] }
      const list = (data?.data || []) as any[];
      const map: Row[] = list.map(u => ({
        id: u.id,
        createdAt: ptBRdatetime(u.createdAt || u.created_at || u.updatedAt || u.updated_at || ''),
        nome: `${u.name ?? ''} ${u.last_name ?? ''}`.trim() || (u.email ?? 'Cliente'),
        subt: 'Cliente',
        address: addressLine(u),
        active: (typeof u.is_active !== 'undefined') ? !!u.is_active
               : (typeof u.active !== 'undefined') ? !!u.active
               : true,
        raw: u,
      }));

      setRows(map);
      setTotal(Number(data?.total || list.length));
      setPage(Number(data?.page || p));
    } catch (e:any) {
      setError(e.message || 'Erro ao buscar clientes');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(1); /* eslint-disable-next-line */ }, [q]);
  useEffect(() => { fetchUsers(page); /* eslint-disable-next-line */ }, [page]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const filtered = useMemo(() => {
    if (!date) return rows;
    const d = date.split('-').reverse().join('/');
    return rows.filter(r => r.createdAt.startsWith(d));
  }, [rows, date]);

  /* ---- toggle status ---- */
  async function toggleUser(u: Row) {
    const next = !u.active;
    // otimista
    setRows(prev => prev.map(x => x.id === u.id ? { ...x, active: next } : x));
    try {
      const body: any = { user_id: u.id, is_active: next };
      const res = await api('/users', { method:'PATCH', body: JSON.stringify(body) });
      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        throw new Error(j?.error || 'Falha ao atualizar status');
      }
    } catch (e:any) {
      // desfaz
      setRows(prev => prev.map(x => x.id === u.id ? { ...x, active: !next } : x));
      alert(e.message || 'Erro ao atualizar status');
    }
  }

  return (
    <section style={{ padding:'0' }}>
      <header style={{ borderBottom:'1px solid #e5e7eb', paddingBottom:16, marginBottom:16 }}>
        <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#111827' }}>Clientes</h1>
        <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Overview de todos os clientes</p>
      </header>

      {/* filtros */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 180px 160px', gap:12, alignItems:'center', marginBottom:16 }}>
        <div style={{ position:'relative' }}>
          <input
            placeholder="Filtre por nome"
            value={q} onChange={e=>{ setPage(1); setQ(e.target.value); }}
            style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}
          />
          <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.search}</div>
        </div>

        <select disabled style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', color:'#9ca3af' }}>
          <option>Selecione</option>
        </select>

        <div style={{ position:'relative' }}>
          <input type="date" value={date} onChange={e=>{setPage(1); setDate(e.target.value);}} style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}/>
          <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.calendar}</div>
        </div>
      </div>

      {/* tabela */}
      <div style={{ border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', padding:16, minHeight:340 }}>
        {loading ? (
          <div style={{ height:300, display:'grid', placeItems:'center', color:'#6b7280' }}>Carregando…</div>
        ) : error ? (
          <div style={{ height:300, display:'grid', placeItems:'center', color:'#b91c1c' }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ height:300, display:'grid', placeItems:'center', color:'#6b7280' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ width:120, height:120, borderRadius:'50%', background:'#f3f4f6', margin:'0 auto 12px', display:'grid', placeItems:'center', color:'#9ca3af', fontSize:12 }}>👥</div>
              <div style={{ fontWeight:600 }}>Nenhum cliente encontrado…</div>
            </div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
              <thead>
                <tr style={{ textAlign:'left', fontSize:12, color:'#6b7280' }}>
                  <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Data de cadastro ↑</th>
                  <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Nome</th>
                  <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Endereço</th>
                  <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Permissões</th>
                  <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr key={r.id} style={{ background: idx%2? '#f9fafb' : '#fff' }}>
                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:13, color:'#111827' }}>{r.createdAt}</div>
                    </td>

                    <td style={{ padding:'12px' }}>
                      <div style={{ fontSize:13, color:'#111827', fontWeight:600 }}>{r.nome}</div>
                      <div style={{ fontSize:12, color:'#6b7280' }}>{r.subt}</div>
                    </td>

                    <td style={{ padding:'12px', color:'#111827', fontSize:13 }}>
                      {r.address}
                    </td>

                    <td style={{ padding:'12px' }}>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <Tag tone="dark">Agendamentos</Tag>
                        <Tag>Logs</Tag>
                      </div>
                    </td>

                    <td style={{ padding:'12px' }}>
                      <label style={{ display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                        <span style={{ fontSize:12, color:'#6b7280' }}>{r.active ? 'Ativo' : 'Inativo'}</span>
                        <input
                          type="checkbox"
                          checked={r.active}
                          onChange={() => toggleUser(r)}
                          style={{ appearance:'none', width:34, height:18, borderRadius:20, position:'relative', border:'1px solid #e5e7eb', background: r.active ? '#111827' : '#e5e7eb' }}
                          aria-label={r.active ? 'Desativar' : 'Ativar'}
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* paginação */}
            <div style={{ display:'flex', gap:8, justifyContent:'center', padding:12 }}>
              {Array.from({ length: pages }).map((_,i)=> (
                <button key={i} onClick={()=>setPage(i+1)} aria-label={`Página ${i+1}`}
                        style={{ border:'none', background:'transparent', cursor:'pointer' }}>
                  {Icon.dot(page===i+1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
