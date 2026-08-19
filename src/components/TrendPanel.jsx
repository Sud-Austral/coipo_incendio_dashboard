import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts'
import { formatDateShort } from '../lib/derive.js'

export function TrendPanel({ data, hourly }) {
  const trend = data.map((d) => ({ ...d, label: formatDateShort(d.fecha) }))
  return <section className="panel trend-panel">
    <div className="panel-heading"><div><span className="panel-kicker">EVOLUCIÓN</span><h2>Inicio de incendios</h2></div><span className="panel-note">últimos {trend.length} días disponibles</span></div>
    <div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><defs><linearGradient id="fireArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b91c1c" stopOpacity={0.22}/><stop offset="100%" stopColor="#b91c1c" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/><XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false}/><Tooltip formatter={(v) => [`${v} incendios`, 'Inicio']} labelFormatter={(l) => `Fecha ${l}`}/><Area type="monotone" dataKey="total" stroke="#b91c1c" fill="url(#fireArea)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div>
    <div className="chart-subheading">Hora de inicio</div>
    <div className="chart-wrap mini"><ResponsiveContainer width="100%" height="100%"><BarChart data={hourly} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}><XAxis dataKey="hora" tick={{ fontSize: 9 }} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{ fontSize: 9 }} axisLine={false} tickLine={false}/><Tooltip formatter={(v) => [`${v}`, 'Incendios']} labelFormatter={(l) => `${String(l).padStart(2,'0')}:00`}/><Bar dataKey="total" fill="#334155" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
  </section>
}
