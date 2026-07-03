// Service de transcription vocale + structuration IA
// Utilise Web Speech API (gratuit, Chrome) pour la transcription
// Puis Mistral AI pour structurer en lignes de devis

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'
const MODEL = 'mistral-small-latest' // Modèle économique et rapide

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
5. Sois généreux dans les ouvrages : si l'artisan parle de plomberie, inclus les ouvrages de base
6. Quantités : reste réaliste (1 WC = qty 1, peinture 20m² = qty 20)
7. Ne mets PAS de commentaire, juste le JSON`

export async function transcribeAudio(audioBlob) {
  // Web Speech API ne fonctionne pas avec un blob, il faut le streaming
  // On va utiliser l'API MediaRecorder + Web Speech API
  // Cette fonction est juste un placeholder, la vraie transcription se fait via recognizeSpeech()
  throw new Error('Utilisez recognizeSpeech() pour la transcription en direct')
}

export function recognizeSpeech() {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      reject(new Error('Reconnaissance vocale non supportée. Utilisez Chrome ou Edge.'))
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    let finalTranscript = ''
    let interimTranscript = ''

    recognition.onresult = (event) => {
      interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }
    }

    recognition.onerror = (event) => {
      reject(new Error('Erreur micro: ' + event.error))
    }

    recognition.onend = () => {
      resolve({
        final: finalTranscript.trim(),
        interim: interimTranscript.trim(),
        full: (finalTranscript + ' ' + interimTranscript).trim()
      })
    }

    recognition.start()
    return recognition
  })
}

/**
 * Structure une transcription vocale en lignes de devis via Mistral
 */
export async function structureTranscription(transcript, ouvragesBiblio) {
  const biblioText = Object.entries(ouvragesBiblio).map(([metier, ouvrages]) => {
    return `${metier.toUpperCase()}:\n${ouvrages.map(o =>
      `  ${o.ref}: ${o.label} (${o.priceHT}€/${o.unit}, TVA ${o.tva}%)`
    ).join('\n')}`
  }).join('\n\n')

  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY || 'sGKPeIjyzqtDZwgim8qfdtAvfIFptFxA' // Clé de test intégrée en fallback

  if (!apiKey) {
    throw new Error('Clé API Mistral non configurée (VITE_MISTRAL_API_KEY)')
  }

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

// Fallback : structuration locale basique (utilisée si Mistral down)
export function structureLocally(transcript) {
  const text = transcript.toLowerCase()
  const result = { metier: 'plomberie', description: transcript.substring(0, 100), ouvrages: [] }

  // Détection métier
  if (text.includes('électric') || text.includes('prises') || text.includes('tableau')) {
    result.metier = 'electricite'
  } else if (text.includes('peintur') || text.includes('peindre') || text.includes('mur')) {
    result.metier = 'peinture'
  } else if (text.includes('carrelage') || text.includes('cloison') || text.includes('placo')) {
    result.metier = 'maconnerie'
  }

  // Recherche de surface
  const surfaceMatch = text.match(/(\d+)\s*(mètre|m2|m²|metre)/)
  const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : 0

  // Recherche de mots-clés
  const keywords = {
    'wc': { ref: 'PLO-001', label: 'Pose WC suspendu', unit: 'forfait', tva: 10, priceHT: 450 },
    'baignoire': { ref: 'PLO-009', label: 'Pose baignoire', unit: 'u', tva: 10, priceHT: 340 },
    'douche': { ref: 'PLO-006', label: 'Installation douche', unit: 'forfait', tva: 10, priceHT: 780 },
    'chauffe-eau': { ref: 'PLO-002', label: 'Chauffe-eau', unit: 'u', tva: 10, priceHT: 380 },
    'robinetterie': { ref: 'PLO-003', label: 'Pose robinetterie', unit: 'u', tva: 10, priceHT: 85 },
    'prise': { ref: 'ELE-001', label: 'Prise électrique 16A', unit: 'u', tva: 10, priceHT: 65 },
    'lumière': { ref: 'ELE-002', label: 'Point lumineux', unit: 'u', tva: 10, priceHT: 85 },
    'tableau': { ref: 'ELE-003', label: 'Tableau électrique', unit: 'u', tva: 10, priceHT: 420 },
    'peinture': { ref: 'PEI-001', label: 'Peinture mur intérieur', unit: 'm²', tva: 10, priceHT: 22 },
    'placo': { ref: 'MAC-001', label: 'Cloison placoplatre', unit: 'm²', tva: 10, priceHT: 45 },
    'carrelage': { ref: 'MAC-003', label: 'Carrelage sol', unit: 'm²', tva: 10, priceHT: 55 },
  }

  for (const [key, item] of Object.entries(keywords)) {
    if (text.includes(key)) {
      const qty = (item.unit === 'm²' && surface > 0) ? surface : 1
      result.ouvrages.push({ ...item, qty, matched: false })
    }
  }

  // Si rien trouvé, ajout générique
  if (result.ouvrages.length === 0) {
    result.ouvrages.push({
      ref: 'CUSTOM',
      label: 'Prestation à chiffrer manuellement',
      qty: 1,
      unit: 'forfait',
      priceHT: 0,
      tva: 10,
      matched: false
    })
  }

  return result
}
