import { ESTADO_META } from '../lib/estados.js'
import { formatHa } from '../lib/derive.js'

export function PriorityPanel({ rows, selected, onSelect }) {
  return <section className="panel priority-panel">
    <div className="panel-heading"><div><span className="panel-kicker">ATENCIÓN</span><h2>Incendios prioritarios</h2></div><span className="panel-note">vigentes</span></div>
    {rows.length === 0 ? <div className="empty-state"><span>✓</span><strong>Sin incendios vigentes</strong><p>No hay incendios que requieran atención en el conjunto seleccionado.</p></div> : <div className="priority-list">{rows.map((i, idx) => { const meta = ESTADO_META[i.estado] || {}; return <button key={i.id} className={`priority-row ${selected?.id === i.id ? 'selected' : ''}`} onClick={() => onSelect(i)}><span className="priority-rank">{idx + 1}</span><span className="priority-status" style={{ background: meta.color }}>{meta.icon}</span><span className="priority-info"><strong>{i.nombre || 'Incendio sin nombre'}</strong><small>{i.region || 'Sin región'} · {i.comuna || 'Sin comuna'}</small></span><span className="priority-metric"><b>{formatHa(i.superficieHa)} ha</b><small>{meta.label || i.estado}</small></span></button>})}</div>}
  </section>
}
