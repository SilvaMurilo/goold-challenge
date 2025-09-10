'use client';
import { useMemo, useState } from 'react';

/** ---------- Helpers de UI ---------- */
const Badge = ({ tone = 'neutral', children }) => {
  const styles = {
    base: {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1,
      border: '1px solid',
    },
    tones: {
      neutral: { color: '#374151', borderColor: '#d1d5db', background: '#f9fafb' },
      success: { color: '#065f46', borderColor: '#a7f3d0', background: '#ecfdf5' },
      danger:  { color: '#8b0000', borderColor: '#fecaca', background: '#fff1f2' },
      pending: { color: '#374151', borderColor: '#e5e7eb', background: '#f3f4f6' },
      dark:    { color: '#111827', borderColor: '#111827', background: '#111827', text: '#fff' },
    },
  };
  const toneStyle = styles.tones[tone] || styles.tones.neutral;
  return (
    <span style={{ ...styles.base, ...toneStyle, color: toneStyle.text ?? toneStyle.color }}>
      {children}
    </span>
  );
};

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
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  dot: (active=false)=>(
    <svg width="12" height="12" viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="5" fill={active ? '#111827' : '#d1d5db'} />
    </svg>
  ),
  logo: (
    <div
      aria-label="Logo"
      style={{
        width: 24, height: 24, background: '#111827',
        clipPath: 'polygon(50% 0, 80% 20%, 50% 40%, 80% 60%, 50% 80%, 20% 60%, 50% 40%, 20% 20%)'
      }}
    />
  ),
};

/** ---------- Modal Novo Agendamento (UI-only) ---------- */
function ModalNovo({ open, onClose }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');
  const canConfirm = date && time && room;

  if (!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(17,24,39,0.5)',
      display:'grid', placeItems:'center', zIndex:50
    }}>
      <div style={{
        width:'100%', maxWidth:420, background:'#fff', border:'1px solid #e5e7eb',
        borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,0.2)', padding:16, position:'relative'
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#111827' }}>Novo Agendamento</h3>
          <button onClick={onClose} aria-label="Fechar" style={{
            border:'none', background:'transparent', cursor:'pointer', padding:6, borderRadius:8
          }}>{Icon.close}</button>
        </div>

        <div style={{ display:'grid', gap:10 }}>
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'#374151' }}>Selecione uma <b>data</b> <span style={{ color:'#6b7280' }}>(Obrigatório)</span></span>
            <div style={{ position:'relative' }}>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                     style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #d1d5db', borderRadius:8 }}/>
              <div style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)' }}>{Icon.calendar}</div>
            </div>
          </label>

          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'#374151' }}>Selecione um <b>horário</b> <span style={{ color:'#6b7280' }}>(Obrigatório)</span></span>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)}
                   style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8 }}/>
          </label>

          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'#374151' }}>Selecione uma <b>Sala</b> <span style={{ color:'#6b7280' }}>(Obrigatório)</span></span>
            <select value={room} onChange={e=>setRoom(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff' }}>
              <option value="">Selecione um Sala</option>
              <option>Sala 01</option>
              <option>Sala 02</option>
              <option>Sala 03</option>
            </select>
          </label>
        </div>

        <button disabled={!canConfirm} onClick={onClose} style={{
          marginTop:16, width:'100%', padding:'12px', borderRadius:8, border:'none',
          background: canConfirm ? '#111827' : '#d1d5db',
          color: canConfirm ? '#fff' : '#6b7280', fontWeight:700, cursor: canConfirm?'pointer':'not-allowed'
        }}>
          Confirmar Agendamento
        </button>
      </div>
    </div>
  );
}

/** ---------- Página ---------- */
export default function AgendamentosPage() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [room, setRoom] = useState('');
  const [date, setDate] = useState('');
  const [hasData, setHasData] = useState(true); // troque para false para ver o estado "vazio"

  // dados de exemplo apenas para UI
  const rows = useMemo(() => (hasData ? [
    { id: 1, at: '22/01/2025 às 16:00', nome: 'Camila Mendes', subt: 'Cliente', sala: 'Sala 012', status: 'Em análise' },
    { id: 2, at: '21/01/2025 às 16:00', nome: 'Camila Mendes', subt: 'Cliente', sala: 'Sala 012', status: 'Em análise' },
    { id: 3, at: '20/01/2025 às 16:00', nome: 'Camila Mendes', subt: 'Cliente', sala: 'Sala 012', status: 'Agendado' },
    { id: 4, at: '19/01/2025 às 16:00', nome: 'Camila Mendes', subt: 'Cliente', sala: 'Sala 012', status: 'Agendado' },
    { id: 5, at: '19/01/2025 às 16:00', nome: 'Camila Mendes', subt: 'Cliente', sala: 'Sala 012', status: 'Cancelado' },
    { id: 6, at: '18/01/2025 às 16:00', nome: 'Camila Mendes', subt: 'Cliente', sala: 'Sala 012', status: 'Cancelado' },
    { id: 7, at: '18/01/2025 às 16:00', nome: 'Camila Mendes', subt: 'Cliente', sala: 'Sala 012', status: 'Agendado' },
    { id: 8, at: '12/01/2025 às 16:00', nome: 'Camila Mendes', subt: 'Cliente', sala: 'Sala 012', status: 'Agendado' },
  ] : []), [hasData]);

  const filt = rows.filter(r =>
    (!q || r.nome.toLowerCase().includes(q.toLowerCase())) &&
    (!room || r.sala === room) &&
    (!date || r.at.startsWith(date.split('-').reverse().join('/')))
  );

  const statusTone = (s) =>
    s === 'Agendado' ? 'success' :
    s === 'Cancelado' ? 'danger' :
    'pending';

  return (
    <div style={{ minHeight:'100dvh', background:'#f5f3f0', display:'grid', gridTemplateColumns:'260px 1fr' }}>
      {/* Sidebar */}
      <aside style={{ background:'#eee9e2', borderRight:'1px solid #e5e7eb', display:'grid', gridTemplateRows:'auto 1fr auto' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', gap:10 }}>
          {Icon.logo}
        </div>
        <nav style={{ padding:'16px 12px', display:'grid', gap:6 }}>
          <a style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
            background:'#111827', color:'#fff', textDecoration:'none', fontSize:14, fontWeight:600
          }}>
            <span style={{ width:18, height:18, borderRadius:4, border:'1px solid #fff' }} />
            Agendamentos
          </a>
          <a style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
            color:'#111827', textDecoration:'none', fontSize:14
          }}>
            <span style={{ width:18, height:18, borderRadius:4, border:'1px solid #111827' }} />
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

        {/* usuário (rodapé) */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid #e5e7eb', fontSize:13 }}>
          <div style={{ fontWeight:600 }}>Camila Mendes</div>
          <div style={{ color:'#6b7280' }}>Cliente</div>
        </div>
      </aside>

      {/* Conteúdo */}
      <section style={{ padding:'24px' }}>
        {/* Header */}
        <header style={{ borderBottom:'1px solid #e5e7eb', paddingBottom:16, marginBottom:16 }}>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#111827' }}>Agendamento</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Acompanhe todos os seus agendamentos de forma simples</p>
        </header>

        {/* Filtro + CTA */}
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 180px 160px 180px',
          gap:12, alignItems:'center', marginBottom:16
        }}>
          {/* busca */}
          <div style={{ position:'relative' }}>
            <input
              placeholder="Filtre por nome do paciente, CPF/CNPJ ou E-mail"
              value={q} onChange={e=>setQ(e.target.value)}
              style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}
            />
            <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.search}</div>
          </div>
          {/* sala */}
          <select value={room} onChange={e=>setRoom(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}>
            <option value="">Selecione</option>
            <option>Sala 012</option>
            <option>Sala 021</option>
          </select>
          {/* data */}
          <div style={{ position:'relative' }}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                   style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}/>
            <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.calendar}</div>
          </div>
          {/* CTA */}
          <div style={{ textAlign:'right' }}>
            <button onClick={()=>setOpen(true)} style={{
              width:'100%', padding:'10px 12px', borderRadius:8, border:'none',
              background:'#111827', color:'#fff', fontWeight:700, cursor:'pointer'
            }}>
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Área principal */}
        <div style={{
          border:'1px solid #e5e7eb', borderRadius:8, background:'#fff',
          padding:16, minHeight:340
        }}>
          {filt.length === 0 ? (
            // Empty state
            <div style={{ height:300, display:'grid', placeItems:'center', color:'#6b7280' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{
                  width:120, height:120, borderRadius:'50%', background:'#f3f4f6',
                  margin:'0 auto 12px', display:'grid', placeItems:'center', color:'#9ca3af', fontSize:12
                }}>
                  📊
                </div>
                <div style={{ fontWeight:600 }}>Nada por aqui ainda…</div>
              </div>
            </div>
          ) : (
            // Tabela
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
                <thead>
                  <tr style={{ textAlign:'left', fontSize:12, color:'#6b7280' }}>
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Data agendamento | <b>H</b></th>
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Nome</th>
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Sala de agendamento</th>
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Status transação</th>
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filt.map((r, idx) => (
                    <tr key={r.id} style={{
                      background: r.status === 'Agendado' ? (idx%2? '#f0fdf4' : '#ecfdf5')
                               : r.status === 'Cancelado' ? (idx%2? '#fff1f2' : '#ffe4e6')
                               : (idx%2? '#f9fafb' : '#fff')
                    }}>
                      <td style={{ padding:'12px' }}>
                        <div style={{ fontSize:13, color:'#111827' }}>{r.at}</div>
                      </td>
                      <td style={{ padding:'12px' }}>
                        <div style={{ fontSize:13, color:'#111827' }}>{r.nome}</div>
                        <div style={{ fontSize:12, color:'#6b7280' }}>{r.subt}</div>
                      </td>
                      <td style={{ padding:'12px' }}>
                        <Badge tone="dark">{r.sala}</Badge>
                      </td>
                      <td style={{ padding:'12px' }}>
                        <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                      </td>
                      <td style={{ padding:'12px' }}>
                        <button title="Cancelar" style={{
                          width:28, height:28, borderRadius:'50%', border:'1px solid #e5e7eb',
                          background:'#fff', cursor:'pointer'
                        }}>
                          {Icon.close}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginação fake (UI) */}
              <div style={{ display:'flex', gap:8, justifyContent:'center', padding:12 }}>
                {Array.from({ length:4 }).map((_,i)=> <span key={i}>{Icon.dot(i===1)}</span>)}
              </div>
            </div>
          )}
        </div>
      </section>

      <ModalNovo open={open} onClose={()=>setOpen(false)} />
    </div>
  );
}
