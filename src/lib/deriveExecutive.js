import { isVigente, sumaSuperficie, porFechaInicio, regionComunaBreakdown, magnitud200Vigente } from './derive.js'

export function resumenEjecutivo(data) {
  const total = data.length
  const vigentes = data.filter(isVigente)
  const enCombate = data.filter((i) => i.estado === 'En Combate')
  const bajoObservacion = data.filter((i) => i.estado === 'Bajo observación')
  const enTrayecto = data.filter((i) => i.estado === 'En trayecto')
  const controlados = data.filter((i) => i.estado === 'Controlado')
  const magnitud = magnitud200Vigente(data)

  let nivel = 'CONTROLADA'
  let nivelKey = 'good'
  let mensaje = 'No se observan incendios vigentes que requieran atención inmediata.'

  if (enCombate.length >= 3 || magnitud.total >= 1) {
    nivel = 'CRÍTICA'
    nivelKey = 'critical'
    mensaje = `${enCombate.length} incendio${enCombate.length === 1 ? '' : 's'} en combate${magnitud.total ? ` y ${magnitud.total} sobre 200 ha` : ''}.`
  } else if (enCombate.length > 0 || bajoObservacion.length > 0 || enTrayecto.length > 0) {
    nivel = 'EN OBSERVACIÓN'
    nivelKey = 'attention'
    mensaje = `${vigentes.length} incendio${vigentes.length === 1 ? '' : 's'} vigente${vigentes.length === 1 ? '' : 's'} requiere${vigentes.length === 1 ? '' : 'n'} seguimiento.`
  }

  return {
    total,
    superficieHa: sumaSuperficie(data),
    vigentes: vigentes.length,
    enCombate: enCombate.length,
    bajoObservacion: bajoObservacion.length,
    enTrayecto: enTrayecto.length,
    controlados: controlados.length,
    magnitud,
    nivel,
    nivelKey,
    mensaje,
  }
}

export function tendenciaEjecutiva(data, days = 7) {
  const rows = porFechaInicio(data).slice(-days)
  return rows.map((r) => ({ ...r, label: r.fecha.slice(8, 10) + '/' + r.fecha.slice(5, 7) }))
}

export function regionesEjecutivas(data, limit = 5) {
  return regionComunaBreakdown(data).slice(0, limit)
}

export function variacion(actual, anterior) {
  if (!anterior) return null
  if (anterior === 0) return actual === 0 ? 0 : null
  return ((actual - anterior) / anterior) * 100
}

export function lecturaVariacion(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return { text: '--', tone: 'neutral' }
  const rounded = Math.round(value)
  return { text: `${rounded > 0 ? '+' : ''}${rounded}%`, tone: rounded > 0 ? 'bad' : rounded < 0 ? 'good' : 'neutral' }
}
