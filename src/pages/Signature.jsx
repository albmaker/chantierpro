import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eraser, Check, Download } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { generatePDF } from '../lib/pdfGenerator'

// Page de signature \u00e9lectronique : l'artisan dessine sa signature et on l'int\u00e8gre dans le PDF
export default function Signature() {
  const navigate = useNavigate()
  const { profile, getProfile } = useData()
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signedFor, setSignedFor] = useState({ client: '', numero: '' })

  function startDraw(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    )
    setIsDrawing(true)
  }

  function draw(e) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.lineTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    )
    ctx.strokeStyle = '#0F172A'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    setHasSignature(true)
    e.preventDefault()
  }

  function endDraw() {
    setIsDrawing(false)
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  function saveSignature() {
    if (!hasSignature) {
      alert('Dessine ta signature d\'abord')
      return
    }
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    // Stocke la signature dans le profil
    const updatedProfile = { ...getProfile(), signature: dataUrl }
    profile && Object.assign(profile, updatedProfile)
    // Note: en prod, on sauvegarderait via saveProfile
    localStorage.setItem('chantierpro_profile', JSON.stringify(updatedProfile))
    alert('✅ Signature enregistrée ! Elle apparaîtra sur tous tes prochains PDF.')
    navigate('/parametres')
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Ma signature</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pt-4 space-y-4">
        <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <h3 className="font-bold text-slate-900 text-sm">Dessine ta signature</h3>
          <p className="text-xs text-slate-600 mt-1">
            Elle sera automatiquement intégrée en bas de tous tes devis et factures PDF.
          </p>
        </div>

        <div className="card p-3">
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            className="w-full h-40 bg-white border-2 border-dashed border-slate-300 rounded-xl cursor-crosshair touch-none"
          />
          <div className="flex gap-2 mt-3">
            <button onClick={clear} className="btn-secondary flex-1 text-sm">
              <Eraser className="w-4 h-4 inline mr-2" />
              Effacer
            </button>
            <button onClick={saveSignature} disabled={!hasSignature} className="btn-primary flex-1 text-sm disabled:opacity-50">
              <Check className="w-4 h-4 inline mr-2" />
              Enregistrer
            </button>
          </div>
        </div>

        <div className="card bg-amber-50 border-amber-200">
          <p className="text-xs text-amber-800">
            <strong>À propos :</strong> En France, la signature électronique manuscrite (sur tablette/téléphone) n'a pas de valeur juridique.
            Pour une vraie signature électronique, utilise des services comme <strong>Yousign</strong> ou <strong>DocuSign</strong>.
            Cette fonctionnalité permet surtout de <strong>personnaliser tes PDF</strong> avec ton paraphe.
          </p>
        </div>
      </div>
    </div>
  )
}
