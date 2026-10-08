import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AdminStats } from '@/components/admin/admin-stats'
import { RecentOrders } from '@/components/admin/recent-orders'
import { TopProducts } from '@/components/admin/top-products'

export const metadata: Metadata = {
  title: 'Admin Dashboard - YourStore',
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/login')
  }

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ])

  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (tp) => {
      const product = await prisma.product.findUnique({
        where: { id: tp.productId },
        select: { name: true, images: { take: 1 } },
      })
      return { ...tp, _sum: { quantity: tp._sum.quantity ?? 0, total: Number(tp._sum.total ?? 0) }, product }
    })
  )

  const stats = {
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
  }

  const orders = recentOrders.map((order) => ({
    ...order,
    total: Number(order.total),
  }))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store performance</p>
        </div>
      </div>

      <AdminStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrders orders={orders} />
        <TopProducts products={topProductsWithDetails} />
      </div>
    </div>
  )
}