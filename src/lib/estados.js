export const ESTADOS = [
  { key: 'En trayecto', label: 'En trayecto', color: '#64748b', icon: '→', tone: 'neutral' },
  { key: 'Bajo observación', label: 'Bajo observación', color: '#2563eb', icon: '◉', tone: 'info' },
  { key: 'En Combate', label: 'En combate', color: '#dc2626', icon: '●', tone: 'danger' },
  { key: 'Controlado', label: 'Controlado', color: '#d97706', icon: '✓', tone: 'warning' },
  { key: 'Extinguido', label: 'Extinguido', color: '#16a34a', icon: '✓', tone: 'success' },
]
export const ESTADO_COLOR = Object.fromEntries(ESTADOS.map((e) => [e.key, e.color]))
export const ESTADO_META = Object.fromEntries(ESTADOS.map((e) => [e.key, e]))
