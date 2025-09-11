'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';

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

const apiStatusToBadge = (s: string) =>
  s === 'CONFIRMED' ? 'success' :
  s === 'CANCELLED' ? 'danger'  :
  s === 'REJECTED'  ? 'danger'  :
  'pending';

const Badge = ({ tone = 'neutral', children }: any) => {
  const styles: any = {
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
  return <span style={{ ...styles.base, ...toneStyle, color: toneStyle.text ?? toneStyle.color }}>{children}</span>;
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
};

function ModalNovo({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void; }) {
  const [date, setDate] = useState(''); // yyyy-mm-dd
  const [time, setTime] = useState(''); // HH:mm
  const [room, setRoom] = useState(''); // room_id
  const [submitting, setSubmitting] = useState(false);
  const [rooms, setRooms] = useState<{id:number; name:string}[]>([]);
  const canConfirm = date && time && room && !submitting;

  useEffect(() => {
    if (!open) return;
    // tenta buscar salas (se não existir endpoint, caímos no fallback)
    (async () => {

        const res = await api('/rooms', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setRooms(Array.isArray(data) ? data : data?.data || []);
        } 
    })();
  }, [open]);

  async function handleCreate() {
    if (!canConfirm) return;
    setSubmitting(true);
    try {
      // monta start/end simplificados (1h de duração)
      const startISO = new Date(`${date}T${time}:00`).toISOString();
      const endDate = new Date(startISO);
      endDate.setHours(endDate.getHours() + 1);

      const res = await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          room_id: Number(room),
          start_at: startISO,
          end_at: endDate.toISOString(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err?.error || 'Falha ao criar agendamento');
      }
      onClose();
      onCreated();
    } catch (e:any) {
      alert(e.message || 'Erro ao criar agendamento');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.5)', display:'grid', placeItems:'center', zIndex:50 }}>
      <div style={{ width:'100%', maxWidth:420, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,0.2)', padding:16, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#111827' }}>Novo Agendamento</h3>
          <button onClick={onClose} aria-label="Fechar" style={{ border:'none', background:'transparent', cursor:'pointer', padding:6, borderRadius:8 }}>{Icon.close}</button>
        </div>

        <div style={{ display:'grid', gap:10 }}>
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'#374151' }}>Selecione uma <b>data</b> <span style={{ color:'#6b7280' }}>(Obrigatório)</span></span>
            <div style={{ position:'relative' }}>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #d1d5db', borderRadius:8 }}/>
              <div style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)' }}>{Icon.calendar}</div>
            </div>
          </label>

          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'#374151' }}>Selecione um <b>horário</b> <span style={{ color:'#6b7280' }}>(Obrigatório)</span></span>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8 }}/>
          </label>

          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'#374151' }}>Selecione uma <b>Sala</b> <span style={{ color:'#6b7280' }}>(Obrigatório)</span></span>
            <select value={room} onChange={e=>setRoom(e.target.value)} style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff' }}>
              <option value="">Selecione uma Sala</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
        </div>

        <button disabled={!canConfirm} onClick={handleCreate} style={{
          marginTop:16, width:'100%', padding:'12px', borderRadius:8, border:'none',
          background: canConfirm ? '#111827' : '#d1d5db',
          color: canConfirm ? '#fff' : '#6b7280', fontWeight:700, cursor: canConfirm?'pointer':'not-allowed'
        }}>
          {submitting ? 'Salvando…' : 'Confirmar Agendamento'}
        </button>
      </div>
    </div>
  );
}

export default function AgendamentosPage() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState<{id:number; name:string}[]>([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [rowsAPI, setRowsAPI] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!open) return;
    // tenta buscar salas (se não existir endpoint, caímos no fallback)
    (async () => {

        const res = await api('/rooms', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setRooms(Array.isArray(data) ? data : data?.data || []);
        } 
    })();
  }, [open]);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError(null);
      const res = await api(`/bookings`);
      if (!res.ok) {
        let msg = `Falha ao listar agendamentos (HTTP ${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) msg = data.error + ` (HTTP ${res.status})`;
      } catch {}
      throw new Error(msg);
      }
      const data = await res.json();
      const list: any[] = Array.isArray(data) ? data : data?.data || [];

      const normalized = list.map((b: any) => ({
        id: b.id,
        at: ptBRdatetime(b.start_at),
        nome: b.user?.name || 'Você',
        subt: b.user ? (b.user.email || 'Cliente') : 'Cliente',
        sala: b.room?.name || `Sala ${b.room_id}`,
        roomId: b.room_id,                // <--- adicione isso
        status: b.status === 'PENDING' ? 'Em análise'
              : b.status === 'CONFIRMED' ? 'Agendado'
              : b.status === 'REJECTED'  ? 'Recusado'
              : b.status === 'CANCELLED' ? 'Cancelado'
              : b.status,
        _rawStatus: b.status,
      }));
      
      setRowsAPI(normalized);
    } catch (e:any) {
      setError(e.message || 'Erro ao buscar dados');
      setRowsAPI([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const filt = useMemo(() => {
  const base = rowsAPI;
  return base.filter((r) =>
    (!q || r.nome.toLowerCase().includes(q.toLowerCase())) &&
    (!room || r.roomId === Number(room)) &&             // <--- use roomId
    (!date || r.at.startsWith(date.split('-').reverse().join('/')))
  );
}, [rowsAPI, q, room, date]);


  const statusTone = (s: string) => apiStatusToBadge(
    s === 'Agendado' ? 'CONFIRMED'
      : s === 'Cancelado' ? 'CANCELLED'
      : s === 'Recusado' ? 'REJECTED'
      : 'PENDING'
  );

  async function handleCancel(id: number) {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    try {
      const res = await api(`/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data?.error || 'Falha ao cancelar');
      }
      await fetchBookings();
    } catch (e:any) {
      alert(e.message || 'Erro ao cancelar');
    }
  }
  async function fetchRooms() {
    const res = await api('/rooms', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : data?.data || []);
    }
  }
  
  useEffect(() => { fetchRooms(); }, []);  
  return (
    <>
      <section style={{ padding:'0' }}>
        <header style={{ borderBottom:'1px solid #e5e7eb', paddingBottom:16, marginBottom:16 }}>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#111827' }}>Agendamento</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Acompanhe todos os seus agendamentos de forma simples</p>
        </header>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 180px 160px 180px', gap:12, alignItems:'center', marginBottom:16 }}>
          <div style={{ position:'relative' }}>
            <input
              placeholder="Filtre por nome do paciente, CPF/CNPJ ou E-mail"
              value={q} onChange={e=>setQ(e.target.value)}
              style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}
            />
            <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.search}</div>
          </div>
          
          <select value={room} onChange={e=>setRoom(e.target.value)} style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}>
            <option value="">Selecione uma Sala</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div style={{ position:'relative' }}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}/>
            <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.calendar}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <button onClick={()=>setOpen(true)} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'none', background:'#111827', color:'#fff', fontWeight:700, cursor:'pointer' }}>
              Novo Agendamento
            </button>
          </div>
        </div>

        <div style={{ border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', padding:16, minHeight:340 }}>
          {loading ? (
            <div style={{ height:300, display:'grid', placeItems:'center', color:'#6b7280' }}>Carregando…</div>
          ) : error ? (
            <div style={{ height:300, display:'grid', placeItems:'center', color:'#b91c1c' }}>{error}</div>
          ) : filt.length === 0 ? (
            <div style={{ height:300, display:'grid', placeItems:'center', color:'#6b7280' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:120, height:120, borderRadius:'50%', background:'#f3f4f6', margin:'0 auto 12px', display:'grid', placeItems:'center', color:'#9ca3af', fontSize:12 }}>📊</div>
                <div style={{ fontWeight:600 }}>Nada por aqui ainda…</div>
              </div>
            </div>
          ) : (
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
                        <Badge tone={apiStatusToBadge(r._rawStatus)}>{r.status}</Badge>
                      </td>
                      <td style={{ padding:'12px' }}>
                        {(() => {
                          const canCancel = r._rawStatus === 'PENDING' || r._rawStatus === 'CONFIRMED';
                          return (
                            <button
                              title={canCancel ? 'Cancelar' : 'Ação indisponível'}
                              onClick={canCancel ? () => handleCancel(r.id) : undefined}
                              disabled={!canCancel}
                              aria-disabled={!canCancel}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                border: '1px solid #e5e7eb',
                                background: '#fff',
                                cursor: canCancel ? 'pointer' : 'not-allowed',
                                opacity: canCancel ? 1 : 0.5,
                              }}
                            >
                              {Icon.close}
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display:'flex', gap:8, justifyContent:'center', padding:12 }}>
                {Array.from({ length:4 }).map((_,i)=> <span key={i}>{Icon.dot(i===1)}</span>)}
              </div>
            </div>
          )}
        </div>
      </section>

      <ModalNovo open={open} onClose={()=>setOpen(false)} onCreated={fetchBookings} />
    </>
  );
}
