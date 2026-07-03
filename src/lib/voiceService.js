// Service de transcription vocale + structuration IA
// Web Speech API pour la transcription (Chrome/Edge requis)
// Mistral AI pour la structuration en lignes de devis

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'
const MODEL = 'mistral-small-latest'

const SYSTEM_PROMPT = `Tu es un assistant pour artisans du BTP français. Tu transformes des descriptions vocales en lignes de devis structurées.

Tu reçois une transcription vocale d'un artisan qui décrit un chantier.
Tu dois extraire :
- Le métier principal (plomberie, electricite, peinture, maconnerie)
- Les ouvrages à réaliser avec quantités et unités
- Pour chaque ouvrage, mapper vers la bibliothèque de références fournie

Tu réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "metier": "plomberie|electricite|peinture|maconnerie",
  "description": "résumé court en 1 phrase",
  "ouvrages": [
    {
      "ref": "référence de la bibliothèque (ex: PLO-001) ou CUSTOM",
      "label": "description courte",
      "qty": nombre,
      "unit": "u|m²|ml|forfait|m³",
      "priceHT": prix HT estimé en euros,
      "tva": 0|5.5|10|20,
      "matched": true|false
    }
  ]
}

RÈGLES IMPORTANTES :
1. Si l'artisan mentionne des mètres carrés, utilise unit="m²"
2. Si c'est "il faut changer X", qty=1, unit="u" ou "forfait"
3. TVA par défaut : 10% pour rénovation logement > 2 ans, 20% pour extérieur
4. Si tu ne reconnais pas un ouvrage, mets ref="CUSTOM" et matched=false
5. Sois généreux dans les ouvrages
6. Quantités réalistes
7. Réponds UNIQUEMENT le JSON, rien d'autre`

/**
 * V\u00e9rifie si la Web Speech API est disponible
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Crée une instance de reconnaissance vocale
 * Retourne un objet avec start(), stop() et des events
 */
export function createSpeechRecognizer({
  onResult,        // (transcript, isFinal) => void
  onError,          // (error) => void
  onEnd,            // () => void
  lang = 'fr-FR',
} = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    return null
  }

  const recognition = new SpeechRecognition()
  recognition.lang = lang
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  let finalTranscript = ''

  recognition.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' '
        if (onResult) onResult(finalTranscript.trim(), true)
      } else {
        interim += transcript
        if (onResult) onResult((finalTranscript + interim).trim(), false)
      }
    }
  }

  recognition.onerror = (event) => {
    if (onError) onError(event.error || 'Erreur micro inconnue')
  }

  recognition.onend = () => {
    if (onEnd) onEnd()
  }

  return {
    start: () => {
      try {
        finalTranscript = ''
        recognition.start()
      } catch (e) {
        if (onError) onError(e.message)
      }
    },
    stop: () => {
      try { recognition.stop() } catch (e) {}
    },
    abort: () => {
      try { recognition.abort() } catch (e) {}
    },
  }
}

/**
 * Structure une transcription vocale en lignes de devis via Mistral AI
 */
export async function structureTranscription(transcript, ouvragesBiblio) {
  if (!transcript || !transcript.trim()) {
    throw new Error('Transcription vide')
  }

  const biblioText = Object.entries(ouvragesBiblio).map(([metier, ouvrages]) => {
    return `${metier.toUpperCase()}:\n${ouvrages.map(o =>
      `  ${o.ref}: ${o.label} (${o.priceHT}€/${o.unit}, TVA ${o.tva}%)`
    ).join('\n')}`
  }).join('\n\n')

  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY || 'HrR4xJOLz3ub7W62tw7nytM7PLXkGZ14'

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + '\n\nBIBLIOTHÈQUE:\n' + biblioText },
        { role: 'user', content: `Transcription vocale de l'artisan :\n\n"${transcript}"\n\nGénère le JSON.` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Mistral API error: ${response.status} - ${errText.substring(0, 200)}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  return JSON.parse(content)
}

// Fallback : structuration locale basique
export function structureLocally(transcript) {
  const text = transcript.toLowerCase()
  const result = { metier: 'plomberie', description: transcript.substring(0, 100), ouvrages: [] }

  if (text.includes('électric') || text.includes('prises') || text.includes('tableau')) {
    result.metier = 'electricite'
  } else if (text.includes('peintur') || text.includes('peindre') || text.includes('mur')) {
    result.metier = 'peinture'
  } else if (text.includes('carrelage') || text.includes('cloison') || text.includes('placo')) {
    result.metier = 'maconnerie'
  }

  const surfaceMatch = text.match(/(\d+)\s*(mètre|m2|m²|metre)/)
  const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : 0

  const keywords = {
    'wc': { ref: 'PLO-001', label: 'Pose WC suspendu', unit: 'forfait', tva: 10, priceHT: 450 },
    'baignoire': { ref: 'PLO-009', label: 'Pose baignoire', unit: 'u', tva: 10, priceHT: 340 },
    'douche': { ref: 'PLO-006', label: 'Installation douche', unit: 'forfait', tva: 10, priceHT: 780 },
    'chauffe-eau': { ref: 'PLO-002', label: 'Chauffe-eau', unit: 'u', tva: 10, priceHT: 380 },
    'robinetterie': { ref: 'PLO-003', label: 'Pose robinetterie', unit: 'u', tva: 10, priceHT: 85 },
    'prise': { ref: 'ELE-001', label: 'Prise électrique 16A', unit: 'u', tva: 10, priceHT: 65 },
    'lumière': { ref: 'ELE-002', label: 'Point lumineux', unit: 'u', tva: 10, priceHT: 85 },
    'tableau': { ref: 'ELE-003', label: 'Tableau électrique', unit: 'u', tva: 10, priceHT: 420 },
    'vmc': { ref: 'ELE-005', label: 'Pose VMC', unit: 'u', tva: 10, priceHT: 380 },
    'peinture': { ref: 'PEI-001', label: 'Peinture mur intérieur', unit: 'm²', tva: 10, priceHT: 22 },
    'placo': { ref: 'MAC-001', label: 'Cloison placoplatre', unit: 'm²', tva: 10, priceHT: 45 },
    'carrelage': { ref: 'MAC-003', label: 'Carrelage sol', unit: 'm²', tva: 10, priceHT: 55 },
    'cloison': { ref: 'MAC-001', label: 'Cloison placoplatre', unit: 'm²', tva: 10, priceHT: 45 },
    'faïence': { ref: 'MAC-004', label: 'Faïence murale', unit: 'm²', tva: 10, priceHT: 65 },
  }

  for (const [key, item] of Object.entries(keywords)) {
    if (text.includes(key)) {
      const qty = (item.unit === 'm²' && surface > 0) ? surface : 1
      result.ouvrages.push({ ...item, qty, matched: false })
    }
  }

  if (result.ouvrages.length === 0) {
    result.ouvrages.push({
      ref: 'CUSTOM',
      label: 'Prestation à chiffrer manuellement',
      qty: 1, unit: 'forfait', priceHT: 0, tva: 10, matched: false
    })
  }

  return result
}
