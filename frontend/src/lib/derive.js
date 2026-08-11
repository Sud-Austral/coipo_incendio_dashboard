import { ESTADOS } from './estados.js'
import { REGIONES } from './regiones.js'

export const MAGNITUD_UMBRAL_HA = 200
const ESTADO_KEYS = ESTADOS.map((e) => e.key)

export const esIncendioFormal = (inc) => inc?.tipo === 'Incendio'
export const soloIncendiosFormales = (data) => data.filter(esIncendioFormal)

export function fechaHoraLocal(iso) {
  if (!iso) return null
  const [fecha, hora = '00:00:00'] = String(iso).split('T')
  const [y, m, d] = fecha.split('-').map(Number)
  const [hh = 0, mm = 0] = hora.split(':').map(Number)
  if (!y || !m || !d) return null
  return { y, m, d, hh, mm, fecha }
}

export function temporadaDe(iso) {
  const f = fechaHoraLocal(iso)
  if (!f) return null
  const startYear = f.m >= 7 ? f.y : f.y - 1
  return `${startYear}-${startYear + 1}`
}

export function hoyEnChile() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit',
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

export const isVigente = (inc) => inc?.estado && inc.estado !== 'Extinguido'

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
  return data.reduce((total, i) => total + (Number(i.superficieHa) || 0), 0)
}

export function kpis(data) {
  return { total: data.length, superficieHa: sumaSuperficie(data) }
}

export function magnitud200Vigente(data) {
  const rows = data.filter((i) => isVigente(i) && (Number(i.superficieHa) || 0) > MAGNITUD_UMBRAL_HA)
  return { total: rows.length, superficieHa: sumaSuperficie(rows), rows }
}

export function regionComunaBreakdown(data) {
  const map = new Map()
  for (const inc of data) {
    const region = inc.region || 'Sin región'
    if (!map.has(region)) map.set(region, { region, total: 0, superficieHa: 0, comunas: new Map() })
    const bucket = map.get(region)
    bucket.total += 1
    bucket.superficieHa += Number(inc.superficieHa) || 0
    const comuna = inc.comuna || 'Sin comuna'
    if (!bucket.comunas.has(comuna)) bucket.comunas.set(comuna, { comuna, total: 0, superficieHa: 0 })
    const c = bucket.comunas.get(comuna)
    c.total += 1
    c.superficieHa += Number(inc.superficieHa) || 0
  }
  return [...map.values()]
    .map((r) => ({ ...r, comunas: [...r.comunas.values()].sort((a, b) => b.total - a.total || b.superficieHa - a.superficieHa) }))
    .sort((a, b) => b.total - a.total || b.superficieHa - a.superficieHa)
}

export function porFechaInicio(data) {
  const map = new Map()
  for (const inc of data) {
    const f = fechaHoraLocal(inc.inicio)
    if (!f || f.y < 2000) continue
    map.set(f.fecha, (map.get(f.fecha) || 0) + 1)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([fecha, total]) => ({ fecha, total }))
}

export function porHoraInicio(data) {
  const counts = Array.from({ length: 24 }, () => 0)
  for (const inc of data) {
    const f = fechaHoraLocal(inc.inicio)
    if (!f || f.y < 2000) continue
    counts[f.hh] += 1
  }
  return counts.map((total, hora) => ({ hora, total }))
}

export function topPrioritarios(data) {
  const score = (i) => {
    const ha = Number(i.superficieHa) || 0
    const stateScore = { 'En Combate': 100, 'Bajo observación': 65, 'En trayecto': 50, Controlado: 25, Extinguido: 0 }[i.estado] || 0
    const magnitudeScore = ha >= 200 ? 80 : ha >= 50 ? 50 : ha >= 10 ? 25 : ha >= 1 ? 10 : 0
    return stateScore + magnitudeScore + Math.min(ha / 10, 20)
  }
  return [...data]
    .filter((i) => isVigente(i))
    .map((inc) => ({ ...inc, priorityScore: score(inc) }))
    .sort((a, b) => b.priorityScore - a.priorityScore || (Number(b.superficieHa) || 0) - (Number(a.superficieHa) || 0))
    .slice(0, 8)
}

export function estadoActual(data) {
  const out = Object.fromEntries(ESTADO_KEYS.map((key) => [key, 0]))
  for (const inc of data) {
    if (inc.estado in out) out[inc.estado] += 1
  }
  return out
}

export function incendiosIniciadosHoy(data, hoyISO = hoyEnChile()) {
  return data.filter((i) => fechaHoraLocal(i.inicio)?.fecha === hoyISO)
}

export function fechaMaximaDatos(data) {
  const fechas = data.map((i) => fechaHoraLocal(i.inicio)?.fecha).filter((x) => x && x >= '2000-01-01')
  return fechas.sort().at(-1) || null
}

export function fechaMinimaDatos(data) {
  const fechas = data.map((i) => fechaHoraLocal(i.inicio)?.fecha).filter((x) => x && x >= '2000-01-01')
  return fechas.sort()[0] || null
}

export function temporadaAnterior(temporada) {
  const [start] = temporada.split('-').map(Number)
  return `${start - 1}-${start}`
}

export function formatCount(n) {
  return n === 0 ? '0' : String(n ?? 0)
}

export function formatHa(n, decimals = 1) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '--'
  return Number(n).toLocaleString('es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function formatDate(iso) {
  if (!iso) return '--'
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

export function formatDateShort(iso) {
  if (!iso) return '--'
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function resumenTemporada(data, temporada) {
  const rows = data.filter((i) => temporadaDe(i.inicio) === temporada)
  return { total: rows.length, superficieHa: sumaSuperficie(rows), vigentes: rows.filter(isVigente).length }
}

export function tendenciaDiaria(data, days = 14) {
  const daily = porFechaInicio(data)
  if (!daily.length) return []
  return daily.slice(-days).map((x) => ({ ...x, label: formatDateShort(x.fecha) }))
}

export function regionesTop(data, limit = 8) {
  return regionComunaBreakdown(data).slice(0, limit).map((x) => ({ ...x, label: x.region }))
}

export function incendiosPorEstado(data) {
  const out = Object.fromEntries(ESTADO_KEYS.map((key) => [key, 0]))
  for (const i of data) if (i.estado in out) out[i.estado] += 1
  return out
}
