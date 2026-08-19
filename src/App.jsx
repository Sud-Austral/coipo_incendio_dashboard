import { useMemo, useState } from 'react'
import { useIncendios } from './lib/useIncendios.js'
import { temporadaActual, rangoTemporada, hoyEnChile, soloIncendiosFormales, filtrarPorRangoFecha, filtrarPorRegion, filtrarPorEstado, kpis, magnitud200Vigente, regionComunaBreakdown, porFechaInicio, porHoraInicio, topPrioritarios, estadoActual, incendiosIniciadosHoy, fechaMaximaDatos, resumenTemporada, temporadaAnterior } from './lib/derive.js'
import { Header } from './components/Header.jsx'
import { KpiRow } from './components/KpiRow.jsx'
import { Filters } from './components/Filters.jsx'
import { RegionalPanel } from './components/RegionalPanel.jsx'
import { TrendPanel } from './components/TrendPanel.jsx'
import { FireMap } from './components/FireMap.jsx'
import { PriorityPanel } from './components/PriorityPanel.jsx'
import { DetailPanel } from './components/DetailPanel.jsx'
import { TodayPanel } from './components/TodayPanel.jsx'
import { SeasonPanel } from './components/SeasonPanel.jsx'
import { Footer } from './components/Footer.jsx'
import { ExecutiveView } from './components/ExecutiveView.jsx'
import './components/ExecutiveView.css'

function App() {
  const { data, loading, error, lastUpdated, refetch } = useIncendios()
  const temporada = useMemo(() => temporadaActual(), [])
  const rango = useMemo(() => rangoTemporada(temporada), [temporada])
  const hoy = hoyEnChile()
  const [filtros, setFiltros] = useState({ region: 'Todas', estado: 'Todos', desde: rango.desde, hasta: hoy })
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('operational')
  const incendios = useMemo(() => data ? soloIncendiosFormales(data) : [], [data])
  const filtered = useMemo(() => filtrarPorEstado(filtrarPorRegion(filtrarPorRangoFecha(incendios, filtros.desde, filtros.hasta), filtros.region), filtros.estado), [incendios, filtros])
  const currentSeason = useMemo(() => incendios.filter((i) => i.inicio?.slice(0, 4) === '2026' && i.inicio?.slice(5, 7) >= '07'), [incendios])
  const k = useMemo(() => ({ ...kpis(filtered), vigentes: filtered.filter((i) => i.estado !== 'Extinguido').length, magnitud: magnitud200Vigente(filtered), estadoActual: estadoActual(filtered) }), [filtered])
  const regional = useMemo(() => regionComunaBreakdown(filtered), [filtered])
  const trend = useMemo(() => porFechaInicio(filtered).slice(-14), [filtered])
  const hourly = useMemo(() => porHoraInicio(filtered), [filtered])
  const priority = useMemo(() => topPrioritarios(filtered), [filtered])
  const todayRows = useMemo(() => incendiosIniciadosHoy(incendios, hoy), [incendios, hoy])
  const today = useMemo(() => ({ total: todayRows.length, surface: todayRows.reduce((a, i) => a + (Number(i.superficieHa) || 0), 0), states: estadoActual(todayRows) }), [todayRows])
  const maxDataDate = useMemo(() => fechaMaximaDatos(incendios), [incendios])
  const prevSeason = temporadaAnterior(temporada)
  const currentSummary = useMemo(() => resumenTemporada(incendios, temporada), [incendios, temporada])
  const previousSummary = useMemo(() => resumenTemporada(incendios, prevSeason), [incendios, prevSeason])
  const stale = maxDataDate && maxDataDate < hoy
  const reset = () => { setFiltros({ region: 'Todas', estado: 'Todos', desde: rango.desde, hasta: hoy }); setSelected(null) }
  const onFilter = (patch) => { setFiltros((p) => ({ ...p, ...patch })); if (patch.region || patch.estado) setSelected(null) }

  if (loading) return <div className="loading-screen"><div className="loader"/><strong>Cargando situación de incendios…</strong><span>Procesando registros y preparando el mapa.</span></div>
  if (error) return <div className="loading-screen error"><strong>No fue posible cargar los datos</strong><span>{error.message}</span><button onClick={refetch}>Reintentar</button></div>

  return <div className="app-shell">
    <Header temporada={temporada} lastUpdated={lastUpdated} maxDataDate={maxDataDate} stale={stale}/>
    <nav className="dashboard-tabs" role="tablist" aria-label="Vista del dashboard">
      <div className="dashboard-tabs-inner">
        <button className={view === 'executive' ? 'active' : ''} onClick={() => { setView('executive'); setSelected(null) }} role="tab" aria-selected={view === 'executive'}>
          <span className="tab-icon" aria-hidden="true">▣</span>
          <span>Ejecutiva</span>
        </button>
        <button className={view === 'operational' ? 'active' : ''} onClick={() => setView('operational')} role="tab" aria-selected={view === 'operational'}>
          <span className="tab-icon" aria-hidden="true">⌖</span>
          <span>Operacional</span>
        </button>
      </div>
    </nav>
    {view === 'executive' ? <ExecutiveView
      data={incendios}
      temporada={temporada}
      previousSeason={prevSeason}
      currentSummary={currentSummary}
      previousSummary={previousSummary}
      maxDataDate={maxDataDate}
      stale={stale}
      priority={priority}
      onSelect={(inc) => { setSelected(inc); setView('operational') }}
    /> : <main className="dashboard-main">
      <KpiRow kpis={k} selectedEstado={filtros.estado} onEstado={(estado) => onFilter({ estado })}/>
      <div className="workspace">
        <aside className="left-column">
          <Filters filtros={filtros} onChange={onFilter} onReset={reset}/>
          <RegionalPanel rows={regional} selectedRegion={filtros.region} onRegion={(region) => onFilter({ region })}/>
          <TrendPanel data={trend} hourly={hourly}/>
        </aside>
        <section className="center-column"><FireMap incendios={filtered} selected={selected} onSelect={setSelected}/><div className="center-bottom"><SeasonPanel current={currentSummary} previous={previousSummary} currentLabel={temporada} previousLabel={prevSeason}/></div></section>
        <aside className="right-column"><PriorityPanel rows={priority} selected={selected} onSelect={setSelected}/><DetailPanel incendio={selected} onClear={() => setSelected(null)}/><TodayPanel today={today} todayDate={hoy} dataMaxDate={maxDataDate}/></aside>
      </div>
    </main>}
    <Footer temporada={temporada} onRefresh={refetch} maxDataDate={maxDataDate} recordCount={incendios.length}/>
  </div>
}

export default App
