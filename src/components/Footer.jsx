export function Footer({ temporada, onRefresh, maxDataDate, recordCount }) {
  return <footer className="app-footer"><span>Temporada {temporada} · fuente local de incendios formalizados · {recordCount.toLocaleString('es-CL')} registros analizados</span><button onClick={onRefresh}>↻ Actualizar datos</button><span>Último registro disponible: {maxDataDate || '--'}</span></footer>
}
