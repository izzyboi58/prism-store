'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks/use-cart'
import { formatCurrency } from '@/lib/utils'
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { Lock, Truck, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface AddressForm {
  name: string
  email: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

const initialAddress: AddressForm = {
  name: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
}

function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const stripe = useStripe()
  const elements = useElements()
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [shippingAddress, setShippingAddress] = useState<AddressForm>(initialAddress)
  const [billingAddress, setBillingAddress] = useState<AddressForm>(initialAddress)
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null)

  const shipping = subtotal > 50 || items.some((item) => item.product.type === 'DIGITAL') ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('payment')
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: billingAddress.name,
          email: billingAddress.email,
          phone: billingAddress.phone,
          address: {
            line1: billingAddress.line1,
            line2: billingAddress.line2,
            city: billingAddress.city,
            state: billingAddress.state,
            postal_code: billingAddress.postalCode,
            country: billingAddress.country,
          },
        },
      })

      if (error) {
        toast({ title: 'Payment Error', description: error.message, variant: 'destructive' })
        return
      }

      setPaymentMethodId(paymentMethod!.id)
      setStep('review')
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!paymentMethodId) return

    setIsProcessing(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shippingAddress,
          billingAddress: sameAsBilling ? shippingAddress : billingAddress,
          paymentMethodId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      if (data.clientSecret) {
        const { error } = await stripe!.confirmCardPayment(data.clientSecret, {
          payment_method: paymentMethodId,
        })

        if (error) {
          throw new Error(error.message || 'Payment failed')
        }
      }

      await clearCart()
      router.push(`/orders/${data.orderId}?success=true`)
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Order failed', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    if (step === 'payment') setStep('shipping')
    else if (step === 'review') setStep('payment')
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <Link href="/shop" className="mt-4 inline-block">
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        </div>

        <div className="flex gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4 mb-8">
              {['Shipping', 'Payment', 'Review'].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      ['shipping', 'payment', 'review'].indexOf(step) >= i
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {['shipping', 'payment', 'review'].indexOf(step) > i ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 2 && <div className="hidden w-16 h-0.5 bg-muted ml-2" />}
                </div>
              ))}
            </div>

            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="line1">Address</Label>
                  <Input
                    id="line1"
                    value={shippingAddress.line1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
                  <Input
                    id="line2"
                    value={shippingAddress.line2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">ZIP Code</Label>
                    <Input
                      id="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameAsBilling"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="sameAsBilling" className="cursor-pointer">
                    Billing address is the same as shipping
                  </Label>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button type="submit" className="w-full sm:w-auto">
                    Continue to Payment
                  </Button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </h2>

                {!sameAsBilling && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <h3 className="font-medium mb-4">Billing Address</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="billingName">Full Name</Label>
                        <Input
                          id="billingName"
                          value={billingAddress.name}
                          onChange={(e) => setBillingAddress({ ...billingAddress, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="billingEmail">Email</Label>
                        <Input
                          id="billingEmail"
                          type="email"
                          value={billingAddress.email}
                          onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingLine1">Address</Label>
                        <Input
                          id="billingLine1"
                          value={billingAddress.line1}
                          onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingCity">City</Label>
                        <Input
                          id="billingCity"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingState">State</Label>
                        <Input
                          id="billingState"
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="billingPostalCode">ZIP Code</Label>
                        <Input
                          id="billingPostalCode"
                          value={billingAddress.postalCode}
                          onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border bg-card p-4">
                  <Label htmlFor="card">Card Details</Label>
                  <div id="card" className="mt-2" />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isProcessing || !stripe} className="w-full sm:w-auto">
                    {isProcessing ? 'Processing...' : 'Continue to Review'}
                  </Button>
                </div>
              </form>
            )}

            {step === 'review' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Review Order
                </h2>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium mb-3">Shipping to</h3>
                  <address className="not-italic text-sm text-muted-foreground">
                    {shippingAddress.name}<br />
                    {shippingAddress.line1}
                    {shippingAddress.line2 && <><br />{shippingAddress.line2}</>}
                    <br />
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                    {shippingAddress.country}
                  </address>
                </div>

                {!sameAsBilling && (
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="font-medium mb-3">Billing Address</h3>
                    <address className="not-italic text-sm text-muted-foreground">
                      {billingAddress.name}<br />
                      {billingAddress.line1}
                      {billingAddress.line2 && <><br />{billingAddress.line2}</>}
                      <br />
                      {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}<br />
                      {billingAddress.country}
                    </address>
                  </div>
                )}

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium mb-3">Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    Ending in •••• (Card)
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full sm:w-auto" size="lg">
                    {isProcessing ? 'Placing Order...' : `Place Order - ${formatCurrencyUtil(total)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-80">
            <div className="sticky top-24 rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={item.product.images[0]?.url || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      {item.variant && <p className="text-xs text-muted-foreground">{item.variant.name}</p>}
                      <p className="text-sm font-medium">{formatCurrency(item.product.price)} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <dl className="mt-4 space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd className="font-medium">{formatCurrency(tax)}</dd>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <dt>Total</dt>
                  <dd>{formatCurrency(total)}</dd>
                </div>
              </dl>

              <p className="mt-4 text-xs text-muted-foreground text-center">
                <Lock className="inline h-3 w-3" />
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckoutForm() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutPage />
    </Elements>
  )
}

export { CheckoutForm as default }