import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eraser, Check } from 'lucide-react'
import { useData } from '../contexts/DataContext'

// Page de signature : l'artisan dessine sa signature et on l'intègre dans les PDF.
export default function Signature() {
  const navigate = useNavigate()
  const { getProfile, saveProfile } = useData()
  const canvasRef = useRef(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0F172A'

    const existingSignature = getProfile()?.signature
    if (existingSignature && typeof existingSignature === 'string' && existingSignature.startsWith('data:image')) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasSignature(true)
      }
      img.src = existingSignature
    }
  }, [getProfile])

  function getPoint(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] || e.changedTouches?.[0]
    const clientX = touch ? touch.clientX : e.clientX
    const clientY = touch ? touch.clientY : e.clientY

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function startDraw(e) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const point = getPoint(e)

    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
    setIsDrawing(true)
  }

  function draw(e) {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const point = getPoint(e)

    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    setHasSignature(true)
  }

  function endDraw(e) {
    e?.preventDefault?.()
    setIsDrawing(false)
  }

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  async function saveSignature() {
    if (!hasSignature) {
      alert("Dessine ta signature d'abord")
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    setSaving(true)

    try {
      const dataUrl = canvas.toDataURL('image/png')
      const updatedProfile = { ...getProfile(), signature: dataUrl }

      await saveProfile(updatedProfile)

      alert('✅ Signature enregistrée ! Elle sera ajoutée sur les prochains PDF générés.')
      navigate('/parametres')
    } catch (err) {
      console.error('Erreur sauvegarde signature:', err)
      alert("Erreur pendant l'enregistrement de la signature")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>

        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Ma signature</h1>

        <div className="w-10" />
      </div>

      <div className="px-5 pt-4 space-y-4">
        <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <h3 className="font-bold text-slate-900 text-sm">Dessine ta signature</h3>
          <p className="text-xs text-slate-600 mt-1">
            Elle sera ajoutée aux PDF générés après son enregistrement.
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
            <button onClick={clear} className="btn-secondary flex-1 text-sm" type="button">
              <Eraser className="w-4 h-4 inline mr-2" />
              Effacer
            </button>

            <button
              onClick={saveSignature}
              disabled={!hasSignature || saving}
              className="btn-primary flex-1 text-sm disabled:opacity-50"
              type="button"
            >
              <Check className="w-4 h-4 inline mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>

        <div className="card bg-amber-50 border-amber-200">
          <p className="text-xs text-amber-800">
            <strong>À propos :</strong> cette signature sert à personnaliser les PDF.
            Pour une vraie signature électronique à valeur probante, utilise un service certifié comme <strong>Yousign</strong> ou <strong>DocuSign</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}