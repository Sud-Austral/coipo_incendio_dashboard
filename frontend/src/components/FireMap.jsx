import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip, ZoomControl, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useEffect } from 'react'
import { ESTADO_COLOR, ESTADO_META } from '../lib/estados.js'
import { formatHa, fechaHoraLocal } from '../lib/derive.js'
import { CHILE_CENTER, CHILE_INITIAL_ZOOM, puntoAproximado } from '../lib/geo.js'

function MapFocus({ selected }) {
  const map = useMap()

  useEffect(() => {
    if (!selected) return
    map.flyTo(puntoAproximado(selected), 8.5, {
      animate: true,
      duration: 1.15,
      easeLinearity: 0.25,
    })
  }, [selected, map])

  return null
}

function MapViewReset() {
  const map = useMap()
  const reset = () => map.flyTo(CHILE_CENTER, CHILE_INITIAL_ZOOM, { animate: true, duration: 0.9 })
  return <button type="button" className="map-reset-view" onClick={reset} title="Volver a la vista general de Chile">
    Ver todo Chile
  </button>
}

function FireTooltip({ incendio }) {
  const meta = ESTADO_META[incendio.estado]
  const f = fechaHoraLocal(incendio.inicio)
  return <div className="map-tooltip"><strong>{incendio.nombre || 'Incendio sin nombre'}</strong><span>{incendio.region || '—'} · {incendio.comuna || '—'}</span><span><b style={{ color: meta?.color }}>{meta?.icon} {meta?.label || incendio.estado}</b></span><span>{formatHa(incendio.superficieHa)} ha · {f ? `${String(f.d).padStart(2,'0')}-${String(f.m).padStart(2,'0')} ${String(f.hh).padStart(2,'0')}:${String(f.mm).padStart(2,'0')}` : 'fecha no disponible'}</span></div>
}

export function FireMap({ incendios, selected, onSelect }) {
  const maxHa = Math.max(...incendios.map((i) => Number(i.superficieHa) || 0), 1)
  return <section className="map-panel">
    <div className="map-overlay map-context"><span className="panel-kicker">MAPA OPERACIONAL</span><strong>{incendios.length} incendios en el filtro</strong><span>Ubicación aproximada por región cuando el origen no entrega coordenadas.</span></div>
    <div className="map-overlay map-legend"><span>Estado</span>{Object.entries(ESTADO_META).map(([key, meta]) => <div key={key}>{key === "En Combate" ? <b className="map-legend-flame">🔥</b> : <i style={{ background: meta.color }} />}{meta.label}</div>)}<small>El tamaño de la llama representa la superficie afectada (ha).</small></div>
    <MapContainer center={CHILE_CENTER} zoom={CHILE_INITIAL_ZOOM} zoomControl={false} className="h-full w-full" style={{ height: '100%', width: '100%' }}>
      <ZoomControl position="bottomright" />
      <MapViewReset />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
      <MapFocus selected={selected} />
      {incendios.map((inc) => {
        const ha = Number(inc.superficieHa)
        const safeHa = Number.isFinite(ha) && ha > 0 ? ha : 1
        const isSelected = selected?.id === inc.id
        const isEnCombate = inc.estado === 'En Combate'

        // Raíz cuadrada para que el tamaño represente magnitud sin que
        // incendios excepcionales dominen completamente el mapa.
        const flameSize = Math.max(22, Math.min(52, 22 + Math.sqrt(safeHa) * 2.2))

        if (isEnCombate) {
          const markerSize = flameSize
          return <Marker
            key={inc.id}
            center={puntoAproximado(inc)}
            position={puntoAproximado(inc)}
            eventHandlers={{ click: () => onSelect(inc) }}
            icon={divIcon({
              className: 'fire-map-icon',
              html: `<span class="fire-map-flame${isSelected ? ' selected' : ''}" style="font-size:${flameSize}px">🔥</span>`,
              iconSize: [markerSize, markerSize],
              iconAnchor: [markerSize / 2, markerSize * 0.88],
              popupAnchor: [0, -markerSize * 0.8],
            })}
          >
            <Tooltip><FireTooltip incendio={inc}/></Tooltip>
          </Marker>
        }

        const radius = 5 + Math.min(12, (safeHa / Math.max(maxHa, 1)) * 12)
        return <CircleMarker
          key={inc.id}
          center={puntoAproximado(inc)}
          radius={isSelected ? radius + 3 : radius}
          eventHandlers={{ click: () => onSelect(inc) }}
          pathOptions={{
            color: isSelected ? '#111827' : '#fff',
            weight: isSelected ? 3 : 1.5,
            fillColor: ESTADO_COLOR[inc.estado] || '#64748b',
            fillOpacity: 0.88
          }}
        >
          <Tooltip><FireTooltip incendio={inc}/></Tooltip>
        </CircleMarker>
      })}
    </MapContainer>
  </section>
}
