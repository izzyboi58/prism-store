'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Download, Truck, CheckCircle, Clock, XCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils'

interface OrderItem {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  total: number
  product: {
    id: string
    slug: string
    name: string
    type: string
    images: { url: string; alt?: string }[]
  }
  variant?: { id: string; name: string; price: number } | null
}

interface Shipment {
  id: string
  trackingNumber: string | null
  carrier: string | null
  status: string
  shippedAt: Date | null
  deliveredAt: Date | null
  items: { quantity: number; orderItemId: string }[]
}

interface OrderDetailProps {
  order: {
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    fulfillmentStatus: string
    subtotal: number
    tax: number
    shipping: number
    discount: number
    total: number
    email: string
    phone: string | null
    shippingAddress: any
    billingAddress: any
    createdAt: Date
    updatedAt: Date
    items: OrderItem[]
    shipments: Shipment[]
  }
  showSuccess: boolean
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

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-blue-100 text-blue-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  FAILED: 'bg-red-100 text-red-800',
}

const fulfillmentStatusColors: Record<string, string> = {
  UNFULFILLED: 'bg-gray-100 text-gray-800',
  PARTIAL: 'bg-yellow-100 text-yellow-800',
  FULFILLED: 'bg-green-100 text-green-800',
}

export function OrderDetail({ order, showSuccess }: OrderDetailProps) {
  if (showSuccess) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Thank you for your order. We've sent a confirmation email to {order.email}.
          </p>
          <p className="mt-4 font-mono text-lg">Order #{order.orderNumber}</p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild>
              <a href={`/orders/${order.id}`}>View Order Details</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/shop">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
              {order.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[order.paymentStatus]}`}>
              {order.paymentStatus}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${fulfillmentStatusColors[order.fulfillmentStatus]}`}>
              {order.fulfillmentStatus}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-lg border p-4">
                    <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={item.product.images[0]?.url || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/products/${item.product.slug}`}>
                        <h3 className="font-medium truncate hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                      )}
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-medium">{formatCurrency(item.price)} × {item.quantity}</span>
                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                      </div>
                      {item.product.type === 'DIGITAL' && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/api/download/${order.id}/${item.product.id}`}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {order.shipments.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Shipments</h2>
                <div className="space-y-4">
                  {order.shipments.map((shipment) => (
                    <div key={shipment.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{shipment.carrier || 'Standard Shipping'}</span>
                          {shipment.trackingNumber && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="font-mono text-sm">{shipment.trackingNumber}</span>
                            </>
                          )}
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-muted">
                          {shipment.status}
                        </span>
                      </div>
                      {shipment.trackingNumber && (
                        <a
                          href={`https://www.google.com/search?q=${shipment.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Track Package
                        </a>
                      )}
                      {shipment.shippedAt && (
                        <p className="text-sm text-muted-foreground">
                          Shipped on {formatDate(shipment.shippedAt)}
                          {shipment.deliveredAt && ` • Delivered on ${formatDate(shipment.deliveredAt)}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatCurrency(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd className="font-medium">{formatCurrency(order.tax)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>Discount</dt>
                    <dd>-{formatCurrency(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <dt>Total</dt>
                  <dd>{formatCurrency(order.total)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <address className="not-italic text-sm text-muted-foreground">
                {order.shippingAddress.name}<br />
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 && <><br />{order.shippingAddress.line2}</>}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </address>
            </section>

            <section className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
              <address className="not-italic text-sm text-muted-foreground">
                {order.billingAddress.name}<br />
                {order.billingAddress.line1}
                {order.billingAddress.line2 && <><br />{order.billingAddress.line2}</>}
                <br />
                {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}<br />
                {order.billingAddress.country}
              </address>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}