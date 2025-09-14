'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '../../../lib/api';

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

const apiStatusToBadge = (s: string) =>
  s === 'CONFIRMED' ? 'success' :
  s === 'CANCELLED' ? 'danger'  :
  s === 'REJECTED'  ? 'danger'  :
  'pending';

/* ---------- UI bits ---------- */
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
  sort: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
      <path d="M3 6h18M6 12h12M10 18h8" />
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
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
};

/* ---------- Modal de Ajustes (salas & janelas) ---------- */
function ModalAjustes({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rooms, setRooms] = useState<{id:number; name:string; start_hour?:string; end_hour?:string; slot_minutes?:number}[]>([]);
  const [roomIdx, setRoomIdx] = useState<number>(0);
  const [name, setName] = useState('');
  const [range, setRange] = useState('08:00 - 18:00');
  const [slot, setSlot] = useState('30');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await api('/rooms', { method: 'GET' });
        if (!res.ok) throw new Error('Falha ao listar salas');
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        setRooms(list);
        const first = list?.[0];
        setRoomIdx(0);
        setName(first?.name || '');
        const rh = (h?:string,e?:string)=> (h && e) ? `${h} - ${e}` : '08:00 - 18:00';
        setRange(rh(first?.start_hour, first?.end_hour));
        setSlot(String(first?.slot_minutes ?? 30));
      } catch (e) {
        // silencioso
      }
    })();
  }, [open]);

  useEffect(() => {
    const r = rooms[roomIdx];
    if (!r) return;
    setName(r.name || '');
    const rh = (h?:string,e?:string)=> (h && e) ? `${h} - ${e}` : '08:00 - 18:00';
    setRange(rh(r.start_hour, r.end_hour));
    setSlot(String(r.slot_minutes ?? 30));
  }, [roomIdx]); // eslint-disable-line

  if (!open) return null;

  const [startH, endH] = range.split('-').map(s=>s.trim());

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        start_hour: startH || '08:00',
        end_hour: endH || '18:00',
        slot_minutes: Number(slot || '30'),
      };
      const selected = rooms[roomIdx];
      let res;
      if (selected?.id) {
        res = await api(`/rooms/${selected.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        res = await api(`/rooms`, { method: 'POST', body: JSON.stringify(body) });
      }
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err?.error || 'Falha ao salvar');
      }
      onClose();
      onSaved();
    } catch (e:any) {
      alert(e?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.5)', display:'grid', placeItems:'center', zIndex:50 }}>
      <div style={{ width:'100%', maxWidth:460, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,0.2)', padding:16, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#111827' }}>Ajustes de agendamento</h3>
          <button onClick={onClose} aria-label="Fechar" style={{ border:'none', background:'transparent', cursor:'pointer', padding:6, borderRadius:8 }}>{Icon.close}</button>
        </div>

        <div style={{ display:'grid', gap:10 }}>
          {/* selecionar sala existente */}
          {rooms.length > 0 && (
            <label style={{ display:'grid', gap:6 }}>
              <span style={{ fontSize:12, color:'#374151' }}>Selecione a sala</span>
              <select value={roomIdx} onChange={e=>setRoomIdx(Number(e.target.value))}
                style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff' }}>
                {rooms.map((r,idx)=><option key={r.id} value={idx}>{r.name}</option>)}
              </select>
            </label>
          )}

          {/* nome da sala */}
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'#374151' }}>Nome da sala</span>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Sala 012"
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8 }}/>
          </label>

          {/* janela de funcionamento */}
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'#374151' }}>Horário Inicial & Final da sala</span>
            <input value={range} onChange={e=>setRange(e.target.value)} placeholder="08:00 - 18:00"
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8 }}/>
          </label>

          {/* slot */}
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'#374151' }}>Bloco de horários de agendamento</span>
            <select value={slot} onChange={e=>setSlot(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff' }}>
              {[15,20,30,45,60].map(s=><option key={s} value={s}>{s} minutos</option>)}
            </select>
          </label>

          {/* adicionar nova sala */}
          <button type="button" onClick={()=>{
            setRooms(prev=>[{id:0,name:'Nova sala'}, ...prev]);
            setRoomIdx(0);
            setName('Nova sala');
            setRange('08:00 - 18:00');
            setSlot('30');
          }} style={{ textAlign:'left', border:'none', background:'transparent', color:'#111827', fontWeight:700, padding:0, marginTop:6, cursor:'pointer' }}>
            + Adicionar nova sala
          </button>
        </div>

        <button disabled={saving || !name.trim()} onClick={handleSave} style={{
          marginTop:16, width:'100%', padding:'12px', borderRadius:8, border:'none',
          background: (!name.trim() || saving) ? '#d1d5db' : '#111827',
          color: (!name.trim() || saving) ? '#6b7280' : '#fff', fontWeight:700, cursor: (!name.trim() || saving)?'not-allowed':'pointer'
        }}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}

/* ---------- Página Admin: Agendamentos (todos) ---------- */
export default function AdminAgendamentosPage() {
  const [openConfig, setOpenConfig] = useState(false);

  const [q, setQ] = useState('');
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState<{id:number; name:string}[]>([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [rowsAPI, setRowsAPI] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function fetchRooms() {
    try {
      const res = await api('/rooms', { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : data?.data || []);
    } catch {}
  }

  async function fetchAllBookings() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      // (room e date são filtrados client-side para simplificar;
      //  se preferir, envie room_id & date_from/date_to para a API)
      const res = await api(`/bookings?${params.toString()}`);
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
        dateISO: b.start_at,
        nome: b.user?.name || b.user?.email || 'Cliente',
        subt: 'Cliente',
        sala: b.room?.name || `Sala ${b.room_id}`,
        roomId: b.room_id,
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

  useEffect(() => { fetchRooms(); }, []);
  useEffect(() => { fetchAllBookings(); /* eslint-disable-next-line */ }, [q]);

  const filtered = useMemo(() => {
    const base = rowsAPI;
    return base
      .filter((r) => (!room || r.roomId === Number(room)))
      .filter((r) => (!date || r.at.startsWith(date.split('-').reverse().join('/'))));
  }, [rowsAPI, room, date]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const list = filtered.slice((page-1)*pageSize, page*pageSize);

  const statusTone = (s: string) => apiStatusToBadge(
    s === 'Agendado' ? 'CONFIRMED'
      : s === 'Cancelado' ? 'CANCELLED'
      : s === 'Recusado' ? 'REJECTED'
      : 'PENDING'
  );


  async function handleConfirm(id: number) {
    if (!confirm('Deseja confirmar este agendamento?')) return;
    try {
      const res = await api(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      console.log(res)
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data?.error || 'Falha ao confirmar');
      }
      await fetchAllBookings();
    } catch (e:any) {
      alert(e.message || 'Erro ao confirmar');
    }
}

  async function handleCancel(id: number) {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    try {
      const res = await api(`/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        throw new Error(data?.error || 'Falha ao cancelar');
      }
      await fetchAllBookings();
    } catch (e:any) {
      alert(e.message || 'Erro ao cancelar');
    }
  }

  return (
    <>
      <section style={{ padding:'0' }}>
        <header style={{ borderBottom:'1px solid #e5e7eb', paddingBottom:16, marginBottom:16 }}>
          <h1 style={{ margin:'0 0 4px', fontSize:22, fontWeight:800, color:'#111827' }}>Agendamentos</h1>
          <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Acompanhe todos os agendamentos de clientes forma simples</p>
        </header>

        {/* filtros */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 180px 160px 220px', gap:12, alignItems:'center', marginBottom:16 }}>
          <div style={{ position:'relative' }}>
            <input
              placeholder="Filtre por nome"
              value={q} onChange={e=>{ setPage(1); setQ(e.target.value); }}
              style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}
            />
            <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.search}</div>
          </div>

          <select value={room} onChange={e=>{setPage(1); setRoom(e.target.value);}} style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}>
            <option value="">Selecione</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          <div style={{ position:'relative' }}>
            <input type="date" value={date} onChange={e=>{setPage(1); setDate(e.target.value);}} style={{ width:'100%', padding:'10px 36px 10px 12px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff' }}/>
            <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{Icon.calendar}</div>
          </div>

          <div style={{ textAlign:'right' }}>
            <button onClick={()=>setOpenConfig(true)} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'none', background:'#111827', color:'#fff', fontWeight:700, cursor:'pointer' }}>
              Ajustes de agendamento
            </button>
          </div>
        </div>

        {/* tabela */}
        <div style={{ border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', padding:16, minHeight:340 }}>
          {loading ? (
            <div style={{ height:300, display:'grid', placeItems:'center', color:'#6b7280' }}>Carregando…</div>
          ) : error ? (
            <div style={{ height:300, display:'grid', placeItems:'center', color:'#b91c1c' }}>{error}</div>
          ) : list.length === 0 ? (
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
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Data agendamento ↑</th>
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Nome</th>
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Sala de agendamento</th>
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Status transação</th>
                    <th style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r, idx) => (
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
    const canCancel  = r._rawStatus === 'PENDING' || r._rawStatus === 'CONFIRMED';
    const canConfirm = r._rawStatus === 'PENDING';

    const btnStyle: React.CSSProperties = {
      width: 28,
      height: 28,
      borderRadius: '50%',
      border: '1px solid #e5e7eb',
      background: '#fff',
      cursor: 'pointer',
    };
    const btnDisStyle: React.CSSProperties = {
      ...btnStyle,
      cursor: 'not-allowed',
      opacity: 0.5,
    };

    return (
      <div style={{ display:'flex', gap:8 }}>
        {/* Confirmar */}
        <button
          title={canConfirm ? 'Confirmar' : 'Ação indisponível'}
          onClick={canConfirm ? () => handleConfirm(r.id) : undefined}
          disabled={!canConfirm}
          aria-disabled={!canConfirm}
          style={canConfirm ? btnStyle : btnDisStyle}
        >
          {Icon.check}
        </button>

        {/* Cancelar */}
        <button
          title={canCancel ? 'Cancelar' : 'Ação indisponível'}
          onClick={canCancel ? () => handleCancel(r.id) : undefined}
          disabled={!canCancel}
          aria-disabled={!canCancel}
          style={canCancel ? btnStyle : btnDisStyle}
        >
          {Icon.close}
        </button>
      </div>
    );
  })()}
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

      <ModalAjustes open={openConfig} onClose={()=>setOpenConfig(false)} onSaved={()=>{
        fetchRooms();
      }} />
    </>
  );
}
