export function Footer({ temporada, onRefresh }) {
  const [startYear, endYear] = temporada.split('-')
  return (
    <footer className="flex flex-none items-center justify-between gap-4 bg-conaf px-4 py-2 text-white">
      <p className="text-xs font-medium sm:text-sm">
        Temporada {temporada} desde el 01 de julio {startYear} al 30 de junio {endYear}.
      </p>
      <button
        type="button"
        onClick={onRefresh}
        title="Actualizar ahora"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-400"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0 1 14.5-3.5M19.5 15a8 8 0 0 1-14.5 3.5"
          />
        </svg>
      </button>
    </footer>
  )
}
