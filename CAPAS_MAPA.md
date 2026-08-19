# Mejora: Capas de contexto territorial

Esta versión agrega un selector de capas al mapa operacional sin modificar el algoritmo de prioridad de incendios.

## Disponible inmediatamente

- Incendios del dataset local: activar/desactivar.
- Mapas base: Calles, Satélite y Topográfico.
- NASA FIRMS / VIIRS: integración WMS preparada. Requiere `VITE_FIRMS_MAP_KEY`.

## Capas territoriales oficiales

El frontend está preparado para cargar estos archivos desde `public/data/`:

- `riesgo.geojson`
- `interfaz.geojson`

Los archivos incluidos están vacíos a propósito para no fabricar ni sustituir cartografía oficial. Una vez convertidas las coberturas oficiales a GeoJSON, reemplaza estos dos archivos conservando los nombres.

### Propiedades de riesgo reconocidas

La simbología intenta leer cualquiera de estas propiedades: `riesgo`, `Riesgo` o `nivel`, interpretando valores como Muy Alto, Alto, Medio/Moderado y Bajo.

## NASA FIRMS

1. Obtén una MAP_KEY oficial de NASA FIRMS.
2. Copia `.env.example` como `.env`.
3. Completa `VITE_FIRMS_MAP_KEY=...`.
4. Reinicia Vite.
5. Abre `Capas` y activa `Focos satelitales`.

## Regla de diseño

Las capas de contexto son visuales en esta versión. No incrementan ni reducen el ranking de prioridad de un incendio. La integración con el algoritmo queda para una iteración posterior, después de validar utilidad y calidad de los datos territoriales.
