import { formatDate, formatHa } from '../lib/derive.js'
import { ESTADOS } from '../lib/estados.js'

export function TodayPanel({ today, todayDate, dataMaxDate }) {
  return <section className="panel today-panel"><div className="panel-heading"><div><span className="panel-kicker">HOY</span><h2>Incendios iniciados hoy</h2></div><span className="date-pill">{formatDate(todayDate)}</span></div>{today.total === 0 ? <div className="today-empty"><strong>No hay registros iniciados hoy</strong><span>El archivo disponible llega hasta {formatDate(dataMaxDate)}.</span></div> : <><div className="today-summary"><div><strong>{today.total}</strong><span>incendios</span></div><div><strong>{formatHa(today.surface)} ha</strong><span>superficie</span></div></div><div className="today-states">{ESTADOS.map((e) => <div key={e.key}><i style={{ background: e.color }}/><span>{e.label}</span><b>{today.states[e.key] || 0}</b></div>)}</div></>}</section>
}
