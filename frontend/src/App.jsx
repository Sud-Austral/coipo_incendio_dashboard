import { useMemo, useState } from 'react'
import { useIncendios } from './lib/useIncendios.js'
import {
  temporadaActual,
  rangoTemporada,
  hoyEnChile,
  soloIncendiosFormales,
  filtrarPorRangoFecha,
  filtrarPorRegion,
  filtrarPorEstado,
  kpis,
  magnitud200Vigente,
  regionComunaBreakdown,
  porFechaInicio,
  porHoraInicio,
  hoyPorRegion,
} from './lib/derive.js'
import { ESTADOS } from './lib/estados.js'
import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { KpiRow } from './components/KpiRow.jsx'
import { LeftPanel } from './components/LeftPanel.jsx'
import { FireMap } from './components/FireMap.jsx'
import { RightPanel } from './components/RightPanel.jsx'

function App() {
  const { data, loading, error, lastUpdated, refetch } = useIncendios()
  const temporada = useMemo(() => temporadaActual(), [])
  const rango = useMemo(() => rangoTemporada(temporada), [temporada])

  const [filtros, setFiltros] = useState(() => ({
    region: 'Todas',
    estado: 'Todos',
    desde: rango.desde,
    hasta: hoyEnChile(),
  }))

  const onFiltrosChange = (patch) => setFiltros((prev) => ({ ...prev, ...patch }))

  // Un "Foco" es un punto de calor que puede o no escalar a incendio — esta
  // vista solo cuenta incendios formalizados, igual que el Power BI de
  // referencia (ver nota en derive.js). Todo lo demás parte de acá, no de `data`.
  const incendios = useMemo(() => (data ? soloIncendiosFormales(data) : []), [data])

  const filtered = useMemo(() => {
    const porFecha = filtrarPorRangoFecha(incendios, filtros.desde, filtros.hasta)
    const porRegion = filtrarPorRegion(porFecha, filtros.region)
    return filtrarPorEstado(porRegion, filtros.estado)
  }, [incendios, filtros])

  // La tabla "hoy" respeta región/estado pero no el rango de fecha elegido —
  // "hoy" es un concepto fijo (día calendario actual), no otro filtro de fecha.
  const hoyBase = useMemo(() => {
    const porRegion = filtrarPorRegion(incendios, filtros.region)
    return filtrarPorEstado(porRegion, filtros.estado)
  }, [incendios, filtros.region, filtros.estado])

  const regionRows = useMemo(() => regionComunaBreakdown(filtered), [filtered])
  const porFecha = useMemo(() => porFechaInicio(filtered), [filtered])
  const porHora = useMemo(() => porHoraInicio(filtered), [filtered])
  const hoyData = useMemo(() => hoyPorRegion(hoyBase), [hoyBase])

  // El bloque "Estado actual de los incendios" de los KPIs es una foto de HOY
  // (misma fuente que la tabla "hoy"), no un acumulado de la temporada — si no,
  // "Extinguido (hoy)" terminaría mostrando el total histórico de extinguidos.
  const kpisData = useMemo(() => {
    const { total, superficieHa } = kpis(filtered)
    const porEstado = Object.fromEntries(ESTADOS.map((e) => [e.key, hoyData.total[e.key]]))
    return { total, superficieHa, magnitud200: magnitud200Vigente(hoyBase), porEstado }
  }, [filtered, hoyBase, hoyData])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-slate-500">
        Cargando datos de incendios…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-red-600">
        Error cargando datos: {error.message}
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <Header temporada={temporada} lastUpdated={lastUpdated} />
      <KpiRow kpis={kpisData} />
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-2 overflow-hidden p-2 lg:grid-cols-[380px_1fr_420px]">
        <div className="min-h-0 min-w-0 overflow-y-auto">
          <LeftPanel
            filtros={filtros}
            onFiltrosChange={onFiltrosChange}
            regionRows={regionRows}
            porFecha={porFecha}
            porHora={porHora}
          />
        </div>
        <div className="min-h-[300px] min-w-0">
          <FireMap incendios={filtered} />
        </div>
        <div className="min-h-0 min-w-0 overflow-y-auto">
          <RightPanel hoy={hoyData} listado={filtered} />
        </div>
      </div>
      <Footer temporada={temporada} onRefresh={refetch} />
    </div>
  )
}

export default App
