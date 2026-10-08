'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, Truck, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/orders/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data.order)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
          toast({ title: 'Error', description: 'Could not verify order', variant: 'destructive' })
        })
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Thank you for your order. We've sent a confirmation email with your order details.
        </p>

        {order && (
          <div className="mt-8 space-y-4 text-left">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Order Number</span>
                  <span className="font-mono font-bold">#{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {order.status}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href={`/orders/${order.id}`}>View Order Details</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        )}

        {!order && (
          <div className="mt-8">
            <p className="text-muted-foreground">Your order is being processed. You'll receive an email shortly.</p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/account/orders">View My Orders</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}