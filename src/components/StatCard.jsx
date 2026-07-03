export default function StatCard({ label, value, suffix, color = 'text-slate-900', icon, trend, trendDown }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{label}</span>
        {icon && <span className="text-chantier opacity-70">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
        {suffix && <span className="text-sm text-slate-500 font-normal ml-1">{suffix}</span>}
      </div>
      {trend && (
        <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
          ↑ {trend}
        </div>
      )}
      {trendDown && (
        <div className="text-[10px] text-red-600 font-semibold mt-1 flex items-center gap-0.5">
          ↓ {trendDown}
        </div>
      )}
    </div>
  )
}
