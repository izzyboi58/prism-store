import { Metadata } from 'next'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductFilters } from '@/components/products/product-filters'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Shop - YourStore',
  description: 'Browse our collection of digital and physical products',
}

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
    page?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  const where: any = { status: 'ACTIVE' }

  if (params.category) {
    where.category = { slug: params.category }
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {}
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice)
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice)
  }

  let orderBy: any = { createdAt: 'desc' }
  switch (params.sort) {
    case 'price_asc':
      orderBy = { price: 'asc' }
      break
    case 'price_desc':
      orderBy = { price: 'desc' }
      break
    case 'popular':
      orderBy = { orders: { _count: 'desc' } }
      break
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { _count: { select: { products: true } } },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
          <p className="mt-1 text-muted-foreground">
            {total} product{total !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters
              categories={categories}
              currentCategory={params.category}
              currentSort={params.sort}
              minPrice={params.minPrice ? parseFloat(params.minPrice) : undefined}
              maxPrice={params.maxPrice ? parseFloat(params.maxPrice) : undefined}
            />
          </aside>

          <main className="flex-1">
            <ProductGrid products={products} />

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {page > 1 && (
                  <a
                    href={`?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Previous
                  </a>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <a
                    href={`?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Next
                  </a>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}