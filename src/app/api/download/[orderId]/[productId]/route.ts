import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { verifyDownloadAccess, incrementDownloadCount } from '@/lib/digital'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string; productId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId, productId } = await params

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: {
      items: { include: { product: { include: { digitalFile: true } } } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const orderItem = order.items.find((item) => item.productId === productId)
  if (!orderItem) {
    return NextResponse.json({ error: 'Product not in order' }, { status: 404 })
  }

  if (!orderItem.product.digitalFile) {
    return NextResponse.json({ error: 'No digital file for this product' }, { status: 404 })
  }

  const download = await prisma.download.findFirst({
    where: {
      userId: session.user.id,
      digitalFileId: orderItem.product.digitalFile.id,
      orderId: order.id,
    },
  })

  if (!download) {
    return NextResponse.json({ error: 'Download not authorized' }, { status: 403 })
  }

  const { allowed, digitalFile, error } = await verifyDownloadAccess(download.id, session.user.id)

  if (!allowed) {
    return NextResponse.json({ error }, { status: 403 })
  }

  await incrementDownloadCount(download.id)

  return NextResponse.redirect(digitalFile!.url)
}