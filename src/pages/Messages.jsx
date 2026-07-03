import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Mail, MessageSquare } from 'lucide-react'
import { useData } from '../contexts/DataContext'

const MESSAGE_TEMPLATES = [
  {
    id: 'first-contact',
    name: 'Premier contact',
    icon: '👋',
    description: 'Pour un nouveau client qui demande un devis',
    content: `Bonjour {client},

Merci pour votre demande. Je serais ravi de vous accompagner sur votre projet.

Je me permettrai de passer sur place dans les prochains jours pour évaluer précisément les travaux à réaliser et vous proposer un devis détaillé et sans surprise.

Pouvez-vous me confirmer vos disponibilités ?

Cordialement,
{entreprise}
{telephone}`,
  },
  {
    id: 'envoi-devis',
    name: 'Envoi du devis',
    icon: '📄',
    description: 'Quand tu envoies un devis à un client',
    content: `Bonjour {client},

Veuillez trouver ci-joint le devis n° {numero} pour les travaux que nous avons évoqués.

Récapitulatif :
- Montant total TTC : {montant}
- Validité de l'offre : 30 jours
- Démarrage possible : sous 2 semaines après acceptation

N'hésitez pas à me contacter pour toute question.

Cordialement,
{entreprise}`,
  },
  {
    id: 'relance-devis',
    name: 'Relance devis',
    icon: '🔔',
    description: 'Pour relancer un devis envoyé il y a 1-2 semaines',
    content: `Bonjour {client},

Je me permets de revenir vers vous concernant le devis n° {numero} que je vous ai transmis il y a quelques jours.

Avez-vous eu l'occasion d'en prendre connaissance ? Je reste disponible pour en discuter ou pour ajuster l'offre si besoin.

Cordialement,
{entreprise}`,
  },
  {
    id: 'relance-facture',
    name: 'Relance facture impayée',
    icon: '⚠️',
    description: 'Facture en retard de paiement',
    content: `Bonjour {client},

Sauf erreur de ma part, la facture n° {numero} d'un montant de {montant}, échue depuis le {echeance}, ne m'est pas encore parvenue.

Pourriez-vous me confirmer le statut de ce règlement ?

Si le paiement a déjà été effectué, veuillez ne pas tenir compte de ce message.

Cordialement,
{entreprise}`,
  },
  {
    id: 'mise-en-demeure',
    name: 'Mise en demeure',
    icon: '📜',
    description: 'Facture très en retard (2+ relances)',
    content: `Madame, Monsieur,

Par la présente, je vous mets en demeure de procéder au règlement de la facture n° {numero} d'un montant de {montant}, échue depuis le {echeance}, et ce dans un délai de 15 jours à compter de la réception du présent courrier.

À défaut, la procédure de recouvrement judiciaire sera engagée sans autre avis.

Veuillez agréer,
{entreprise}`,
  },
  {
    id: 'merci',
    name: 'Remerciement',
    icon: '🙏',
    description: 'Après un chantier terminé et payé',
    content: `Bonjour {client},

Je tenais à vous remercier pour votre confiance. Le chantier s'est déroulé dans d'excellentes conditions.

Si vous êtes satisfait du travail réalisé, je serais très reconnaissant d'un petit avis sur Google. Cela aide beaucoup les artisans comme moi !

N'hésitez pas à me recontacter pour vos futurs projets.

Cordialement,
{entreprise}`,
  },
]

export default function Messages() {
  const navigate = useNavigate()
  const { getProfile } = useData()
  const [selectedMsg, setSelectedMsg] = useState(null)
  const [copied, setCopied] = useState(false)
  const profile = getProfile()

  function processTemplate(content) {
    return content
      .replace(/{client}/g, '[Nom du client]')
      .replace(/{entreprise}/g, profile.company_name || '[Votre entreprise]')
      .replace(/{telephone}/g, profile.telephone || '[Votre téléphone]')
      .replace(/{numero}/g, '[Numéro du devis/facture]')
      .replace(/{montant}/g, '[Montant TTC]')
      .replace(/{echeance}/g, "[Date d'échéance]")
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => fallbackCopy(text))
    } else {
      fallbackCopy(text)
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try { document.execCommand('copy') } catch (e) {}
    document.body.removeChild(textarea)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">Messages types</h1>
          <p className="text-xs text-slate-500">Gagne du temps sur tes relances</p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-100 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-slate-900">{MESSAGE_TEMPLATES.length} modèles prêts à l'emploi</p>
              <p className="text-xs text-slate-600">Clique sur un modèle pour le personnaliser et le copier</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {MESSAGE_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedMsg(t)}
              className="w-full card hover:shadow-elevated active:scale-[0.98] text-left transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{t.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMsg && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setSelectedMsg(null)}>
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-elevated animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedMsg.icon} {selectedMsg.name}</h3>
                <p className="text-xs text-slate-500">{selectedMsg.description}</p>
              </div>
              <button onClick={() => setSelectedMsg(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              <pre className="card bg-slate-50 whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
{processTemplate(selectedMsg.content)}
              </pre>
              <button
                onClick={() => copyToClipboard(processTemplate(selectedMsg.content))}
                className="btn-primary w-full"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 inline mr-2" /> Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 inline mr-2" /> Copier le message
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 text-center">
                Personnalise les [crochets] avant d'envoyer
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
