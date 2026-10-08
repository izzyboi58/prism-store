import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { quantity } = await request.json()

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: {
      product: { include: { variants: true } },
      variant: true,
      cart: true,
    },
  })

  if (!cartItem || cartItem.cart.userId !== session.user.id) {
    return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
  }

  const stock = cartItem.variant?.quantity ?? cartItem.product.quantity

  if (quantity > stock) {
    return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
  }

  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  }

  await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  })

  if (!cartItem || cartItem.cart.userId !== session.user.id) {
    return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
  }

  await prisma.cartItem.delete({ where: { id } })

  return NextResponse.json({ success: true })
}