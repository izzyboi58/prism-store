'use client'

import { formatCurrency } from '@/lib/utils'
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface AdminStatsProps {
  stats: {
    totalProducts: number
    totalOrders: number
    totalCustomers: number
    totalRevenue: number | string
  }
}

const statCards = [
  {
    name: 'Total Products',
    value: 'totalProducts',
    icon: Package,
    color: 'text-blue-600 bg-blue-100',
  },
  {
    name: 'Total Orders',
    value: 'totalOrders',
    icon: ShoppingCart,
    color: 'text-green-600 bg-green-100',
  },
  {
    name: 'Customers',
    value: 'totalCustomers',
    icon: Users,
    color: 'text-purple-600 bg-purple-100',
  },
  {
    name: 'Revenue',
    value: 'totalRevenue',
    icon: DollarSign,
    color: 'text-orange-600 bg-orange-100',
    isCurrency: true,
  },
]

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
              <p className="text-2xl font-bold">
                {stat.isCurrency ? formatCurrency(stats[stat.value as keyof typeof stats]) : stats[stat.value as keyof typeof stats]}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}