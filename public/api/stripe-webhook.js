// Vercel Serverless Function : webhook Stripe
// Reçoit les événements Stripe et met à jour la BDD
// IMPORTANT : configurer dans Stripe Dashboard > Webhooks

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const config = {
  api: { bodyParser: false }, // Stripe a besoin du raw body
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // Récupérer le raw body
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const rawBody = Buffer.concat(chunks)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Gérer les événements
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata.userId
        const customerId = session.customer
        const subscriptionId = session.subscription

        // Récupérer les détails de l'abonnement
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id

        // Mapper price_id → plan
        const planMap = {
          [process.env.STRIPE_PRICE_STARTER]: 'starter',
          [process.env.STRIPE_PRICE_PRO]: 'pro',
          [process.env.STRIPE_PRICE_BUSINESS]: 'business',
        }
        const plan = planMap[priceId] || 'starter'

        // Mettre à jour la BDD
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })

        // Track l'event
        await supabase.from('usage_events').insert({
          user_id: userId,
          event_type: 'subscription_started',
          metadata: { plan, amount: subscription.items.data[0].price.unit_amount },
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await supabase
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const userId = invoice.subscription_details?.metadata?.userId
        if (userId) {
          await supabase.from('usage_events').insert({
            user_id: userId,
            event_type: 'payment_succeeded',
            metadata: { amount: invoice.amount_paid, invoice_id: invoice.id },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.error('Payment failed for invoice:', invoice.id)
        // TODO: envoyer un email à l'user
        break
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return res.status(500).json({ error: error.message })
  }
}
