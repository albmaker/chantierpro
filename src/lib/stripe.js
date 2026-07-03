// Configuration Stripe pour ChantierPro
// Doc : https://stripe.com/docs/billing/subscriptions/build-subscriptions-ui
// Pricing IDs à créer dans le dashboard Stripe

export const STRIPE_CONFIG = {
  // ⚠️ À remplacer par ta clé publique Stripe (test ou live)
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_XXXXXXXXXXXXXXX',

  // Price IDs depuis le dashboard Stripe (https://dashboard.stripe.com/products)
  prices: {
    starter: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER || 'price_XXXXX_STARTER_MONTHLY',
      annual: import.meta.env.VITE_STRIPE_PRICE_STARTER_ANNUAL || 'price_XXXXX_STARTER_ANNUAL',
      amount: 19, // €
      label: 'Starter',
      features: [
        'Devis illimités',
        'Factures PDF',
        'Compatible FE 2026',
        'Bibliothèque 40 ouvrages',
        'Support email',
      ],
    },
    pro: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_PRO || 'price_XXXXX_PRO_MONTHLY',
      annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL || 'price_XXXXX_PRO_ANNUAL',
      amount: 39,
      label: 'Pro',
      popular: true,
      features: [
        'Tout du Starter',
        'Scan IA illimité (Mistral)',
        'Bibliothèque 40+ ouvrages',
        'Relances automatiques',
        'Signature électronique',
        'Support prioritaire',
      ],
    },
    business: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS || 'price_XXXXX_BUSINESS_MONTHLY',
      annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL || 'price_XXXXX_BUSINESS_ANNUAL',
      amount: 79,
      label: 'Business',
      features: [
        'Tout du Pro',
        'Multi-utilisateurs (5)',
        'Tableau de bord équipe',
        'Export comptable (FEC)',
        'API access',
        'Account manager dédié',
      ],
    },
  },
}

/**
 * Redirige vers Stripe Checkout pour souscription
 */
export async function startCheckout(priceId, userId, mode = 'subscription') {
  const response = await fetch('/api/stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      userId,
      mode,
      successUrl: `${window.location.origin}/dashboard?stripe=success`,
      cancelUrl: `${window.location.origin}/parametres?stripe=cancel`,
    }),
  })

  if (!response.ok) {
    throw new Error('Erreur création session Stripe')
  }

  const { url } = await response.json()
  window.location.href = url
}

/**
 * Ouvre le portail client Stripe (gérer abonnement)
 */
export async function openCustomerPortal(userId) {
  const response = await fetch('/api/stripe-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new Error('Erreur ouverture portail')
  }

  const { url } = await response.json()
  window.location.href = url
}
