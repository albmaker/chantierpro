import { Search, X, ArrowLeft } from 'lucide-react'

export default function Header({ title, subtitle, search, onSearchChange, action, onBack }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
        </div>
        {search !== undefined && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher un client, un numéro..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-chantier focus:ring-2 focus:ring-chantier/20 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-slate-600" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
