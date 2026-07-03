export default function StatCard({ label, value, suffix, color = 'text-white', icon, trend }) {
  return (
    <div className="card flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{label}</span>
        {icon && <span className="text-chantier opacity-80">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
        {suffix && <span className="text-sm text-gray-400 font-normal ml-1">{suffix}</span>}
      </div>
      {trend && <span className="text-[10px] text-green-400 font-medium">↑ {trend}</span>}
    </div>
  )
}
