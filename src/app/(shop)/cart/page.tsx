'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, isLoading } = useCart()

  const shipping = subtotal > 50 || items.some((item) => item.product.type === 'DIGITAL') ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse">Loading cart...</div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Looks like you haven't added any products yet.</p>
            <Link href="/shop" className="mt-6 inline-block">
              <Button asChild>
                <Link href="/shop">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <Link href={`/shop/products/${item.product.slug}`} className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.product.images[0]?.url || '/placeholder.jpg'}
                        alt={item.product.images[0]?.alt || item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={`/shop/products/${item.product.slug}`}>
                            <h3 className="font-medium hover:text-primary transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                          )}
                          {item.product.type === 'DIGITAL' && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600 dark:text-green-400">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Digital Download
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-muted"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border-0 focus:ring-0"
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-muted"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <span className="font-semibold text-lg">{formatCurrency(Number(item.product.price) * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Link href="/shop">
                  <Button variant="outline" asChild>
                    <Link href="/shop">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Link>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium">{formatCurrency(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="font-medium">
                      {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estimated Tax</dt>
                    <dd className="font-medium">{formatCurrency(tax)}</dd>
                  </div>
                </dl>

                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <dt>Total</dt>
                    <dd>{formatCurrency(total)}</dd>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Shipping and taxes calculated at checkout.
                  </p>
                </div>

                <Link href="/checkout" className="mt-6 block">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}