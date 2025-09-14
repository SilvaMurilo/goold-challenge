'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../../../lib/api';

/* ---------- ícones ---------- */
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
  sort: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <path d="M3 6h18M6 12h12M10 18h8" />
    </svg>
  ),
  dot: (active=false)=>(
    <svg width="12" height="12" viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="5" fill={active ? '#111827' : '#d1d5db'} />
    </svg>
  ),
};

/* ---------- badge ---------- */
const Tag = ({ children }: any) => (
  <span style={{
    display:'inline-block', padding:'4px 10px', borderRadius:999,
    fontSize:12, fontWeight:600, lineHeight:1,
    border:'1px solid #e5e7eb', background:'#f9fafb', color:'#374151'
  }}>
    {children}
  </span>
);

/* ---------- helpers ---------- */
const ptBRdatetime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2,'0');
  const mi = String(d.getMinutes()).padStart(2,'0');
  return `${dd}/${mm}/${yyyy} às ${hh}:${mi}`;
};

const actionLabel: Record<string,string> = {
  CREATE:'Criação de agendamento',
  UPDATE:'Atualização de e-mail',
  DELETE:'Exclusão',
  VIEW:'Visualização',
  LOGIN:'Login',
  LOGOUT:'Logout',
};
const entityLabel = (e?: string|null) => {
  if (!e) return '—';
  if (e === 'booking' || e === 'appointment') return 'Agendamento';
  if (e === 'profile' || e === 'account') return 'Minha Conta';
  if (e === 'auth') return 'Autenticação';
  return e.charAt(0).toUpperCase() + e.slice(1);
};

/* ---------- tipos ---------- */
type LogRow = {
  id: number;
  action: 'CREATE'|'UPDATE'|'DELETE'|'VIEW'|'LOGIN'|'LOGOUT';
  entity: string | null;
  entity_id: string | null;
  description: string | null;
  created_at: string;
  user?: { id:number; name:string; email:string };
};
type ApiResp = {
  data: LogRow[];
  pagination: { page:number; limit:number; total:number; hasNext:boolean; hasPrev:boolean; };
};

export default function AdminLogsPage() {
  const [q, setQ] = useState('');
  const [entity, setEntity] = useState('');       // filtro "Módulo"
  const [date, setDate] = useState('');           // yyyy-mm-dd
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  // opções de módulo (entity) dinamicamente
  const entityOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach(r => r.entity && set.add(r.entity));
    return Array.from(set);
  }, [rows]);

  async function fetchLogs() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      // o backend busca por description; client-side abaixo cobre nome/labels
      if (entity) params.set('entity', entity);
      if (date) {
        params.set('date_from', `${date}T00:00:00`);
        params.set('date_to', `${date}T23:59:59`);
      }
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('includeUser', '1');

      const res = await api(`/logs?${params.toString()}`);
      if (!res.ok) {
        let msg = `Falha ao listar logs (HTTP ${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error + ` (HTTP ${res.status})`;
        } catch {}
        throw new Error(msg);
      }
      const data: ApiResp = await res.json();
      setRows(Array.isArray(data.data) ? data.data : []);
      setTotal(data.pagination?.total || 0);
    } catch (e:any) {
      setError(e.message || 'Erro ao buscar logs');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, date, page, limit]);

  // filtro client-side por cliente/tipo/módulo (para cobrir a pesquisa do mock)
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const ql = q.trim().toLowerCase();
    return rows.filter(r => {
      const cliente = (r.user?.name || r.user?.email || 'Cliente').toLowerCase();
      const tipo = (actionLabel[r.action] || r.action).toLowerCase();
      const modulo = entityLabel(r.entity).toLowerCase();
      return (
        cliente.includes(ql) ||
        tipo.includes(ql) ||
        modulo.includes(ql)
      );
    });
  }, [rows, q]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div style={{ background:'#f5f3f0', display:'grid' }}>
      <header style={{ borderBottom:'1px solid #e5e7eb', paddingBottom:16, marginBottom:16 }}>
        <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#111827' }}>Logs</h1>
        <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Acompanhe todos as Logs de clientes</p>
      </header>

      {/* filtros */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 200px 160px',
        gap:12, alignItems:'center', marginBottom:16
      }}>
        <div style={{ position:'relative' }}>
          <input
            placeholder="Filtre por cliente, tipo de atividade ou Módulo"
            value={q} onChange={e=>{ setPage(1); setQ(e.target.value); }}
            style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}
          />
          <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.search}</div>
        </div>

        <select
          value={entity}
          onChange={e => { setPage(1); setEntity(e.target.value); }}
          style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}
        >
          <option value="">Selecione</option>
          {entityOptions.map(opt => (
            <option key={opt} value={opt}>{entityLabel(opt)}</option>
          ))}
        </select>

        <div style={{ position:'relative' }}>
          <input
            type="date"
            value={date}
            onChange={e=>{ setPage(1); setDate(e.target.value); }}
            style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}
          />
          <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.calendar}</div>
        </div>
      </div>

      {/* tabela */}
      <div style={{ border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', padding:16, minHeight:340 }}>
        {/* cabeçalho com 4 colunas */}
        <div style={{
          display:'grid', gridTemplateColumns:'240px 1fr 220px 220px', gap:12,
          fontSize:12, color:'#6b7280', padding:'0 12px 10px', borderBottom:'1px solid #e5e7eb'
        }}>
          <div>Cliente</div>
          <div>Tipo de atividade</div>
          <div>Módulo</div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            Data e horário {Icon.sort}
          </div>
        </div>

        {loading ? (
          <div style={{ height:260, display:'grid', placeItems:'center', color:'#6b7280' }}>Carregando…</div>
        ) : error ? (
          <div style={{ height:260, display:'grid', placeItems:'center', color:'#b91c1c' }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ height:260, display:'grid', placeItems:'center', color:'#6b7280' }}>
            Nenhum log encontrado
          </div>
        ) : (
          <div>
            {filtered.map((r, idx) => {
              const cliente = r.user?.name || r.user?.email || 'Cliente';
              return (
                <div key={r.id} style={{
                  display:'grid', gridTemplateColumns:'240px 1fr 220px 220px', gap:12,
                  alignItems:'center', padding:'12px', borderBottom:'1px solid #f3f4f6',
                  background: idx%2 ? '#f9fafb' : '#fff'
                }}>
                  {/* Cliente */}
                  <div>
                    <div style={{ fontSize:13, color:'#111827', fontWeight:600 }}>{cliente}</div>
                    <div style={{ fontSize:12, color:'#6b7280' }}>Cliente</div>
                  </div>

                  {/* Tipo de atividade */}
                  <div><Tag>{actionLabel[r.action] || r.action}</Tag></div>

                  {/* Módulo */}
                  <div><Tag>{entityLabel(r.entity)}</Tag></div>

                  {/* Data e horário */}
                  <div><Tag>{ptBRdatetime(r.created_at)}</Tag></div>
                </div>
              );
            })}

            <div style={{ height:100 }} />
          </div>
        )}

        {/* paginação */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', paddingTop:8 }}>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={()=>setPage(i+1)}
              style={{ border:'none', background:'transparent', cursor:'pointer' }}
              aria-label={`Página ${i+1}`}
            >
              {Icon.dot(page === i+1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
