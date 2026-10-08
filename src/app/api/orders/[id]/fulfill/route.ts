import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { fulfillOrder } from '@/lib/suppliers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { include: { supplier: true } },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.fulfillmentStatus === 'FULFILLED') {
    return NextResponse.json({ error: 'Order already fulfilled' }, { status: 400 })
  }

  try {
    await fulfillOrder(order.id)
    return NextResponse.json({ success: true, message: 'Fulfillment initiated' })
  } catch (error) {
    console.error('Fulfillment error:', error)
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 })
  }
}