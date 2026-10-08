import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/products/product-detail'
import { prisma } from '@/lib/prisma'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: true },
  })

  if (!product) return { title: 'Product Not Found' }

  return {
    title: `${product.name} - YourStore`,
    description: product.shortDesc || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDesc || product.description.slice(0, 160),
      images: product.images[0]?.url ? [product.images[0].url] : [],
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: 'asc' } },
      variants: true,
    },
  })

  if (!product) notFound()

  return <ProductDetail product={product} />
}