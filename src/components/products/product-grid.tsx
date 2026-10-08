'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, Download, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductWithRelations } from '@/types'

interface ProductGridProps {
  products: ProductWithRelations[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No products found</h3>
        <p className="mt-2 text-muted-foreground">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <article
          key={product.id}
          className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
        >
          <Link href={`/shop/products/${product.slug}`} className="relative aspect-square overflow-hidden">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Tag className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {product.type === 'DIGITAL' && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                <Download className="h-3.5 w-3.5" />
              </div>
            )}
            {product.compareAt && Number(product.compareAt) > Number(product.price) && (
              <div className="absolute top-2 left-2 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
                -{Math.round(((Number(product.compareAt) - Number(product.price)) / Number(product.compareAt)) * 100)}%
              </div>
            )}
          </Link>

          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between">
              <Link href={`/shop/products/${product.slug}`}>
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              {product.category && (
                <span className="ml-2 text-xs text-muted-foreground">{product.category.name}</span>
              )}
            </div>

            <div className="mt-2 flex flex-1 flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                {product.compareAt && Number(product.compareAt) > Number(product.price) && (
                  <span className="text-sm line-through text-muted-foreground">
                    {formatCurrency(product.compareAt)}
                  </span>
                )}
              </div>
              <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-2">
                {product.shortDesc || product.description.slice(0, 100)}...
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                asChild
              >
                <Link href={`/shop/products/${product.slug}`}>
                  View Details
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0"
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}