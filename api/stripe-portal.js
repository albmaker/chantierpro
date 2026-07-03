// Vercel Serverless Function : portail client Stripe
// Permet à l'user de gérer son abonnement (annuler, changer carte, etc.)

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service_role key, jamais exposée au frontend
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    // Récupérer le stripe_customer_id depuis la BDD
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (!subscription?.stripe_customer_id) {
      return res.status(404).json({ error: 'No Stripe customer found' })
    }

    // Créer la session portail
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${req.headers.origin}/parametres`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe Portal error:', error)
    return res.status(500).json({ error: error.message })
  }
}
