// Los 3 logos institucionales son placeholders (no tenemos los assets oficiales
// de Gobierno de Chile / CONAF todavía) — reemplazar por los archivos reales
// cuando estén disponibles, ej. en public/logos/.
function LogoPlaceholder({ label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-white">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold leading-none">
        {label
          .split(' ')
          .map((w) => w[0])
          .slice(0, 3)
          .join('')}
      </div>
    </div>
  )
}

function formatFechaHora(date) {
  if (!date) return '—'
  const fecha = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
  const hora = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
  return `${fecha.replace('.', '')} ${hora}`
}

export function Header({ temporada, lastUpdated }) {
  return (
    <header className="flex flex-none items-center justify-between gap-4 bg-conaf px-4 py-2 text-white">
      <div className="flex items-center gap-3">
        <LogoPlaceholder label="Gobierno de Chile" />
        <LogoPlaceholder label="CONAF" />
        <LogoPlaceholder label="Proteccion Incendios" />
      </div>

      <div className="flex-1 text-center">
        <h1 className="text-lg font-black tracking-wide sm:text-xl">
          SITUACIÓN ACTUAL INCENDIOS FORESTALES
        </h1>
        <p className="text-xs font-medium text-white/85 sm:text-sm">Temporada {temporada}</p>
      </div>

      <div className="text-right text-xs leading-tight sm:text-sm">
        <p className="text-white/80">Fecha y hora:</p>
        <p className="font-bold">{formatFechaHora(lastUpdated)}</p>
        <p className="text-[11px] text-white/70">Actualización cada 5 minutos</p>
      </div>
    </header>
  )
}
