import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Mail, Phone, MapPin, FileText, Trash2, Edit2, X, User } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

export default function Clients() {
  const navigate = useNavigate()
  const { clients, devis, addClient, updateClient, deleteClient } = useData()
  const [search, setSearch] = useState('')
  const [editingClient, setEditingClient] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim()
    if (!s) return clients
    return clients.filter(c =>
      (c.nom || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s) ||
      (c.telephone || '').toLowerCase().includes(s)
    )
  }, [clients, search])

  const getClientDevis = (clientId) => {
    return devis.filter(d => d.client_nom === clients.find(c => c.id === clientId)?.nom)
  }

  return (
    <div className="pb-24">
      <Header
        title="Mes clients"
        subtitle={`${clients.length} contact${clients.length > 1 ? 's' : ''}`}
        search={search}
        onSearchChange={setSearch}
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="w-11 h-11 rounded-full bg-chantier flex items-center justify-center shadow-soft active:scale-95"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      <div className="px-5 pt-4">
        {clients.length === 0 ? (
          <EmptyState
            icon={User}
            title="Aucun client pour l'instant"
            description="Vos clients apparaîtront ici automatiquement quand vous créerez des devis."
            actionLabel="Créer un devis"
            onAction={() => navigate('/nouveau-devis')}
          />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Aucun client pour "{search}"</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(c => {
              const clientDevis = getClientDevis(c.id)
              return (
                <div key={c.id} className="card">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-chantier-100 to-chantier/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-chantier font-bold text-lg">
                        {c.nom?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{c.nom}</h3>
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 hover:text-chantier">
                          <Mail className="w-3 h-3" /> {c.email}
                        </a>
                      )}
                      {c.telephone && (
                        <a href={`tel:${c.telephone}`} className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 hover:text-chantier">
                          <Phone className="w-3 h-3" /> {c.telephone}
                        </a>
                      )}
                      {c.adresse && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3" /> {c.adresse}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                        <FileText className="w-3 h-3" />
                        <span>{clientDevis.length} devis</span>
                        <span>•</span>
                        <span>Depuis {new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setEditingClient(c)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer ${c.nom} ?`)) deleteClient(c.id)
                        }}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ClientFormModal
        open={showAddModal || !!editingClient}
        onClose={() => { setShowAddModal(false); setEditingClient(null) }}
        client={editingClient}
        onSave={(data) => {
          if (editingClient) {
            updateClient(editingClient.id, data)
          } else {
            addClient(data)
          }
          setShowAddModal(false)
          setEditingClient(null)
        }}
      />
    </div>
  )
}

function ClientFormModal({ open, onClose, client, onSave }) {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
  })

  useEffect(() => {
    if (client) {
      setForm({
        nom: client.nom || '',
        email: client.email || '',
        telephone: client.telephone || '',
        adresse: client.adresse || '',
      })
    } else {
      setForm({ nom: '', email: '', telephone: '', adresse: '' })
    }
  }, [client, open])

  return (
    <Modal open={open} onClose={onClose} title={client ? 'Modifier le client' : 'Nouveau client'}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.nom.trim()) {
            alert('Le nom est obligatoire')
            return
          }
          onSave(form)
        }}
        className="space-y-3"
      >
        <div>
          <label className="label">Nom *</label>
          <input
            className="input"
            placeholder="M. Dupont Bernard"
            value={form.nom}
            onChange={e => setForm({ ...form, nom: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="email@exemple.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Téléphone</label>
          <input
            className="input"
            placeholder="06 12 34 56 78"
            value={form.telephone}
            onChange={e => setForm({ ...form, telephone: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Adresse</label>
          <input
            className="input"
            placeholder="12 rue des Lilas, 75011 Paris"
            value={form.adresse}
            onChange={e => setForm({ ...form, adresse: e.target.value })}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button type="submit" className="btn-primary flex-1">{client ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </form>
    </Modal>
  )
}

function useEffect2(fn, deps) {
  useEffect(fn, deps)
}
