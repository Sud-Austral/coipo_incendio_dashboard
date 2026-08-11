import { Fragment, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ESTADOS } from '../lib/estados.js'
import { REGIONES } from '../lib/regiones.js'
import { formatCount, formatHa } from '../lib/derive.js'

const BAR_COLOR = '#a6192e'
const MESES_ABR = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

function formatFechaTick(fechaISO) {
  const [, m, d] = fechaISO.split('-').map(Number)
  return `${MESES_ABR[m - 1]} ${String(d).padStart(2, '0')}`
}

function SectionBanner({ children }) {
  return (
    <div className="bg-conaf px-3 py-1.5 text-sm font-bold text-white">{children}</div>
  )
}

function FiltrosPanel({ filtros, onFiltrosChange }) {
  const inputCls =
    'rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 focus:border-conaf focus:outline-none'
  const labelCls = 'mb-1 text-xs font-semibold text-gray-600'

  return (
    <div className="flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-[9rem] flex-1 flex-col">
        <label className={labelCls} htmlFor="filtro-region">Región</label>
        <select
          id="filtro-region"
          className={inputCls}
          value={filtros.region}
          onChange={(e) => onFiltrosChange({ region: e.target.value })}
        >
          <option value="Todas">Todas</option>
          {REGIONES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[9rem] flex-1 flex-col">
        <label className={labelCls} htmlFor="filtro-estado">Estado</label>
        <select
          id="filtro-estado"
          className={inputCls}
          value={filtros.estado}
          onChange={(e) => onFiltrosChange({ estado: e.target.value })}
        >
          <option value="Todos">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e.key} value={e.key}>{e.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-none flex-col">
        <span className={labelCls}>Fecha</span>
        <div className="flex items-center gap-1">
          <input
            type="date"
            aria-label="Desde"
            className={inputCls}
            value={filtros.desde}
            onChange={(e) => onFiltrosChange({ desde: e.target.value })}
          />
          <span className="text-xs text-gray-400">a</span>
          <input
            type="date"
            aria-label="Hasta"
            className={inputCls}
            value={filtros.hasta}
            onChange={(e) => onFiltrosChange({ hasta: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function heatOpacity(valor, max) {
  if (!max || !valor) return 0
  return Math.min(1, Math.max(0.1, valor / max))
}

function RegionComunaTabla({ regionRows }) {
  const [expandidas, setExpandidas] = useState(() => new Set())

  const toggle = (region) => {
    setExpandidas((prev) => {
      const next = new Set(prev)
      if (next.has(region)) next.delete(region)
      else next.add(region)
      return next
    })
  }

  const maxSuperficie = regionRows.reduce((max, r) => Math.max(max, r.superficieHa ?? 0), 0)
  const totalIncendios = regionRows.reduce((acc, r) => acc + r.total, 0)
  const totalSuperficie = regionRows.reduce((acc, r) => acc + r.superficieHa, 0)

  return (
    <div className="rounded border border-gray-200 bg-white shadow-sm">
      <SectionBanner>N° de incendios y superficie afectada por región y comuna</SectionBanner>
      <div className="max-h-[250px] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-2 py-1.5 text-left font-semibold">Región</th>
              <th className="px-2 py-1.5 text-right font-semibold">N° incendios</th>
              <th className="px-2 py-1.5 text-right font-semibold">Superficie (ha)</th>
            </tr>
          </thead>
          <tbody>
            {regionRows.map((row, idx) => {
              const isOpen = expandidas.has(row.region)
              const opacity = heatOpacity(row.superficieHa, maxSuperficie)
              return (
                <Fragment key={row.region ?? 'sin-region'}>
                  <tr
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-2 py-1 text-left">
                      <button
                        type="button"
                        onClick={() => toggle(row.region)}
                        aria-label={isOpen ? `Contraer ${row.region}` : `Expandir ${row.region}`}
                        className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded border border-gray-300 text-[10px] leading-none text-gray-600 hover:bg-gray-200"
                      >
                        {isOpen ? '−' : '+'}
                      </button>
                      {row.region ?? 'Sin región'}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">{formatCount(row.total)}</td>
                    <td
                      className="px-2 py-1 text-right tabular-nums"
                      style={{ backgroundColor: `rgba(230,57,70,${opacity})` }}
                    >
                      {formatHa(row.superficieHa)}
                    </td>
                  </tr>
                  {isOpen &&
                    row.comunas.map((c) => (
                      <tr key={`${row.region}-${c.comuna}`} className="bg-gray-50/60 text-gray-600">
                        <td className="py-1 pl-9 pr-2 text-left">{c.comuna}</td>
                        <td className="px-2 py-1 text-right tabular-nums">{formatCount(c.total)}</td>
                        <td className="px-2 py-1 text-right tabular-nums">{formatHa(c.superficieHa)}</td>
                      </tr>
                    ))}
                </Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-300 bg-gray-100 font-bold">
              <td className="px-2 py-1.5 text-left">Total</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{formatCount(totalIncendios)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{formatHa(totalSuperficie)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function GraficoPorFecha({ porFecha }) {
  return (
    <div className="rounded border border-gray-200 bg-white shadow-sm">
      <SectionBanner>N° incendios por fecha de inicio</SectionBanner>
      <div className="p-2" style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={porFecha} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <XAxis
              dataKey="fecha"
              tickFormatter={formatFechaTick}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={false}
              width={28}
            />
            <Tooltip
              labelFormatter={formatFechaTick}
              formatter={(value) => [formatCount(value), 'Incendios']}
            />
            <Bar dataKey="total" fill={BAR_COLOR} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function GraficoPorHora({ porHora }) {
  return (
    <div className="rounded border border-gray-200 bg-white shadow-sm">
      <SectionBanner>N° incendios por rango de hora</SectionBanner>
      <div className="p-2" style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={porHora} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <XAxis
              dataKey="hora"
              ticks={[0, 5, 10, 15, 20]}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={false}
              width={28}
            />
            <Tooltip
              labelFormatter={(hora) => `${String(hora).padStart(2, '0')}:00`}
              formatter={(value) => [formatCount(value), 'Incendios']}
            />
            <Bar dataKey="total" fill={BAR_COLOR} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function LeftPanel({ filtros, onFiltrosChange, regionRows, porFecha, porHora }) {
  return (
    <div className="flex flex-col gap-4">
      <FiltrosPanel filtros={filtros} onFiltrosChange={onFiltrosChange} />
      <RegionComunaTabla regionRows={regionRows} />
      <GraficoPorFecha porFecha={porFecha} />
      <GraficoPorHora porHora={porHora} />
    </div>
  )
}
