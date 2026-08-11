import { ESTADOS } from '../lib/estados.js'
import { REGIONES } from '../lib/regiones.js'

export function Filters({ filtros, onChange, onReset }) {
  return <section className="panel filter-panel">
    <div className="panel-heading"><div><span className="panel-kicker">CONTROL</span><h2>Filtros de análisis</h2></div><button className="ghost-button" onClick={onReset}>Restablecer</button></div>
    <div className="filter-grid">
      <label>Región<select value={filtros.region} onChange={(e) => onChange({ region: e.target.value })}><option>Todas</option>{REGIONES.map((r) => <option key={r}>{r}</option>)}</select></label>
      <label>Estado<select value={filtros.estado} onChange={(e) => onChange({ estado: e.target.value })}><option>Todos</option>{ESTADOS.map((e) => <option key={e.key}>{e.key}</option>)}</select></label>
      <label>Desde<input type="date" value={filtros.desde} onChange={(e) => onChange({ desde: e.target.value })} /></label>
      <label>Hasta<input type="date" value={filtros.hasta} onChange={(e) => onChange({ hasta: e.target.value })} /></label>
    </div>
  </section>
}
