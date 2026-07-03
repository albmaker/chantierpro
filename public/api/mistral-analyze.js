// Vercel Serverless Function : proxy sécurisé vers Mistral AI
// Cette fonction protège ta clé API (jamais exposée au frontend)
// Fichier à déployer à la racine : /api/mistral-analyze.js

import { analyzeChantierImage } from '../src/lib/mistralAI.js'

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image } = req.body

    if (!image) {
      return res.status(400).json({ error: 'No image provided' })
    }

    // Rate limiting basique par IP (Vercel fournit req.headers['x-forwarded-for'])
    const ip = req.headers['x-forwarded-for'] || 'unknown'
    // En production, utiliser un store Redis/Upstash pour le rate limiting

    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Mistral API key not configured' })
    }

    const result = await analyzeChantierImage(image, apiKey)

    return res.status(200).json({
      success: true,
      data: result,
      meta: {
        model: 'pixtral-12b-2409',
        cost: 0.000225, // €
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Mistral analysis error:', error)
    return res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
    })
  }
}
