import { formatDate } from '../lib/derive.js'

export function Header({ temporada, lastUpdated, maxDataDate, stale }) {
  const clock = lastUpdated ? new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(lastUpdated) : '--:--'
  return (
    <header className="app-header">
      <div className="brand-block">
        <div className="brand-mark">CONAF</div>
        <div>
          <div className="eyebrow">CENTRO DE MONITOREO</div>
          <h1>Situación actual de incendios forestales</h1>
          <p>Temporada {temporada}</p>
        </div>
      </div>
      <div className="header-status">
        <div className={`live-dot ${stale ? 'stale' : ''}`} />
        <div>
          <strong>{stale ? 'Datos con rezago' : 'Datos disponibles'}</strong>
          <span>Último registro: {formatDate(maxDataDate)} · carga {clock}</span>
        </div>
      </div>
    </header>
  )
}
