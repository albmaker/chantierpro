// Service Mistral AI - Vision pour analyse de photos de chantier
// Doc API : https://docs.mistral.ai/capabilities/vision/
// Modèle : pixtral-12b-2409 (multimodal, français, peu cher)

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'
const VISION_MODEL = 'pixtral-12b-2409'

// ⚠️ IMPORTANT : En production, cette clé doit être stockée côté serveur (Vercel Function)
// NE JAMAIS exposer une clé Mistral en frontend pur.
// Pour le V1, on utilise une Vercel Serverless Function comme proxy.

const SYSTEM_PROMPT = `Tu es un expert en estimation de travaux du bâtiment en France.
Tu analyses des photos de chantiers et tu dois identifier les ouvrages à réaliser.

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "metier": "plomberie" | "electricite" | "peinture" | "maconnerie",
  "confidence": 0-100,
  "description": "Courte description de ce que tu vois en 1 phrase",
  "ouvrages": [
    {
      "ref": "XXX-XXX (référence de la bibliothèque ci-dessous)",
      "label": "Description courte de l'ouvrage",
      "qty": nombre,
      "unit": "u" | "m²" | "ml" | "forfait" | "m³",
      "priceHT": prix en euros HT (estimé marché français 2026),
      "tva": 0 | 5.5 | 10 | 20
    }
  ]
}

BIBLIOTHÈQUE DE RÉFÉRENCES (utilise ces refs quand pertinent) :

PLOMBERIE :
- PLO-001 : Pose WC suspendu (forfait, ~450€ HT, TVA 10%)
- PLO-002 : Remplacement chauffe-eau 200L (forfait, ~380€ HT, TVA 10%)
- PLO-003 : Pose robinetterie mitigeur (u, ~85€ HT, TVA 10%)
- PLO-004 : Débouchage canalisation (forfait, ~120€ HT, TVA 10%)
- PLO-005 : Pose lavabo sur colonne (u, ~220€ HT, TVA 10%)
- PLO-006 : Installation douchette italienne (forfait, ~780€ HT, TVA 10%)
- PLO-007 : Raccordement machine à laver (u, ~95€ HT, TVA 10%)
- PLO-008 : Tuyauterie PER (ml, ~35€ HT, TVA 10%)
- PLO-009 : Pose baignoire acrylique (u, ~340€ HT, TVA 10%)
- PLO-010 : Fuite simple réparation (forfait, ~95€ HT, TVA 10%)

ÉLECTRICITÉ :
- ELE-001 : Prise électrique 16A (u, ~65€ HT, TVA 10%)
- ELE-002 : Point lumineux complet (u, ~85€ HT, TVA 10%)
- ELE-003 : Tableau électrique 2 rangées (u, ~420€ HT, TVA 10%)
- ELE-004 : Mise aux normes NF C15-100 (forfait, ~1450€ HT, TVA 10%)
- ELE-005 : Pose VMC simple flux (u, ~380€ HT, TVA 10%)
- ELE-006 : Interrupteur va-et-vient (u, ~55€ HT, TVA 10%)
- ELE-007 : Prise RJ45 catégorie 6 (u, ~75€ HT, TVA 10%)
- ELE-008 : Pose radiateur électrique 1500W (u, ~180€ HT, TVA 10%)
- ELE-009 : Diagnostic électrique (forfait, ~95€ HT, TVA 10%)
- ELE-010 : Câblage prise TV/antenne (u, ~90€ HT, TVA 10%)

PEINTURE :
- PEI-001 : Peinture mur intérieur (m², ~22€ HT, TVA 10%)
- PEI-002 : Peinture plafond (m², ~26€ HT, TVA 10%)
- PEI-003 : Préparation support enduit (m², ~14€ HT, TVA 10%)
- PEI-004 : Peinture boiseries (ml, ~18€ HT, TVA 10%)
- PEI-005 : Pose papier peint (m², ~28€ HT, TVA 10%)
- PEI-006 : Peinture façade (m², ~32€ HT, TVA 20%)
- PEI-007 : Lasure bois extérieur (m², ~24€ HT, TVA 20%)
- PEI-008 : Pièce complète mur+plafond (m², ~38€ HT, TVA 10%)
- PEI-009 : Dépose ancien revêtement (m², ~8€ HT, TVA 10%)
- PEI-010 : Peinture radiateur (u, ~65€ HT, TVA 10%)

MAÇONNERIE :
- MAC-001 : Cloison placoplatre (m², ~45€ HT, TVA 10%)
- MAC-002 : Doublage isolant (m², ~38€ HT, TVA 10%)
- MAC-003 : Carrelage sol (m², ~55€ HT, TVA 10%)
- MAC-004 : Faïence murale (m², ~65€ HT, TVA 10%)
- MAC-005 : Pose parquet flottant (m², ~32€ HT, TVA 10%)
- MAC-006 : Démolition cloison (m², ~28€ HT, TVA 10%)
- MAC-007 : Ouverture mur porteur (forfait, ~1850€ HT, TVA 10%)
- MAC-008 : Pose fenêtre PVC double vitrage (u, ~480€ HT, TVA 10%)
- MAC-009 : Enduit extérieur (m², ~42€ HT, TVA 20%)
- MAC-010 : Terrassement manuel (m³, ~65€ HT, TVA 20%)

RÈGLES IMPORTANTES :
1. TVA = 10% pour les travaux de rénovation dans un logement > 2 ans
2. TVA = 20% pour construction neuve, façade extérieure, travaux extérieurs
3. TVA = 5.5% pour travaux d'amélioration énergétique (isolation, etc.)
4. Si tu n'es pas sûr de la quantité, mets 1 (forfait)
5. Si tu ne reconnais pas le métier, mets confidence < 50 et 1 ouvrage générique
6. Ne mets PAS plus de 6 ouvrages par analyse (sois pertinent)
7. Prix en EUROS HT, valeurs marché français 2026
8. Réponds UNIQUEMENT le JSON, rien d'autre avant/après.`

/**
 * Analyse une image de chantier via Mistral AI Pixtral
 * @param {string} base64Image - Image en base64 (data:image/...;base64,XXX)
 * @param {string} apiKey - Clé API Mistral (récupérée via Vercel Function)
 * @returns {Promise<Object>} Résultat JSON parsé
 */
export async function analyzeChantierImage(base64Image, apiKey) {
  // Nettoyer le préfixe data:image/...;base64,
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '')

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyse cette photo de chantier et génère le devis estimatif en JSON.',
            },
            {
              type: 'image_url',
              image_url: `data:image/jpeg;base64,${cleanBase64}`,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Mistral API error: ${response.status} - ${err}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  return JSON.parse(content)
}

/**
 * Compresse une image avant envoi (réduit coût API + latence)
 */
export function compressImage(file, maxWidth = 1280, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Coût estimé Mistral Vision (au 1er juillet 2026)
 * pixtral-12b : ~0.15€ par million de tokens input
 * Une image ≈ 1500 tokens ≈ 0.000225€ par analyse
 * 1000 analyses/mois = 0.22€ ✅
 */
