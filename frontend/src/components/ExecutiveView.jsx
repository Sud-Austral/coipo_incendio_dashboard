import { useMemo, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { ESTADO_META } from '../lib/estados.js'
import { formatDate, formatHa, filtrarPorRangoFecha, hoyEnChile, fechaHoraLocal } from '../lib/derive.js'
import { lecturaVariacion, regionesEjecutivas, resumenEjecutivo, tendenciaEjecutiva, variacion } from '../lib/deriveExecutive.js'

function Metric({ icon, label, value, helper, tone = '' }) {
  return <div className={`exec-metric ${tone}`}>
    <div className="exec-metric-icon">{icon}</div>
    <div><span>{label}</span><strong>{value}</strong><small>{helper}</small></div>
  </div>
}

function Insight({ label, value, tone = '' }) {
  return <div className={`exec-insight ${tone}`}><span>{label}</span><strong>{value}</strong></div>
}

export function ExecutiveView({ data, temporada, previousSeason, currentSummary, previousSummary, maxDataDate, stale, priority, onSelect }) {
  const hoy = hoyEnChile()
  const [quickRange, setQuickRange] = useState('30d')
  const [desde, setDesde] = useState(() => {
    const d = new Date(`${hoy}T12:00:00`)
    d.setDate(d.getDate() - 29)
    return d.toISOString().slice(0, 10)
  })
  const [hasta, setHasta] = useState(hoy)

  const seasonRange = useMemo(() => {
    const y = Number(hoy.slice(0, 4))
    const m = Number(hoy.slice(5, 7))
    const startYear = m >= 9 ? y : y - 1
    const seasonStart = `${startYear}-09-01`
    const seasonEnd = `${startYear + 1}-08-31`
    return { desde: seasonStart, hasta: seasonEnd }
  }, [hoy])

  const applyQuick = (key) => {
    const end = hoy
    if (key === 'today') {
      setDesde(end); setHasta(end)
    } else if (key === '7d') {
      const d = new Date(`${end}T12:00:00`); d.setDate(d.getDate() - 6)
      setDesde(d.toISOString().slice(0, 10)); setHasta(end)
    } else if (key === '30d') {
      const d = new Date(`${end}T12:00:00`); d.setDate(d.getDate() - 29)
      setDesde(d.toISOString().slice(0, 10)); setHasta(end)
    } else if (key === 'season') {
      setDesde(seasonRange.desde); setHasta(seasonRange.hasta)
    }
    setQuickRange(key)
  }

  const executiveData = useMemo(() => filtrarPorRangoFecha(data, desde, hasta), [data, desde, hasta])
  const summary = resumenEjecutivo(executiveData)
  const trend = tendenciaEjecutiva(executiveData, 7)
  const regions = regionesEjecutivas(executiveData, 5)
  const executivePriority = useMemo(() => {
    const activeIds = new Set(executiveData.map((i) => i.id))
    return priority.filter((i) => activeIds.has(i.id))
  }, [priority, executiveData])
  const maxRegion = Math.max(...regions.map((r) => r.total), 1)
  const isCustom = quickRange === 'custom'
  const displayRange = `${formatDate(desde)} → ${formatDate(hasta)}`
  const startDate = new Date(`${desde}T12:00:00`)
  const endDate = new Date(`${hasta}T12:00:00`)
  const durationDays = Math.max(1, Math.round((endDate - startDate) / 86400000) + 1)
  const previousEnd = new Date(startDate); previousEnd.setDate(previousEnd.getDate() - 1)
  const previousStart = new Date(previousEnd); previousStart.setDate(previousStart.getDate() - (durationDays - 1))
  const iso = (d) => d.toISOString().slice(0, 10)
  const previousPeriodData = useMemo(
    () => filtrarPorRangoFecha(data, iso(previousStart), iso(previousEnd)),
    [data, desde, hasta]
  )
  const previousPeriodSummary = useMemo(
    () => ({ total: previousPeriodData.length, superficieHa: previousPeriodData.reduce((a, i) => a + (Number(i.superficieHa) || 0), 0) }),
    [previousPeriodData]
  )
  const deltaCount = variacion(summary.total, previousPeriodSummary.total)
  const deltaHa = variacion(summary.superficieHa, previousPeriodSummary.superficieHa)
  const countDelta = lecturaVariacion(deltaCount)
  const haDelta = lecturaVariacion(deltaHa)
  const asOf = maxDataDate ? `Información disponible hasta ${formatDate(maxDataDate)}` : 'Sin fecha de actualización disponible'

  return <section className="executive-view">
    <div className="exec-hero">
      <div>
        <span className="exec-kicker">LECTURA EJECUTIVA · {temporada}</span>
        <h2>¿Qué requiere atención?</h2>
        <p>Resumen para tomar una decisión en pocos segundos, usando el mismo conjunto de datos de la vista operacional.</p>
      </div>
      <div className={`exec-alert ${summary.nivelKey}`}>
        <span className="exec-alert-icon">{summary.nivelKey === 'critical' ? '!' : summary.nivelKey === 'attention' ? '◐' : '✓'}</span>
        <div><span>NIVEL DE ATENCIÓN</span><strong>{summary.nivel}</strong><small>{summary.mensaje}</small></div>
      </div>
    </div>

    <div className="exec-filters">
      <div className="exec-filter-head">
        <div><span>PERÍODO DE ANÁLISIS</span><strong>{displayRange}</strong></div>
        <small>Este filtro es independiente de los filtros de la vista operacional.</small>
      </div>
      <div className="exec-filter-buttons">
        {[
          ['today', 'Hoy'],
          ['7d', '7 días'],
          ['30d', '30 días'],
          ['season', 'Temporada'],
        ].map(([key, label]) => (
          <button key={key} className={quickRange === key ? 'active' : ''} onClick={() => applyQuick(key)}>{label}</button>
        ))}
      </div>
      <div className="exec-date-range">
        <label>Desde<input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setQuickRange('custom') }} /></label>
        <span>→</span>
        <label>Hasta<input type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setQuickRange('custom') }} /></label>
        {isCustom && <span className="exec-custom-badge">Rango libre</span>}
      </div>
    </div>

    <div className="exec-metrics">
      <Metric icon="🔥" label="Incendios" value={summary.total} helper="en el período seleccionado" />
      <Metric icon="▰" label="Superficie" value={`${formatHa(summary.superficieHa)} ha`} helper="acumulada" />
      <Metric icon="🔴" label="En combate" value={summary.enCombate} helper="requieren acción" tone={summary.enCombate ? 'critical' : ''} />
      <Metric icon="◉" label="Vigentes" value={summary.vigentes} helper="no extinguidos" tone={summary.vigentes ? 'attention' : ''} />
      <Metric icon="!" label=">200 ha" value={summary.magnitud.total} helper={summary.magnitud.total ? `${formatHa(summary.magnitud.superficieHa)} ha` : 'sin casos'} tone={summary.magnitud.total ? 'critical' : ''} />
    </div>

    <div className="exec-grid">
      <section className="exec-card exec-priority-card">
        <div className="exec-card-head"><div><span>DECISIÓN</span><h3>Incendios que requieren atención</h3></div><small>{executivePriority.length ? `Top ${Math.min(executivePriority.length, 5)}` : 'Sin casos'}</small></div>
        {executivePriority.length ? <div className="exec-priority-list">{executivePriority.slice(0, 5).map((i, idx) => {
          const meta = ESTADO_META[i.estado] || {}
          return <button key={i.id} className="exec-priority-row" onClick={() => onSelect(i)}>
            <b className="exec-rank">{idx + 1}</b><span className="exec-status" style={{ background: meta.color }}>{meta.icon}</span>
            <span className="exec-fire-name"><strong>{i.nombre || 'Incendio sin nombre'}</strong><small>{i.region || 'Sin región'} · {i.comuna || 'Sin comuna'}</small></span>
            <span className="exec-fire-metric"><strong>{formatHa(i.superficieHa)} ha</strong><small>{meta.label || i.estado}</small></span>
          </button>
        })}</div> : <div className="exec-empty">✓ No hay incendios vigentes en el conjunto seleccionado.</div>}
      </section>

      <section className="exec-card">
        <div className="exec-card-head"><div><span>TERRITORIO</span><h3>¿Dónde está la actividad?</h3></div><small>por región</small></div>
        <div className="exec-region-list">{regions.map((r) => <div className="exec-region-row" key={r.region}><div><strong>{r.region}</strong><span>{r.total} {r.total === 1 ? 'incendio' : 'incendios'} · {formatHa(r.superficieHa)} ha</span></div><div className="exec-region-bar"><i style={{ width: `${(r.total / maxRegion) * 100}%` }} /></div></div>)}</div>
      </section>

      <section className="exec-card exec-trend-card">
        <div className="exec-card-head"><div><span>TENDENCIA</span><h3>Inicio de incendios</h3></div><small>últimos {trend.length} días disponibles</small></div>
        <div className="exec-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 6, right: 8, left: -26, bottom: 0 }}><XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fontSize: 9 }} axisLine={false} tickLine={false}/><Tooltip formatter={(v) => [`${v} incendios`, 'Inicios']} labelFormatter={(l) => `Fecha ${l}`}/><Area type="monotone" dataKey="total" stroke="#971b2f" fill="#971b2f" fillOpacity={0.12} strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div>
      </section>

      <section className="exec-card exec-context-card">
        <div className="exec-card-head"><div><span>CONTEXTO</span><h3>Contra el período anterior</h3></div><small>mismo número de días</small></div>
        <div className="exec-context-values"><div><span>Incendios</span><strong>{summary.total}</strong><b className={countDelta.tone}>{countDelta.text}</b></div><div><span>Superficie</span><strong>{formatHa(summary.superficieHa)} ha</strong><b className={haDelta.tone}>{haDelta.text}</b></div></div>
        <div className="exec-context-note">Comparación de {displayRange} frente al período inmediatamente anterior de igual duración. La cifra anterior se usa como referencia para interpretar el porcentaje.</div>
      </section>
    </div>

    <div className="exec-bottom">
      <Insight label="Bajo observación" value={summary.bajoObservacion} tone={summary.bajoObservacion ? 'attention' : ''} />
      <Insight label="En trayecto" value={summary.enTrayecto} />
      <Insight label="Controlados" value={summary.controlados} />
      <div className={`exec-data-status ${stale ? 'stale' : 'ok'}`}><span>{stale ? '●' : '●'}</span><div><strong>{stale ? 'Datos con rezago' : 'Datos disponibles'}</strong><small>{asOf}</small></div></div>
    </div>
  </section>
}
