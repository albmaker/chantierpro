// Vercel Serverless Function : création session Stripe Checkout
// Doc : https://stripe.com/docs/api/checkout/sessions/create

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, mode = 'subscription', successUrl, cancelUrl } = req.body

    if (!priceId || !userId) {
      return res.status(400).json({ error: 'Missing priceId or userId' })
    }

    // Créer ou récupérer le customer
    // (en prod, on stocke stripe_customer_id dans la table subscriptions)
    const customer = await stripe.customers.create({
      metadata: { userId },
    })

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: mode, // 'subscription' ou 'payment'
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      automatic_tax: { enabled: true }, // TVA auto pour l'Europe
      metadata: { userId },
    })

    return res.status(200).json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe Checkout error:', error)
    return res.status(500).json({ error: error.message })
  }
}
