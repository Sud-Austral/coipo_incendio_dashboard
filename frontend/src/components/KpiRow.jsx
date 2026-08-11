import { ESTADOS, ESTADO_COLOR } from '../lib/estados.js'
import { formatCount, formatHa } from '../lib/derive.js'

function FlameIcon({ color = 'currentColor', className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
      <path d="M12.5 2c.4 2.3-.6 3.7-2 5.2C8.9 8.9 7.5 10.7 7.5 13a4.5 4.5 0 0 0 9 0c0-1.2-.4-2.1-1-3 .1 1.6-.5 2.6-1.3 3.2-.2-1.5-.9-2.3-1.8-3.1-.2 1-.7 1.6-1.4 2.1-.1-2.4 1.1-3.8 2.2-5.1C14.5 5.4 15 3.7 12.5 2Z" />
    </svg>
  )
}

function KpiBlock({ children, grow = 'flex-1', gap = 'gap-3', className = '' }) {
  return (
    <div
      className={`flex ${grow} min-w-[11rem] items-center justify-center ${gap} border-l border-slate-200 px-4 py-2 first:border-l-0 ${className}`}
    >
      {children}
    </div>
  )
}

function BigStat({ icon, label, value }) {
  return (
    <>
      {icon}
      <div className="leading-tight">
        <p className="text-2xl font-black text-red-800 sm:text-3xl">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </>
  )
}

function SubStat({ label, value }) {
  return (
    <div className="text-center leading-tight">
      <p className="text-lg font-black text-red-800 sm:text-xl">{value}</p>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
    </div>
  )
}

function EstadoItem({ estado, count }) {
  const color = ESTADO_COLOR[estado.key]
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="flex h-6 w-6 flex-none items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}1a` }}
      >
        <FlameIcon color={color} className="h-3.5 w-3.5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold text-slate-800">{count}</p>
        <p className="text-[10px] font-medium text-slate-500">{estado.label}</p>
      </div>
    </div>
  )
}

export function KpiRow({ kpis }) {
  const magnitudSuperficie =
    kpis.magnitud200.total === 0 ? '--' : formatHa(kpis.magnitud200.superficieHa)

  return (
    <div className="flex flex-none flex-wrap items-stretch bg-white shadow-sm">
      <KpiBlock>
        <BigStat
          icon={<FlameIcon color="#e2481f" className="h-9 w-9 flex-none sm:h-10 sm:w-10" />}
          label="N° de incendios"
          value={formatCount(kpis.total)}
        />
      </KpiBlock>

      <KpiBlock>
        <BigStat
          icon={<FlameIcon color="#e2481f" className="h-9 w-9 flex-none sm:h-10 sm:w-10" />}
          label="Superficie (ha)"
          value={formatHa(kpis.superficieHa)}
        />
      </KpiBlock>

      <KpiBlock grow="flex-[1.3]" gap="gap-1" className="flex-col">
        <p className="text-center text-xs font-semibold text-slate-600">
          Incendios de magnitud (&gt;200 ha) vigentes
        </p>
        <div className="flex items-center justify-center gap-6">
          <SubStat label="N° de incendios" value={formatCount(kpis.magnitud200.total)} />
          <SubStat label="Superficie (ha)" value={magnitudSuperficie} />
        </div>
      </KpiBlock>

      <KpiBlock grow="flex-[1.6]" gap="gap-1" className="flex-col">
        <p className="text-center text-xs font-semibold text-slate-600">
          Estado actual de los incendios
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {ESTADOS.map((estado) => (
            <EstadoItem key={estado.key} estado={estado} count={formatCount(kpis.porEstado[estado.key])} />
          ))}
        </div>
      </KpiBlock>
    </div>
  )
}
