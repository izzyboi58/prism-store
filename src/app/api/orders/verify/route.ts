import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
    })

    const orderId = checkoutSession.metadata?.orderId

    if (!orderId) {
      return NextResponse.json({ error: 'Order not found in session' }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
            variant: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (session?.user && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}