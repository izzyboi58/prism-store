import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ items: [] })
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: 'asc' }, take: 1 },
              variants: true,
            },
          },
          variant: true,
        },
      },
    },
  })

  return NextResponse.json({ items: cart?.items || [] })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { productId, variantId, quantity = 1 } = await request.json()

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const variant = variantId ? product.variants.find((v) => v.id === variantId) : null
  const stock = variant?.quantity ?? product.quantity

  if (stock < quantity) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
  }

  let cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.user.id },
    })
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_variantId: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    },
  })

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity > stock) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
      },
    })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
  })

  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  }

  return NextResponse.json({ success: true })
}