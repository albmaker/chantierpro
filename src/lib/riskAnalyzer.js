// Service de détection de risques avant envoi de devis
// Analyse 100% locale sur les données existantes (pas d'invention)
// Sources : devis historique, factures, statuts paiement, profil

import { computeTotals } from '../components/DevisCard'

export function analyzeDevisRisk(devis, allDevis, allFactures) {
  const risks = []
  const infos = []

  if (!devis || !devis.lignes || devis.lignes.length === 0) {
    return { risks: [{ level: 'high', icon: '⚠️', title: 'Devis vide', message: 'Ajoute au moins une ligne avant d\'envoyer.' }], infos: [] }
  }

  const { totalHT, totalTTC } = computeTotals(devis.lignes)
  const metier = devis.metier
  const clientNom = devis.client_nom

  // 1. Vérifier le prix par rapport à l'historique du même métier
  if (allDevis && allDevis.length >= 3 && metier) {
    const memesMetier = allDevis.filter(d =>
      d.metier === metier &&
      d.id !== devis.id &&
      d.lignes && d.lignes.length > 0
    )

    if (memesMetier.length >= 2) {
      const prixMoyens = memesMetier.map(d => {
        const t = computeTotals(d.lignes).totalHT
        const surface = d.lignes.reduce((s, l) => {
          if (l.unit === 'm²') return s + l.qty
          return s
        }, 0)
        return surface > 0 ? t / surface : null
      }).filter(p => p !== null)

      if (prixMoyens.length >= 1) {
        const prixMoyenM2 = prixMoyens.reduce((s, p) => s + p, 0) / prixMoyens.length
        const surfaceDevis = devis.lignes.reduce((s, l) => l.unit === 'm²' ? s + l.qty : s, 0)

        if (surfaceDevis > 0 && prixMoyenM2 > 0) {
          const prixM2Devis = totalHT / surfaceDevis
          const ecart = ((prixM2Devis - prixMoyenM2) / prixMoyenM2) * 100

          if (ecart < -15) {
            risks.push({
              level: 'medium',
              icon: '📉',
              title: 'Prix bas par rapport à ta moyenne',
              message: `Tu factures ${Math.abs(Math.round(ecart))}% de moins que d'habitude sur du ${metier} (${prixM2Devis.toFixed(0)}€/m² vs ${prixMoyenM2.toFixed(0)}€/m² en moyenne). Es-tu sûr de ton chiffrage ?`,
              suggestion: 'Vérifie que tu n\'as pas oublié de prestation.',
            })
          } else if (ecart > 20) {
            risks.push({
              level: 'low',
              icon: '💰',
              title: 'Prix élevé par rapport à ta moyenne',
              message: `Tu factures ${Math.round(ecart)}% de plus que d'habitude sur du ${metier}. Assure-toi que le client accepte ce niveau de prix.`,
            })
          } else {
            infos.push({
              icon: '✅',
              title: 'Prix cohérent',
              message: `Ton prix (${prixM2Devis.toFixed(0)}€/m²) est dans la moyenne de tes devis ${metier}.`,
            })
          }
        }
      }
    }
  }

  // 2. Vérifier l'historique de paiement du client
  if (clientNom && allFactures) {
    const facturesClient = allFactures.filter(f =>
      f.client_nom?.toLowerCase() === clientNom.toLowerCase() && f.statut === 'en_retard'
    )

    if (facturesClient.length >= 1) {
      risks.push({
        level: 'high',
        icon: '💸',
        title: `${facturesClient.length} facture(s) en retard avec ce client`,
        message: `Ce client a déjà ${facturesClient.length} facture(s) impayée(s). Envisage un acompte plus élevé (40-50%) ou des conditions de paiement plus strictes.`,
        suggestion: 'Ajoute une mention "Acompte 50% à la commande" dans les CGV.',
      })
    }

    // Client avec historique de paiement tardif (mais pas encore en retard)
    const facturesEnAttente = allFactures.filter(f =>
      f.client_nom?.toLowerCase() === clientNom.toLowerCase() &&
      f.statut === 'en_attente' &&
      f.date_echeance
    )

    const aujourdHui = new Date().toISOString().slice(0, 10)
    const facturesProchesRetard = facturesEnAttente.filter(f => {
      const echeance = new Date(f.date_echeance)
      const diff = (echeance - new Date(aujourdHui)) / (1000 * 60 * 60 * 24)
      return diff < 7 && diff > -30 // Moins d'une semaine avant échéance
    })

    if (facturesProchesRetard.length >= 1 && facturesClient.length === 0) {
      infos.push({
        icon: '⏰',
        title: 'Facture bientôt en retard',
        message: `Tu as ${facturesProchesRetard.length} facture(s) qui arrive(nt) à échéance dans moins de 7 jours. Pense à relancer.`,
      })
    }
  }

  // 3. Vérifier les mentions légales (TVA)
  const has5or5 = devis.lignes.some(l => l.tva === 5.5)
  const has10 = devis.lignes.some(l => l.tva === 10)
  const has20 = devis.lignes.some(l => l.tva === 20)

  if (has5or5) {
    risks.push({
      level: 'high',
      icon: '📜',
      title: 'TVA 5,5% : mention légale obligatoire',
      message: 'Le taux réduit à 5,5% nécessite une attestation du client (logement > 2 ans, travaux d\'amélioration énergétique). Sans ce document, tu risques un redressement fiscal.',
      suggestion: 'Télécharge le modèle d\'attestation sur impots.gouv.fr et fais-le signer.',
    })
  }

  if (has10 && metier === 'maconnerie') {
    const hasOutdoor = devis.lignes.some(l => {
      // Heuristique simple : si label contient "façade", "extérieur", "toit"
      const label = (l.label || '').toLowerCase()
      return label.includes('façade') || label.includes('toit') || label.includes('terrasse') || label.includes('extérieur')
    })
    if (hasOutdoor) {
      risks.push({
        level: 'high',
        icon: '⚠️',
        title: 'TVA 10% peut être contestée',
        message: 'La TVA à 10% ne s\'applique pas aux travaux extérieurs (façade, toiture). Le taux devrait être 20%.',
        suggestion: 'Sépare les lignes intérieures (TVA 10%) et extérieures (TVA 20%).',
      })
    }
  }

  // 4. Vérifier l'acompte
  const totalDevis = allDevis.filter(d => d.id !== devis.id && d.statut === 'accepte')
  if (totalDevis.length >= 2) {
    const clientEstNouveau = !allDevis.find(d =>
      d.client_nom?.toLowerCase() === clientNom?.toLowerCase() && d.id !== devis.id
    )
    if (clientEstNouveau) {
      infos.push({
        icon: '💡',
        title: 'Nouveau client',
        message: 'C\'est un nouveau client. Pense à demander un acompte (30-50%) pour sécuriser ton engagement.',
      })
    }
  }

  // 5. Vérifier la cohérence des quantités
  const incoherences = []
  for (const ligne of devis.lignes) {
    if (ligne.qty > 1000 && ligne.unit === 'u') {
      incoherences.push(`"${ligne.label}" : quantité de ${ligne.qty} unités, c'est beaucoup. Vérifie.`)
    }
    if (ligne.qty > 500 && ligne.unit === 'm²') {
      incoherences.push(`"${ligne.label}" : ${ligne.qty}m², c'est énorme (équivalent à un grand terrain). Vérifie.`)
    }
    if (ligne.priceHT > 5000 && ligne.unit === 'u') {
      incoherences.push(`"${ligne.label}" : ${ligne.priceHT}€ l'unité, c'est élevé. Vérifie que c'est pas un forfait.`)
    }
  }

  if (incoherences.length > 0) {
    risks.push({
      level: 'medium',
      icon: '🔍',
      title: 'Quantités ou prix à vérifier',
      message: incoherences.join(' • '),
    })
  }

  // 6. Marge si on peut la calculer (prix marché vs prix devis)
  // (Simplifié : on prévient juste si le total semble anormalement bas)
  if (totalTTC < 50 && devis.lignes.length > 0) {
    risks.push({
      level: 'low',
      icon: '⚠️',
      title: 'Devis très bas',
      message: `Total de seulement ${totalTTC.toFixed(2)}€. Vérifie que ça couvre bien tous tes frais (déplacement, matériel, main d'œuvre).`,
    })
  }

  // Trier par niveau de risque
  const levelOrder = { high: 0, medium: 1, low: 2 }
  risks.sort((a, b) => levelOrder[a.level] - levelOrder[b.level])

  return { risks, infos }
}
