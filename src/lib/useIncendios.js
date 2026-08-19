import { useCallback, useEffect, useRef, useState } from 'react'
import { ungzip } from 'pako'

const DATA_URL = '/data/incendios.json.gz'
const REFRESH_MS = 5 * 60 * 1000

/**
 * Carga y descomprime frontend/public/data/incendios.json.gz.
 * Refresca automáticamente cada 5 minutos (mismo archivo estático — asume que
 * el ETL lo regenera en el servidor con esa cadencia).
 */
export function useIncendios() {
  const [state, setState] = useState({ data: null, loading: true, error: null, lastUpdated: null })
  const cancelledRef = useRef(false)

  const load = useCallback(() => {
    return fetch(DATA_URL, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`No se pudo cargar ${DATA_URL} (HTTP ${res.status})`)
        return res.arrayBuffer()
      })
      .then((buf) => {
        const bytes = new Uint8Array(buf)
        // Si el servidor declara Content-Encoding: gzip (típico sirviendo un
        // .gz estático), el navegador ya lo descomprime por transporte y acá
        // llegan los bytes planos del JSON — descomprimir de nuevo con pako
        // rompería (magic header inválido). Solo usamos pako si los bytes
        // siguen siendo gzip real (magic 0x1f 0x8b).
        const esGzip = bytes[0] === 0x1f && bytes[1] === 0x8b
        const json = esGzip ? ungzip(bytes, { to: 'string' }) : new TextDecoder('utf-8').decode(bytes)
        return JSON.parse(json)
      })
      .then((data) => {
        if (!cancelledRef.current) {
          setState({ data, loading: false, error: null, lastUpdated: new Date() })
        }
      })
      .catch((error) => {
        if (!cancelledRef.current) {
          setState((prev) => ({ ...prev, loading: false, error }))
        }
      })
  }, [])

  useEffect(() => {
    cancelledRef.current = false
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      cancelledRef.current = true
      clearInterval(id)
    }
  }, [load])

  return { ...state, refetch: load }
}
