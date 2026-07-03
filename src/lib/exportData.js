// Service d'export des donn\u00e9es (RGPD)
import { computeTotals } from '../components/DevisCard'

export function exportToJSON(data) {
  const exportData = {
    export_date: new Date().toISOString(),
    app: 'ChantierPro',
    version: '1.0',
    profile: data.profile,
    devis: data.devis,
    factures: data.factures,
    clients: data.clients,
    activity: data.activity,
  }

  const jsonStr = JSON.stringify(exportData, null, 2)
  downloadFile(jsonStr, `chantierpro-export-${new Date().toISOString().slice(0,10)}.json`, 'application/json')
}

export function exportDevisToCSV(devis, clients) {
  const headers = ['Num\u00e9ro', 'Date', 'Validit\u00e9', 'Client', 'Email', 'T\u00e9l\u00e9phone', 'M\u00e9tier', 'Statut', 'Total HT', 'Total TVA', 'Total TTC', 'Nombre de lignes', 'Notes']
  const rows = devis.map(d => {
    const totals = computeTotals(d.lignes)
    return [
      d.numero || '',
      d.date_emission || '',
      d.date_validite || '',
      d.client_nom || '',
      d.client_email || '',
      d.client_tel || '',
      d.metier || '',
      d.statut || '',
      totals.totalHT.toFixed(2),
      totals.totalTVA.toFixed(2),
      totals.totalTTC.toFixed(2),
      d.lignes?.length || 0,
      (d.notes || '').replace(/"/g, '""').replace(/\n/g, ' '),
    ]
  })

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  downloadFile(csv, `chantierpro-devis-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8')
}

export function exportFacturesToCSV(factures) {
  const headers = ['Num\u00e9ro', 'Date \u00e9mission', 'Date \u00e9ch\u00e9ance', 'Date paiement', 'Client', 'M\u00e9tier', 'Statut', 'Total HT', 'Total TVA', 'Total TTC']
  const rows = factures.map(f => {
    const totals = computeTotals(f.lignes)
    return [
      f.numero || '',
      f.date_emission || '',
      f.date_echeance || '',
      f.date_paiement || '',
      f.client_nom || '',
      f.metier || '',
      f.statut || '',
      totals.totalHT.toFixed(2),
      totals.totalTVA.toFixed(2),
      totals.totalTTC.toFixed(2),
    ]
  })

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  downloadFile(csv, `chantierpro-factures-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8')
}

export function exportClientsToCSV(clients) {
  const headers = ['Nom', 'Email', 'T\u00e9l\u00e9phone', 'Adresse', 'Nombre de devis', 'Cr\u00e9\u00e9 le', 'Derni\u00e8re interaction']
  const rows = clients.map(c => [
    c.nom || '',
    c.email || '',
    c.telephone || '',
    c.adresse || '',
    c.total_devis || 0,
    c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '',
    c.derniere_interaction ? new Date(c.derniere_interaction).toLocaleDateString('fr-FR') : '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  downloadFile(csv, `chantierpro-clients-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv;charset=utf-8')
}

function downloadFile(content, filename, mimeType) {
  // BOM pour Excel (UTF-8)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
