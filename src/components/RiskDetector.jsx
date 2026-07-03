import { useMemo } from 'react'
import { AlertTriangle, Info, Sparkles } from 'lucide-react'
import { analyzeDevisRisk } from '../lib/riskAnalyzer'

// Composant qui affiche les alertes intelligentes avant envoi d'un devis
export default function RiskDetector({ devis, allDevis, allFactures, compact = false }) {
  const { risks, infos } = useMemo(() => {
    try {
      return analyzeDevisRisk(devis, allDevis || [], allFactures || [])
    } catch (e) {
      return { risks: [], infos: [] }
    }
  }, [devis, allDevis, allFactures])

  if (risks.length === 0 && infos.length === 0) return null

  const levelStyles = {
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-600' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: 'text-amber-600' },
    low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' },
    info: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: 'text-emerald-600' },
  }

  return (
    <div className="space-y-2">
      {risks.length > 0 && (
        <div className={`card border-2 ${compact ? 'p-3' : ''} bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-bold text-slate-900">Analyse avant envoi</h3>
            <span className="badge bg-orange-100 text-orange-700 text-[10px]">
              {risks.length} alerte{risks.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mb-3">
            Basé sur ton historique et la réglementation en vigueur
          </p>

          {risks.map((risk, i) => {
            const styles = levelStyles[risk.level]
            return (
              <div key={i} className={`${styles.bg} ${styles.border} border rounded-xl p-3 mb-2`}>
                <div className="flex items-start gap-2">
                  <div className="text-xl flex-shrink-0">{risk.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold ${styles.text}`}>{risk.title}</h4>
                    <p className="text-xs text-slate-700 mt-1">{risk.message}</p>
                    {risk.suggestion && (
                      <p className="text-[11px] text-slate-600 mt-1.5 italic">
                        💡 {risk.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {infos.length > 0 && (
        <div className="space-y-2">
          {infos.map((info, i) => {
            const styles = levelStyles.info
            return (
              <div key={i} className={`${styles.bg} ${styles.border} border rounded-xl p-3`}>
                <div className="flex items-start gap-2">
                  <div className="text-lg flex-shrink-0">{info.icon}</div>
                  <div className="flex-1">
                    <h4 className={`text-xs font-bold ${styles.text}`}>{info.title}</h4>
                    <p className="text-[11px] text-slate-700 mt-0.5">{info.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
