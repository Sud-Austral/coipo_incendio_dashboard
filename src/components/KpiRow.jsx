import { ESTADOS } from '../lib/estados.js'
import { formatHa } from '../lib/derive.js'

function Kpi({ icon, label, value, helper, accent }) {
  return <div className={`kpi-card ${accent || ''}`}><div className="kpi-icon">{icon}</div><div className="kpi-content"><span className="kpi-label">{label}</span><strong>{value}</strong><span className="kpi-helper">{helper}</span></div></div>
}

export function KpiRow({ kpis, selectedEstado = 'Todos', onEstado }) {
  return <section className="kpi-grid">
    <Kpi icon="🔥" label="Incendios del período" value={kpis.total} helper="según filtros seleccionados" />
    <Kpi icon="▰" label="Superficie afectada" value={`${formatHa(kpis.superficieHa)} ha`} helper="acumulada en el período" />
    <Kpi icon="●" label="Incendios vigentes" value={kpis.vigentes} helper="no declarados extinguidos" accent={kpis.vigentes > 0 ? 'attention' : ''} />
    <Kpi icon="!" label="Magnitud > 200 ha" value={kpis.magnitud.total} helper={kpis.magnitud.total ? `${formatHa(kpis.magnitud.superficieHa)} ha involucradas` : 'sin incendios sobre umbral'} accent={kpis.magnitud.total ? 'critical' : ''} />
    <div className="status-kpi-card">
      <div className="status-kpi-title">Estado actual</div>
      <div className="status-kpi-grid">
        {ESTADOS.map((e) => {
          const active = selectedEstado === e.key
          return <button
            className={`status-kpi-item ${active ? 'active' : ''}`}
            key={e.key}
            type="button"
            onClick={() => onEstado?.(active ? 'Todos' : e.key)}
            title={`Filtrar por ${e.label}`}
          >
            <span className="status-dot" style={{ background: e.color }} />
            <strong>{kpis.estadoActual[e.key] || 0}</strong>
            <span>{e.label}</span>
          </button>
        })}
      </div>
    </div>
  </section>
}
