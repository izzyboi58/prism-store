import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { OrderDetail } from '@/components/orders/order-detail'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Order #${id.slice(0, 8)} - YourStore` }
}

export default async function OrderPage({ params, searchParams }: OrderPageProps & { searchParams: Promise<{ success?: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    notFound()
  }

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1 } } },
          variant: true,
        },
      },
      shipments: { include: { items: { include: { orderItem: true } } } },
    },
  })

  if (!order) notFound()

  return (
    <OrderDetail
      order={order as unknown as React.ComponentProps<typeof OrderDetail>['order']}
      showSuccess={(await searchParams).success === 'true'}
    />
  )
}