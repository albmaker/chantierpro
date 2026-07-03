import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileJson, FileSpreadsheet, FileText, Database, CheckCircle2, Shield } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { exportToJSON, exportDevisToCSV, exportFacturesToCSV, exportClientsToCSV } from '../lib/exportData'

export default function ExportData() {
  const navigate = useNavigate()
  const { devis, factures, clients, profile, activity } = useData()
  const [lastExport, setLastExport] = useState(null)

  function handleExport(action) {
    try {
      action()
      setLastExport({
        type: 'success',
        message: 'Export téléchargé !',
      })
      setTimeout(() => setLastExport(null), 3000)
    } catch (err) {
      setLastExport({
        type: 'error',
        message: 'Erreur : ' + err.message,
      })
    }
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Exporter mes données</h1>
      </div>

      <div className="px-5 pt-4 space-y-4">
        <div className="card bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-800 border-blue-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Droit à la portabilité (RGPD)</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Tes données t'appartiennent. Tu peux les télécharger à tout moment dans un format ouvert et lisible.
              </p>
            </div>
          </div>
        </div>

        {lastExport && (
          <div className={`card animate-slide-up ${lastExport.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-700">{lastExport.message}</p>
            </div>
          </div>
        )}

        {/* Export complet JSON */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Database className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white">Export complet (JSON)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Toutes tes donn\u00e9es en un fichier</p>
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 mb-3">
            <p>\u2022 {profile?.company_name || 'Ton profil'}</p>
            <p>\u2022 {devis.length} devis</p>
            <p>\u2022 {factures.length} factures</p>
            <p>\u2022 {clients.length} clients</p>
            <p>\u2022 Historique d'activit\u00e9</p>
          </div>
          <button
            onClick={() => handleExport(() => exportToJSON({ profile, devis, factures, clients, activity }))}
            className="btn-primary w-full"
          >
            <FileJson className="w-4 h-4 inline mr-2" />
            T\u00e9l\u00e9charger le JSON
          </button>
          <p className="text-[10px] text-slate-500 text-center mt-2">
            Format standard, lisible par n'importe quel outil
          </p>
        </div>

        {/* Exports CSV sp\u00e9cifiques */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white">Exports CSV (Excel / Compta)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Format compatible avec tous les tableurs</p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleExport(() => exportDevisToCSV(devis, clients))}
              disabled={devis.length === 0}
              className="w-full card hover:shadow-elevated active:scale-[0.98] text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-chantier" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Mes devis</p>
                  <p className="text-xs text-slate-500">{devis.length} ligne{devis.length > 1 ? 's' : ''}</p>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            <button
              onClick={() => handleExport(() => exportFacturesToCSV(factures))}
              disabled={factures.length === 0}
              className="w-full card hover:shadow-elevated active:scale-[0.98] text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Mes factures</p>
                  <p className="text-xs text-slate-500">{factures.length} ligne{factures.length > 1 ? 's' : ''}</p>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            <button
              onClick={() => handleExport(() => exportClientsToCSV(clients))}
              disabled={clients.length === 0}
              className="w-full card hover:shadow-elevated active:scale-[0.98] text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Mes clients</p>
                  <p className="text-xs text-slate-500">{clients.length} contact{clients.length > 1 ? 's' : ''}</p>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          </div>
        </div>

        <div className="card bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">\ud83d\udca1 Astuce</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Les exports CSV sont parfaits pour envoyer \u00e0 ton comptable ou importer dans Excel / Google Sheets.
            L'export JSON contient tout, y compris les param\u00e8tres, pour une sauvegarde compl\u00e8te.
          </p>
        </div>
      </div>
    </div>
  )
}
