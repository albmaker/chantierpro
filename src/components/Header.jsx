import { Bell, Search } from 'lucide-react'

export default function Header({ title, subtitle, action }) {
  return (
    <header className="sticky top-0 z-30 bg-navy-800/80 backdrop-blur-lg border-b border-navy-700/50 px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <button className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center hover:bg-navy-600 transition-colors">
            <Search className="w-5 h-5 text-gray-300" />
          </button>
          <button className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center hover:bg-navy-600 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-300" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-chantier rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}
