import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createPaymentIntent } from '@/lib/stripe'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { items, shippingAddress, billingAddress, paymentMethodId } = await request.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items in order' }, { status: 400 })
  }

  const productIds = items.map((item: any) => item.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true, supplier: { include: { supplier: true } } },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  let subtotal = 0
  const orderItems = []

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) {
      return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
    }

    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : null

    const price = variant?.price ?? product.price
    const stock = variant?.quantity ?? product.quantity

    if (stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
    }

    const itemTotal = Number(price) * item.quantity
    subtotal += itemTotal

    orderItems.push({
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      sku: variant?.sku ?? product.sku,
      price,
      quantity: item.quantity,
      total: itemTotal,
    })

    if (product.trackQty) {
      if (variant) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { quantity: { decrement: item.quantity } },
        })
      } else {
        await prisma.product.update({
          where: { id: product.id },
          data: { quantity: { decrement: item.quantity } },
        })
      }
    }
  }

  const tax = subtotal * 0.08
  const shipping = subtotal > 50 || items.some((i: any) => productMap.get(i.productId)?.type === 'DIGITAL') ? 0 : 9.99
  const total = subtotal + tax + shipping

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      email: session.user.email!,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      tax,
      shipping,
      total,
      status: 'CONFIRMED',
      paymentStatus: paymentMethodId ? 'PAID' : 'PENDING',
      fulfillmentStatus: items.some((i: any) => productMap.get(i.productId)?.type === 'DIGITAL') ? 'FULFILLED' : 'UNFULFILLED',
      items: { create: orderItems },
    },
    include: { items: true },
  })

  await prisma.cartItem.deleteMany({
    where: { cart: { userId: session.user.id } },
  })

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (product?.supplier?.supplier?.autoFulfill && product.type === 'PHYSICAL') {
      // Trigger fulfillment (async)
      setTimeout(() => {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${order.id}/fulfill`, { method: 'POST' })
      }, 0)
    }
  }

  if (paymentMethodId) {
    return NextResponse.json({ orderId: order.id, success: true })
  }

  const { clientSecret, paymentIntentId } = await createPaymentIntent(total, 'usd', {
    orderId: order.id,
    userId: session.user.id,
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentIntentId: paymentIntentId },
  })

  return NextResponse.json({ orderId: order.id, clientSecret })
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1 } } },
          variant: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ orders })
}