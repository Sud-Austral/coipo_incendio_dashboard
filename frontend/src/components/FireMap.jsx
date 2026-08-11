import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl } from 'react-leaflet'
import { ESTADO_COLOR } from '../lib/estados.js'
import { formatHa } from '../lib/derive.js'
import { CHILE_CENTER, CHILE_INITIAL_ZOOM, puntoAproximado } from '../lib/geo.js'

function FireTooltipContent({ incendio }) {
  const superficie =
    incendio.superficieHa === null || incendio.superficieHa === undefined
      ? 'sin dato'
      : `${formatHa(incendio.superficieHa)} ha`

  return (
    <div className="text-xs leading-snug">
      <p className="font-bold">{incendio.nombre || '(sin nombre)'}</p>
      <p>
        {incendio.region || '—'} · {incendio.comuna || '—'}
      </p>
      <p>Estado: {incendio.estado}</p>
      <p>Superficie: {superficie}</p>
    </div>
  )
}

export function FireMap({ incendios }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-2 top-2 z-[1000] max-w-[260px] rounded bg-white/85 px-2 py-1.5 shadow-sm">
        <p className="text-xs text-slate-800">
          Vigente: Incendio que aun no ha sido declarado extinguido.
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          Ubicación aproximada por región: el dato de origen no incluye coordenadas exactas por
          incendio.
        </p>
      </div>

      <MapContainer
        center={CHILE_CENTER}
        zoom={CHILE_INITIAL_ZOOM}
        zoomControl={false}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {incendios.map((inc) => (
          <CircleMarker
            key={inc.id}
            center={puntoAproximado(inc)}
            radius={5}
            pathOptions={{
              color: '#ffffff',
              weight: 1,
              fillColor: ESTADO_COLOR[inc.estado],
              fillOpacity: 0.9,
            }}
          >
            <Tooltip>
              <FireTooltipContent incendio={inc} />
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
