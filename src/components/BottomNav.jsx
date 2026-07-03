import { NavLink } from 'react-router-dom'
import { Home, FileText, Receipt, BarChart3, Settings, Plus } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Accueil' },
  { to: '/devis', icon: FileText, label: 'Devis' },
  { to: '/nouveau-devis', icon: Plus, label: 'Créer', special: true },
  { to: '/factures', icon: Receipt, label: 'Factures' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-elevated">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          if (item.special) {
            return (
              <NavLink key={item.to} to={item.to} className="flex flex-col items-center -mt-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-chantier to-chantier-dark flex items-center justify-center shadow-lg shadow-chantier/30 active:scale-95 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </NavLink>
            )
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-[60px] ${
                  isActive ? 'text-chantier' : 'text-slate-500 hover:text-slate-700'
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
