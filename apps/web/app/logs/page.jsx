'use client';
import { useMemo, useState } from 'react';

/* ---------- ícones simples ---------- */
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
  logo: (
    <div
      aria-label="Logo"
      style={{
        width: 24, height: 24, background: '#111827',
        clipPath:'polygon(50% 0,80% 20%,50% 40%,80% 60%,50% 80%,20% 60%,50% 40%,20% 20%)'
      }}
    />
  ),
  dot: (active=false)=>(
    <svg width="12" height="12" viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="5" fill={active ? '#111827' : '#d1d5db'} />
    </svg>
  ),
};

/* ---------- badge ---------- */
const Tag = ({ children }) => (
  <span style={{
    display:'inline-block', padding:'4px 10px', borderRadius:999,
    fontSize:12, fontWeight:600, lineHeight:1,
    border:'1px solid #e5e7eb', background:'#f9fafb', color:'#374151'
  }}>
    {children}
  </span>
);

/* ---------- página ---------- */
export default function LogsPage() {
  const [q, setQ] = useState('');
  const [moduleSel, setModuleSel] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);

  // dados mock para UI
  const all = useMemo(() => ([
    { id:1, tipo:'Criação de agendamento', modulo:'Agendamento', data:'04/06/2025 às 22:00' },
    { id:2, tipo:'Login', modulo:'Minha Conta', data:'04/06/2025 às 21:40' },
    { id:3, tipo:'Logout', modulo:'Minha Conta', data:'04/06/2025 às 21:28' },
    { id:4, tipo:'Cancelamento de agendamento', modulo:'Agendamento', data:'04/06/2025 às 21:21' },
    { id:5, tipo:'Atualização de e-mail', modulo:'Minha Conta', data:'04/06/2025 às 21:00' },
    { id:6, tipo:'Cancelamento de agendamento', modulo:'Agendamento', data:'04/06/2025 às 20:41' },
    { id:7, tipo:'Criação de agendamento', modulo:'Agendamento', data:'04/06/2025 às 20:33' },
  ]), []);

  const filtered = all.filter(r =>
    (!q || (r.tipo + ' ' + r.modulo).toLowerCase().includes(q.toLowerCase())) &&
    (!moduleSel || r.modulo === moduleSel) &&
    (!date || r.data.startsWith(date.split('-').reverse().join('/')))
  );

  // paginação fake (3 por página para visual)
  const pageSize = 3;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div style={{ minHeight:'100dvh', background:'#f5f3f0', display:'grid', gridTemplateColumns:'260px 1fr' }}>
      {/* sidebar */}
      <aside style={{ background:'#eee9e2', borderRight:'1px solid #e5e7eb', display:'grid', gridTemplateRows:'auto 1fr auto' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', gap:10 }}>
          {Icon.logo}
        </div>
        <nav style={{ padding:'16px 12px', display:'grid', gap:6 }}>
          <a style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
            color:'#111827', textDecoration:'none', fontSize:14
          }}>
            <span style={{ width:18, height:18, borderRadius:4, border:'1px solid #111827' }} />
            Agendamentos
          </a>
          <a style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
            background:'#111827', color:'#fff', textDecoration:'none', fontSize:14, fontWeight:600
          }}>
            <span style={{ width:18, height:18, borderRadius:4, border:'1px solid #fff' }} />
            Logs
          </a>
          <a style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
            color:'#111827', textDecoration:'none', fontSize:14
          }}>
            <span style={{ width:18, height:18, borderRadius:999, border:'1px solid #111827' }} />
            Minha Conta
          </a>
        </nav>
        <div style={{ padding:'12px 16px', borderTop:'1px solid #e5e7eb', fontSize:13 }}>
          <div style={{ fontWeight:600 }}>Camila Mendes</div>
          <div style={{ color:'#6b7280' }}>Cliente</div>
        </div>
      </aside>

      {/* conteúdo */}
      <section style={{ padding:'24px' }}>
        {/* header */}
        <header style={{ borderBottom:'1px solid #e5e7eb', paddingBottom:16, marginBottom:16 }}>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#111827' }}>Logs</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Acompanhe todos as suas Logs</p>
        </header>

        {/* filtros */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 200px 160px',
          gap:12, alignItems:'center', marginBottom:16
        }}>
          <div style={{ position:'relative' }}>
            <input
              placeholder="Filtre por tipo de atividade ou Módulo"
              value={q} onChange={e=>setQ(e.target.value)}
              style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}
            />
            <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.search}</div>
          </div>

          <select value={moduleSel} onChange={e=>setModuleSel(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}>
            <option value="">Selecione</option>
            <option>Agendamento</option>
            <option>Minha Conta</option>
          </select>

          <div style={{ position:'relative' }}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                   style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}/>
            <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.calendar}</div>
          </div>
        </div>

        {/* tabela */}
        <div style={{ border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', padding:16 }}>
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 220px 220px', gap:12,
            fontSize:12, color:'#6b7280', padding:'0 12px 10px', borderBottom:'1px solid #e5e7eb'
          }}>
            <div>Tipo de atividade</div>
            <div>Módulo</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              Data e horário {Icon.sort}
            </div>
          </div>

          <div>
            {slice.map((r) => (
              <div key={r.id} style={{
                display:'grid', gridTemplateColumns:'1fr 220px 220px', gap:12,
                alignItems:'center', padding:'12px', borderBottom:'1px solid #f3f4f6'
              }}>
                <div><Tag>{r.tipo}</Tag></div>
                <div><Tag>{r.modulo}</Tag></div>
                <div><Tag>{r.data}</Tag></div>
              </div>
            ))}

            {/* espaço inferior como no mock */}
            <div style={{ height:180 }} />
          </div>

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
      </section>
    </div>
  );
}
