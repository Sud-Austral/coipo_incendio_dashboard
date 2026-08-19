import { MapContainer, TileLayer, WMSTileLayer, GeoJSON, CircleMarker, Marker, Tooltip, ZoomControl, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { ESTADO_COLOR, ESTADO_META } from '../lib/estados.js'
import { formatHa, fechaHoraLocal } from '../lib/derive.js'
import { CHILE_CENTER, CHILE_INITIAL_ZOOM, puntoAproximado } from '../lib/geo.js'

const BASE_MAPS = {
  streets: {
    label: 'Calles',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    label: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  topo: {
    label: 'Topográfico',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap',
  },
}

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

function useOptionalGeoJson(url) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => {
        if (cancelled) return
        setData(json)
        setStatus(Array.isArray(json?.features) && json.features.length ? 'ready' : 'empty')
      })
      .catch(() => {
        if (cancelled) return
        setData(null)
        setStatus('missing')
      })
    return () => { cancelled = true }
  }, [url])

  return { data, status }
}

function LayerSwitch({ checked, disabled, onChange, label, note, swatch }) {
  return <label className={`map-layer-option ${disabled ? 'disabled' : ''}`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span className="map-layer-check" />
    {swatch && <i className="map-layer-swatch" style={{ background: swatch }} />}
    <span className="map-layer-copy"><strong>{label}</strong>{note && <small>{note}</small>}</span>
  </label>
}

function LayerControl({ baseMap, setBaseMap, layers, setLayers, firmsReady, riskStatus, interfaceStatus }) {
  const [open, setOpen] = useState(false)
  return <div className={`map-layer-control ${open ? 'open' : ''}`}>
    <button type="button" className="map-layer-trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open}>☷ Capas</button>
    {open && <div className="map-layer-menu">
      <div className="map-layer-section-title">CAPAS DEL MAPA</div>
      <LayerSwitch checked={layers.incendios} onChange={(v) => setLayers((p) => ({ ...p, incendios: v }))} label="Incendios" note="Registros del dashboard" swatch="#971b2f" />
      <LayerSwitch checked={layers.firms} disabled={!firmsReady} onChange={(v) => setLayers((p) => ({ ...p, firms: v }))} label="Focos satelitales" note={firmsReady ? 'NASA FIRMS · VIIRS' : 'Configura VITE_FIRMS_MAP_KEY'} swatch="#f97316" />
      <LayerSwitch checked={layers.risk} disabled={riskStatus !== 'ready'} onChange={(v) => setLayers((p) => ({ ...p, risk: v }))} label="Riesgo de incendio" note={riskStatus === 'ready' ? 'Cobertura territorial local' : 'Carga riesgo.geojson'} swatch="#ef4444" />
      <LayerSwitch checked={layers.interface} disabled={interfaceStatus !== 'ready'} onChange={(v) => setLayers((p) => ({ ...p, interface: v }))} label="Interfaz urbano-forestal" note={interfaceStatus === 'ready' ? 'Cobertura territorial local' : 'Carga interfaz.geojson'} swatch="#f59e0b" />

      <div className="map-layer-separator" />
      <div className="map-layer-section-title">MAPA BASE</div>
      {Object.entries(BASE_MAPS).map(([key, meta]) => <label className="map-base-option" key={key}>
        <input type="radio" name="base-map" value={key} checked={baseMap === key} onChange={() => setBaseMap(key)} />
        <span>{meta.label}</span>
      </label>)}
      <div className="map-layer-footnote">Las capas territoriales se mantienen separadas del algoritmo de prioridad en esta versión.</div>
    </div>}
  </div>
}

const riskStyle = (feature) => {
  const raw = String(feature?.properties?.riesgo ?? feature?.properties?.Riesgo ?? feature?.properties?.nivel ?? '').toLowerCase()
  let fillColor = '#facc15'
  if (raw.includes('muy') && raw.includes('alto')) fillColor = '#7f1d1d'
  else if (raw.includes('alto')) fillColor = '#dc2626'
  else if (raw.includes('medio') || raw.includes('moder')) fillColor = '#f59e0b'
  else if (raw.includes('bajo')) fillColor = '#84cc16'
  return { color: fillColor, weight: 0.8, fillColor, fillOpacity: 0.23 }
}

const interfaceStyle = {
  color: '#f59e0b',
  weight: 1.2,
  fillColor: '#fbbf24',
  fillOpacity: 0.18,
  dashArray: '4 4',
}

export function FireMap({ incendios, selected, onSelect }) {
  const maxHa = Math.max(...incendios.map((i) => Number(i.superficieHa) || 0), 1)
  const [baseMap, setBaseMap] = useState('streets')
  const [layers, setLayers] = useState({ incendios: true, firms: false, risk: false, interface: false })
  const { data: riskGeoJson, status: riskStatus } = useOptionalGeoJson(`${import.meta.env.BASE_URL}data/riesgo.geojson`)
  const { data: interfaceGeoJson, status: interfaceStatus } = useOptionalGeoJson(`${import.meta.env.BASE_URL}data/interfaz.geojson`)
  const firmsMapKey = import.meta.env.VITE_FIRMS_MAP_KEY?.trim()
  const firmsReady = Boolean(firmsMapKey)
  const firmsUrl = firmsReady ? `https://firms.modaps.eosdis.nasa.gov/mapserver/wms/fires/${firmsMapKey}/` : null
  const base = BASE_MAPS[baseMap]

  const layerSummary = useMemo(() => {
    const active = []
    if (layers.incendios) active.push('incendios')
    if (layers.firms && firmsReady) active.push('focos satelitales')
    if (layers.risk && riskStatus === 'ready') active.push('riesgo')
    if (layers.interface && interfaceStatus === 'ready') active.push('interfaz')
    return active.join(' · ') || 'sin capas temáticas'
  }, [layers, firmsReady, riskStatus, interfaceStatus])

  return <section className="map-panel">
    <div className="map-overlay map-context"><span className="panel-kicker">MAPA OPERACIONAL</span><strong>{incendios.length} incendios en el filtro</strong><span>Capas activas: {layerSummary}. Ubicación aproximada por región cuando el origen no entrega coordenadas.</span></div>
    <LayerControl baseMap={baseMap} setBaseMap={setBaseMap} layers={layers} setLayers={setLayers} firmsReady={firmsReady} riskStatus={riskStatus} interfaceStatus={interfaceStatus} />
    <div className="map-overlay map-legend"><span>Estado</span>{Object.entries(ESTADO_META).map(([key, meta]) => <div key={key}>{key === "En Combate" ? <b className="map-legend-flame">🔥</b> : <i style={{ background: meta.color }} />}{meta.label}</div>)}<small>El tamaño de la llama representa la superficie afectada (ha).</small></div>
    <MapContainer center={CHILE_CENTER} zoom={CHILE_INITIAL_ZOOM} zoomControl={false} className="h-full w-full" style={{ height: '100%', width: '100%' }}>
      <ZoomControl position="bottomright" />
      <MapViewReset />
      <TileLayer key={baseMap} url={base.url} attribution={base.attribution} />
      {layers.firms && firmsReady && <WMSTileLayer
        url={firmsUrl}
        layers="fires_viirs"
        format="image/png"
        transparent
        opacity={0.92}
        version="1.1.1"
        attribution="NASA FIRMS"
      />}
      {layers.risk && riskStatus === 'ready' && riskGeoJson && <GeoJSON key="risk-layer" data={riskGeoJson} style={riskStyle} />}
      {layers.interface && interfaceStatus === 'ready' && interfaceGeoJson && <GeoJSON key="interface-layer" data={interfaceGeoJson} style={interfaceStyle} />}
      <MapFocus selected={selected} />
      {layers.incendios && incendios.map((inc) => {
        const ha = Number(inc.superficieHa)
        const safeHa = Number.isFinite(ha) && ha > 0 ? ha : 1
        const isSelected = selected?.id === inc.id
        const isEnCombate = inc.estado === 'En Combate'
        const flameSize = Math.max(22, Math.min(52, 22 + Math.sqrt(safeHa) * 2.2))

        if (isEnCombate) {
          const markerSize = flameSize
          return <Marker
            key={inc.id}
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
