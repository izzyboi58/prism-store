import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { items, shippingAddress, billingAddress } = await request.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items' }, { status: 400 })
  }

  const productIds = items.map((item: any) => item.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: true },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  const lineItems = items.map((item: any) => {
    const product = productMap.get(item.productId)
    if (!product) throw new Error(`Product ${item.productId} not found`)

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          images: product.images?.map((img) => img.url) || [],
          metadata: { productId: product.id, variantId: item.variantId || '' },
        },
        unit_amount: Math.round(Number(product.price) * 100),
      },
      quantity: item.quantity,
    }
  })

  const subtotal = items.reduce((sum: number, item: any) => {
    const product = productMap.get(item.productId)
    return sum + Number(product?.price || 0) * item.quantity
  }, 0)

  const shipping = subtotal > 50 || items.some((i: any) => productMap.get(i.productId)?.type === 'DIGITAL') ? 0 : 999
  const tax = Math.round(subtotal * 0.08 * 100)

  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping' },
        unit_amount: shipping,
      },
      quantity: 1,
    })
  }

  if (tax > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tax' },
        unit_amount: tax,
      },
      quantity: 1,
    })
  }

  const { sessionId, url } = await createCheckoutSession(
    lineItems,
    `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
    { userId: session.user.id, items: JSON.stringify(items) },
    session.user.email ?? undefined
  )

  return NextResponse.json({ sessionId, url })
}