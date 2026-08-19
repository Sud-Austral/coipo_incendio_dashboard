import { formatHa } from '../lib/derive.js'

export function SeasonPanel({ current, previous, currentLabel, previousLabel }) {
  const delta = previous.total ? ((current.total - previous.total) / previous.total) * 100 : null
  const deltaHa = previous.superficieHa ? ((current.superficieHa - previous.superficieHa) / previous.superficieHa) * 100 : null
  return <section className="panel season-panel"><div className="panel-heading"><div><span className="panel-kicker">CONTEXTO</span><h2>Comparación de temporadas</h2></div></div><div className="season-compare"><div><span>{currentLabel}</span><strong>{current.total}</strong><small>{formatHa(current.superficieHa)} ha</small></div><div className="season-vs">vs.</div><div><span>{previousLabel}</span><strong>{previous.total}</strong><small>{formatHa(previous.superficieHa)} ha</small></div></div><div className="delta-row"><span>Variación incendios</span><b className={delta !== null && delta > 0 ? 'up' : 'down'}>{delta === null ? '--' : `${delta > 0 ? '+' : ''}${delta.toFixed(0)}%`}</b><span>Superficie</span><b className={deltaHa !== null && deltaHa > 0 ? 'up' : 'down'}>{deltaHa === null ? '--' : `${deltaHa > 0 ? '+' : ''}${deltaHa.toFixed(0)}%`}</b></div></section>
}
