import { formatHa } from '../lib/derive.js'

export function RegionalPanel({ rows, selectedRegion, onRegion }) {
  const max = Math.max(...rows.map((r) => r.total), 1)
  return <section className="panel regional-panel">
    <div className="panel-heading"><div><span className="panel-kicker">TERRITORIO</span><h2>Actividad por región</h2></div><span className="panel-note">clic para filtrar</span></div>
    <div className="region-list">
      {rows.slice(0, 10).map((r) => <button key={r.region} className={`region-row ${selectedRegion === r.region ? 'selected' : ''}`} onClick={() => onRegion(selectedRegion === r.region ? 'Todas' : r.region)}>
        <div className="region-top"><strong>{r.region}</strong><span>{r.total} {r.total === 1 ? 'incendio' : 'incendios'}</span></div>
        <div className="region-bar"><span style={{ width: `${(r.total / max) * 100}%` }} /></div>
        <div className="region-bottom"><span>{r.comunas.length} comunas</span><span>{formatHa(r.superficieHa)} ha</span></div>
      </button>)}
    </div>
  </section>
}
