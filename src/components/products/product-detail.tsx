'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Download, Star, Truck, Shield, RotateCcw, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, cn } from '@/lib/utils'
import { ProductWithRelations } from '@/types'
import { useCart } from '@/hooks/use-cart'
import { toast } from '@/hooks/use-toast'

interface ProductDetailProps {
  product: ProductWithRelations
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const { addItem } = useCart()

  const price = selectedVariant
    ? product.variants.find((v) => v.id === selectedVariant)?.price || product.price
    : product.price

  const compareAt = selectedVariant
    ? product.variants.find((v) => v.id === selectedVariant)?.price
    : product.compareAt

  const stock = selectedVariant
    ? product.variants.find((v) => v.id === selectedVariant)?.quantity || 0
    : product.quantity

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, selectedVariant || undefined, quantity)
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    }
  }

  const images = product.images.length > 0 ? product.images : [{ id: 'placeholder', url: '/placeholder.jpg', alt: product.name }]

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <a href="/" className="hover:text-foreground">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-foreground">Shop</a>
          <span>/</span>
          <a href={`/shop?category=${product.category.slug}`} className="hover:text-foreground">
            {product.category.name}
          </a>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].alt || product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {product.type === 'DIGITAL' && (
                <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                  <Download className="h-5 w-5" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors',
                      selectedImage === index ? 'border-primary' : 'border-transparent hover:border-muted'
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.name} - view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-sm font-medium text-primary">{product.category.name}</span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{product.name}</h1>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.8</span>
                  <span className="text-muted-foreground">(124 reviews)</span>
                </div>
                {product.type === 'DIGITAL' && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-medium">Instant Download</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-b py-6">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold">{formatCurrency(price)}</span>
                {compareAt && Number(compareAt) > Number(price) && (
                  <span className="text-xl line-through text-muted-foreground">{formatCurrency(compareAt)}</span>
                )}
              </div>
              {product.type === 'PHYSICAL' && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  Free shipping on orders over $50
                </p>
              )}
            </div>

            <div className="prose max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>

            {product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="font-medium">Select Variant</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={cn(
                        'px-4 py-2 rounded-md border text-sm font-medium transition-all',
                        selectedVariant === variant.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input hover:border-primary/50'
                      )}
                      disabled={variant.quantity === 0}
                    >
                      {variant.name} - {formatCurrency(variant.price)}
                      {variant.quantity < 10 && variant.quantity > 0 && (
                        <span className="ml-2 text-xs text-orange-500">Only {variant.quantity} left</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 border-t pt-6">
              <label htmlFor="quantity" className="font-medium">Quantity</label>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-muted"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-0 focus:ring-0"
                  min="1"
                  max={stock || 99}
                />
                <button
                  onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                  className="p-2 hover:bg-muted"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {stock > 0 && stock < 10 && (
                <span className="text-sm text-orange-500">Only {stock} left in stock</span>
              )}
              {stock === 0 && <span className="text-sm text-destructive">Out of stock</span>}
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <RotateCcw className="mr-2 h-5 w-5" />
                {product.type === 'DIGITAL' ? 'Buy Now' : 'Pre-order'}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Secure Checkout</p>
                  <p className="text-sm text-muted-foreground">SSL encrypted payment</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Fast Shipping</p>
                  <p className="text-sm text-muted-foreground">3-5 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-sm text-muted-foreground">30-day money back</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {product.shortDesc && (
          <div className="mt-12 rounded-xl border bg-muted/50 p-6">
            <h2 className="text-lg font-semibold mb-2">Highlights</h2>
            <p className="text-muted-foreground">{product.shortDesc}</p>
          </div>
        )}
      </div>
    </div>
  )
}