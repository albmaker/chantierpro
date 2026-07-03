import { FileText, Plus, Sparkles } from 'lucide-react'

export default function EmptyState({ icon: Icon = FileText, title, description, actionLabel, onAction, secondaryLabel, onSecondary }) {
  return (
    <div className="card text-center py-12 px-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-navy-700 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-chantier" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary w-full max-w-xs mx-auto">
          <Plus className="w-4 h-4 inline mr-2" />
          {actionLabel}
        </button>
      )}
      {secondaryLabel && onSecondary && (
        <button
          onClick={onSecondary}
          className="text-sm text-chantier hover:underline mt-3 inline-flex items-center gap-1"
        >
          <Sparkles className="w-4 h-4" />
          {secondaryLabel}
        </button>
      )}
    </div>
  )
}
