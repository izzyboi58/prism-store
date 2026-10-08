'use client'

import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Package } from 'lucide-react'

interface TopProduct {
  productId: string
  _sum: { quantity: number | null; total: number | string | null }
  product?: { name: string; images: { url: string }[] } | null
}

interface TopProductsProps {
  products: TopProduct[]
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {products.map((item, index) => (
            <div key={item.productId} className="flex items-center gap-4 p-4 hover:bg-muted/50">
              <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
              {item.product?.images[0] && (
                <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.product?.name || 'Unknown Product'}</p>
                <p className="text-sm text-muted-foreground">
                  {item._sum.quantity} sold • {formatCurrency(item._sum.total ?? 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}