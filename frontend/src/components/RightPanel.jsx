import { useMemo, useState } from 'react'
import { ESTADOS, ESTADO_COLOR } from '../lib/estados.js'
import { formatCount, formatHa } from '../lib/derive.js'

const HOY_HEADERS = ['Región', 'Total incendios', ...ESTADOS.map((e) => e.label), 'Superficie (ha)']

function zebra(index) {
  return index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
}

function HoyRow({ label, data, bold = false, className = '' }) {
  return (
    <tr className={`${className} ${bold ? 'font-bold' : ''}`}>
      <td className="px-3 py-1.5 text-left">{label}</td>
      <td className="px-3 py-1.5 text-right">{formatCount(data.total)}</td>
      {ESTADOS.map((e) => (
        <td key={e.key} className="px-3 py-1.5 text-right">
          {formatCount(data[e.key])}
        </td>
      ))}
      <td className="px-3 py-1.5 text-right">{formatHa(data.superficieHa, 2)}</td>
    </tr>
  )
}

function HoyTable({ hoy }) {
  const mostrarSinRegion = hoy.sinRegion && hoy.sinRegion.total > 0

  return (
    <section className="flex max-h-[42%] flex-none flex-col overflow-hidden rounded shadow-sm">
      <h2 className="flex-none bg-conaf px-3 py-1.5 text-sm font-bold text-white">
        Incendios en el día de hoy
      </h2>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-xs sm:text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              {HOY_HEADERS.map((h, i) => (
                <th
                  key={h}
                  className={`bg-slate-100 px-3 py-1.5 font-semibold text-slate-600 ${
                    i === 0 ? 'text-left' : 'text-right'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hoy.rows.map((row, i) => (
              <HoyRow key={row.region} label={row.region} data={row} className={zebra(i)} />
            ))}
            {mostrarSinRegion && (
              <HoyRow
                label="Sin región"
                data={hoy.sinRegion}
                className={zebra(hoy.rows.length)}
              />
            )}
            <HoyRow
              label="Total"
              data={hoy.total}
              bold
              className="border-t-2 border-slate-300 bg-slate-100"
            />
          </tbody>
        </table>
      </div>
    </section>
  )
}

const LISTADO_COLUMNS = [
  { key: 'nombre', label: 'Nombre', align: 'left' },
  { key: 'region', label: 'Región', align: 'left' },
  { key: 'comuna', label: 'Comuna', align: 'left' },
  { key: 'superficieHa', label: 'Superficie (ha)', align: 'right' },
  { key: 'estado', label: 'Estado', align: 'left' },
  { key: 'inicio', label: 'Inicio', align: 'left' },
]

function formatFechaCorta(iso) {
  if (!iso) return '—'
  const [fecha] = iso.split('T')
  const [y, m, d] = fecha.split('-')
  return `${d}-${m}-${y}`
}

function compareValues(a, b, dir) {
  const aNull = a === null || a === undefined
  const bNull = b === null || b === undefined
  if (aNull && bNull) return 0
  if (aNull) return 1
  if (bNull) return -1

  if (typeof a === 'number' && typeof b === 'number') {
    return dir === 'asc' ? a - b : b - a
  }

  const as = String(a)
  const bs = String(b)
  if (as < bs) return dir === 'asc' ? -1 : 1
  if (as > bs) return dir === 'asc' ? 1 : -1
  return 0
}

function ListadoTable({ listado }) {
  const [sortField, setSortField] = useState('superficieHa')
  const [sortDir, setSortDir] = useState('desc')

  const sorted = useMemo(() => {
    return [...listado].sort((a, b) => compareValues(a[sortField], b[sortField], sortDir))
  }, [listado, sortField, sortDir])

  function handleSort(key) {
    if (key === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(key)
      setSortDir('asc')
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded shadow-sm">
      <h2 className="flex-none bg-conaf px-3 py-1.5 text-sm font-bold text-white">
        Listado de incendios registrados durante la temporada
      </h2>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-xs sm:text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              {LISTADO_COLUMNS.map((col) => {
                const active = col.key === sortField
                const arrow = active ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`cursor-pointer select-none whitespace-nowrap bg-slate-100 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-200 ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.label}
                    {arrow}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((inc, i) => (
              <tr key={inc.id} className={zebra(i)}>
                <td className="px-3 py-1.5 text-left">{inc.nombre ?? '(sin nombre)'}</td>
                <td className="px-3 py-1.5 text-left">{inc.region ?? '—'}</td>
                <td className="px-3 py-1.5 text-left">{inc.comuna ?? '—'}</td>
                <td className="px-3 py-1.5 text-right">{formatHa(inc.superficieHa)}</td>
                <td className="px-3 py-1.5 text-left">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 flex-none rounded-full"
                      style={{ backgroundColor: ESTADO_COLOR[inc.estado] }}
                    />
                    {inc.estado}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-left">{formatFechaCorta(inc.inicio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function RightPanel({ hoy, listado }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <HoyTable hoy={hoy} />
      <ListadoTable listado={listado} />
    </div>
  )
}
