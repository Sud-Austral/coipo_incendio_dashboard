// Coordenadas aproximadas (capital regional) — el dataset de incendios NO trae
// latitud/longitud por incendio ni por comuna, así que el mapa solo puede
// posicionar por región de forma aproximada. Ver nota en FireMap.
export const REGION_CENTROIDE = {
  'Arica y Parinacota': [-18.4783, -70.3126],
  Tarapacá: [-20.2133, -70.1503],
  Antofagasta: [-23.6509, -70.3975],
  Atacama: [-27.3668, -70.3323],
  Coquimbo: [-29.9027, -71.2519],
  Valparaíso: [-33.0472, -71.6127],
  Metropolitana: [-33.4489, -70.6693],
  "O'Higgins": [-34.1708, -70.7444],
  Maule: [-35.4264, -71.6554],
  Ñuble: [-36.6066, -72.1034],
  Biobío: [-36.8201, -73.0444],
  Araucanía: [-38.7359, -72.5904],
  'Los Ríos': [-39.8142, -73.2459],
  'Los Lagos': [-41.4693, -72.9424],
  Aysén: [-45.5752, -72.0662],
  Magallanes: [-53.1638, -70.9171],
}

export const CHILE_CENTER = [-35.5, -71.5]
export const CHILE_INITIAL_ZOOM = 4

/**
 * Offset determinístico (mismo id -> mismo punto siempre) alrededor del
 * centroide regional, solo para separar visualmente puntos de una misma
 * región en el mapa. No representa la ubicación real del incendio.
 */
export function jitterFromId(id, magnitudeDeg = 0.35) {
  const s = Math.sin(id * 12.9898) * 43758.5453
  const frac1 = s - Math.floor(s)
  const s2 = Math.sin(id * 78.233) * 12543.898
  const frac2 = s2 - Math.floor(s2)
  return [(frac1 - 0.5) * 2 * magnitudeDeg, (frac2 - 0.5) * 2 * magnitudeDeg]
}

export function puntoAproximado(inc) {
  const centro = (inc.region && REGION_CENTROIDE[inc.region]) || CHILE_CENTER
  const [dLat, dLng] = jitterFromId(inc.id)
  return [centro[0] + dLat, centro[1] + dLng]
}
