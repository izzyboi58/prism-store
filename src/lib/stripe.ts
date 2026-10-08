import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function createPaymentIntent(
  amount: number,
  currency = 'usd',
  metadata: Record<string, string> = {}
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  }
}

export async function createCheckoutSession(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {},
  customerEmail?: string
): Promise<{ sessionId: string; url: string }> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    customer_email: customerEmail,
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU'],
    },
  })

  return {
    sessionId: session.id,
    url: session.url!,
  }
}

export async function createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  return stripe.customers.create({ email, name })
}

export async function createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  })
}

export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}