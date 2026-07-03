import { NavLink } from 'react-router-dom'
import { Home, FileText, Camera, Receipt, Settings } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Accueil' },
  { to: '/devis', icon: FileText, label: 'Devis' },
  { to: '/scanner', icon: Camera, label: 'Scan IA', special: true },
  { to: '/factures', icon: Receipt, label: 'Factures' },
  { to: '/parametres', icon: Settings, label: 'Plus' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-navy-800/95 backdrop-blur-lg border-t border-navy-700/50 safe-area-bottom">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          if (item.special) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center -mt-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-chantier to-chantier-dark flex items-center justify-center shadow-lg shadow-chantier/40 active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-medium text-chantier mt-1">{item.label}</span>
              </NavLink>
            )
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                  isActive ? 'text-chantier' : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-chantier' : ''}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
