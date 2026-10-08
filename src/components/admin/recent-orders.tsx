'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreHorizontal, ChevronRight } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number | string
  createdAt: Date
  user: { name: string | null; email: string }
  items: { product: { name: string } }[]
}

interface RecentOrdersProps {
  orders: Order[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Link href="/admin/orders" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono font-medium">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{order.user.name || 'Guest'}</p>
                      <p className="text-sm text-muted-foreground">{order.user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}