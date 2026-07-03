import { Search, X } from 'lucide-react'

export default function Header({ title, subtitle, search, onSearchChange, action }) {
  return (
    <header className="sticky top-0 z-30 bg-navy-800/90 backdrop-blur-lg border-b border-navy-700/50">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {action}
          </div>
        </div>
        {search !== undefined && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-navy-700/60 border border-navy-600 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:border-chantier focus:outline-none"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
