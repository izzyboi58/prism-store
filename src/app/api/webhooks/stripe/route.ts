import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { createDigitalDelivery } from '@/lib/digital'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event

  try {
    event = constructWebhookEvent(body, signature)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
            },
          })

          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              items: { include: { product: { include: { digitalFile: true } } } },
            },
          })

          if (order) {
            for (const item of order.items) {
              if (item.product.digitalFile) {
                await createDigitalDelivery(order.userId, item.product.digitalFile.id, order.id)
              }
            }
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
          })
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        const paymentIntentId = charge.payment_intent as string

        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
        })

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: 'REFUNDED', status: 'REFUNDED' },
          })
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object
        const orderId = session.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}