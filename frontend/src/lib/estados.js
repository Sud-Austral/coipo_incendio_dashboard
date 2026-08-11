export const ESTADOS = [
  { key: 'En trayecto', label: 'En trayecto', color: '#8b93a1' },
  { key: 'Bajo observación', label: 'Bajo observación', color: '#2f7fd6' },
  { key: 'En Combate', label: 'En Combate', color: '#e2481f' },
  { key: 'Controlado', label: 'Controlado', color: '#f2b705' },
  { key: 'Extinguido', label: 'Extinguido (hoy)', color: '#2ea043' },
]

export const ESTADO_COLOR = Object.fromEntries(ESTADOS.map((e) => [e.key, e.color]))
