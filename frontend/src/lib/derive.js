import { ESTADOS } from './estados.js'
import { REGIONES } from './regiones.js'

const ESTADO_KEYS = ESTADOS.map((e) => e.key)
export const MAGNITUD_UMBRAL_HA = 200

/**
 * Un "Foco" es un punto de calor detectado que puede o no escalar a incendio;
 * esta vista solo debe contar incendios formalizados (tipo === 'Incendio').
 * Verificado contra la temporada actual: con Foco incluido da 26 incendios /
 * 16.61ha; solo 'Incendio' da 19 / 16.57ha, que es lo que muestra la
 * referencia del Power BI (19 / 16.6) — filtrar Foco es lo que hace calzar
 * los números, que es el objetivo real de este dashboard.
 */
export const esIncendioFormal = (inc) => inc.tipo === 'Incendio'

export function soloIncendiosFormales(data) {
  return data.filter(esIncendioFormal)
}

/**
 * Descompone un string ISO sin timezone ("YYYY-MM-DDTHH:MM:SS") leyéndolo
 * como texto, no vía `new Date()` — evita que el timezone del navegador del
 * usuario reinterprete la hora local de Chile que ya viene en el dato.
 */
export function fechaHoraLocal(iso) {
  if (!iso) return null
  const [fecha, hora = '00:00:00'] = iso.split('T')
  const [y, m, d] = fecha.split('-').map(Number)
  const [hh] = hora.split(':').map(Number)
  if (!y || !m || !d) return null
  return { y, m, d, hh, fecha }
}

/** Temporada CONAF: 1 de julio -> 30 de junio del año siguiente. */
export function temporadaDe(iso) {
  const f = fechaHoraLocal(iso)
  if (!f) return null
  const startYear = f.m >= 7 ? f.y : f.y - 1
  return `${startYear}-${startYear + 1}`
}

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de Chile, sin importar dónde esté el navegador. */
export function hoyEnChile() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function temporadaActual(hoyISO = hoyEnChile()) {
  const [y, m] = hoyISO.split('-').map(Number)
  const startYear = m >= 7 ? y : y - 1
  return `${startYear}-${startYear + 1}`
}

export function rangoTemporada(temporada) {
  const [startYear] = temporada.split('-').map(Number)
  return { desde: `${startYear}-07-01`, hasta: `${startYear + 1}-06-30` }
}

/** Un incendio es "vigente" si aún no ha sido declarado extinguido. */
export const isVigente = (inc) => inc.estado !== 'Extinguido'

export function filtrarPorTemporada(data, temporada) {
  if (!temporada || temporada === 'Todas') return data
  return data.filter((i) => temporadaDe(i.inicio) === temporada)
}

export function filtrarPorRegion(data, region) {
  if (!region || region === 'Todas') return data
  return data.filter((i) => i.region === region)
}

export function filtrarPorEstado(data, estado) {
  if (!estado || estado === 'Todos') return data
  return data.filter((i) => i.estado === estado)
}

export function filtrarPorRangoFecha(data, desde, hasta) {
  if (!desde && !hasta) return data
  return data.filter((i) => {
    const f = fechaHoraLocal(i.inicio)
    if (!f) return false
    if (desde && f.fecha < desde) return false
    if (hasta && f.fecha > hasta) return false
    return true
  })
}

export function sumaSuperficie(data) {
  let total = 0
  for (const i of data) total += i.superficieHa ?? 0
  return total
}

/** Totales de la temporada/filtro elegido (bloques 1-2 de la fila de KPIs). */
export function kpis(data) {
  return { total: data.length, superficieHa: sumaSuperficie(data) }
}

/**
 * Incendios VIGENTES con superficie > 200ha ahora mismo. No se debe acotar a
 * la temporada/rango de fecha elegido por el usuario -- "vigente" es una
 * foto del presente, no un agregado histórico (bloque 3 de la fila de KPIs).
 */
export function magnitud200Vigente(data) {
  let total = 0
  let superficieHa = 0
  for (const inc of data) {
    if (isVigente(inc) && (inc.superficieHa ?? 0) > MAGNITUD_UMBRAL_HA) {
      total += 1
      superficieHa += inc.superficieHa ?? 0
    }
  }
  return { total, superficieHa }
}

/** Desglose región -> comuna. Solo incluye regiones/comunas con al menos 1 incendio. */
export function regionComunaBreakdown(data) {
  const mkBucket = (region) => ({ region, total: 0, superficieHa: 0, comunas: new Map() })
  const map = new Map(REGIONES.map((r) => [r, mkBucket(r)]))
  const sinRegion = mkBucket(null)

  for (const inc of data) {
    const bucket = inc.region && map.has(inc.region) ? map.get(inc.region) : sinRegion
    bucket.total += 1
    bucket.superficieHa += inc.superficieHa ?? 0
    const comunaKey = inc.comuna ?? 'Sin comuna'
    if (!bucket.comunas.has(comunaKey)) {
      bucket.comunas.set(comunaKey, { comuna: comunaKey, total: 0, superficieHa: 0 })
    }
    const c = bucket.comunas.get(comunaKey)
    c.total += 1
    c.superficieHa += inc.superficieHa ?? 0
  }

  const finalize = (bucket) => ({
    ...bucket,
    comunas: [...bucket.comunas.values()].sort((a, b) => b.total - a.total),
  })

  const rows = REGIONES.map((r) => finalize(map.get(r))).filter((r) => r.total > 0)
  if (sinRegion.total > 0) rows.push(finalize(sinRegion))
  return rows
}

/** Conteo de incendios por fecha de inicio (para el gráfico de barras). */
export function porFechaInicio(data) {
  const map = new Map()
  for (const inc of data) {
    const f = fechaHoraLocal(inc.inicio)
    if (!f) continue
    map.set(f.fecha, (map.get(f.fecha) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([fecha, total]) => ({ fecha, total }))
}

/** Conteo de incendios por hora de inicio 0-23 (para el gráfico de barras). */
export function porHoraInicio(data) {
  const counts = Array.from({ length: 24 }, () => 0)
  for (const inc of data) {
    const f = fechaHoraLocal(inc.inicio)
    if (!f) continue
    counts[f.hh] = (counts[f.hh] ?? 0) + 1
  }
  return counts.map((total, hora) => ({ hora, total }))
}

const mkHoyBucket = () => ({
  total: 0,
  superficieHa: 0,
  'En trayecto': 0,
  'Bajo observación': 0,
  'En Combate': 0,
  Controlado: 0,
  Extinguido: 0,
})

/** Tabla "Incendios en el día de hoy": incendios cuyo `inicio` cae en la fecha de hoy (Chile), por región. */
export function hoyPorRegion(data, hoyISO = hoyEnChile()) {
  const hoy = data.filter((inc) => fechaHoraLocal(inc.inicio)?.fecha === hoyISO)
  const map = new Map(REGIONES.map((r) => [r, mkHoyBucket()]))
  const sinRegion = mkHoyBucket()

  for (const inc of hoy) {
    const bucket = inc.region && map.has(inc.region) ? map.get(inc.region) : sinRegion
    bucket.total += 1
    bucket.superficieHa += inc.superficieHa ?? 0
    if (inc.estado in bucket) bucket[inc.estado] += 1
  }

  const rows = REGIONES.map((r) => ({ region: r, ...map.get(r) }))
  const total = rows.reduce((acc, r) => {
    acc.total += r.total
    acc.superficieHa += r.superficieHa
    for (const k of ESTADO_KEYS) acc[k] += r[k]
    return acc
  }, mkHoyBucket())

  return { rows, total, sinRegion: sinRegion.total > 0 ? { region: null, ...sinRegion } : null }
}

export function formatCount(n) {
  return !n ? '--' : String(n)
}

/** null = dato no registrado en origen ("--"). 0 es un valor real y se muestra como tal. */
export function formatHa(n, decimals = 1) {
  if (n === null || n === undefined) return '--'
  return n.toFixed(decimals)
}
