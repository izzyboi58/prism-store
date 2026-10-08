'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from './use-toast'

interface CartItem {
  id: string
  productId: string
  variantId?: string | null
  quantity: number
  variant?: {
    id: string
    name: string
    price: number | string
  } | null
  product: {
    id: string
    name: string
    slug: string
    price: number | string
    compareAt?: number | string | null
    type?: string
    images: { url: string; alt?: string | null }[]
    variants: { id: string; name: string; price: number | string }[]
  }
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (productId: string, variantId?: string, quantity = 1) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity }),
      })
      if (res.ok) {
        await fetchCart()
        toast({ title: 'Added to cart', variant: 'success' })
      } else {
        throw new Error('Failed to add item')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add item to cart', variant: 'destructive' })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchCart()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove item', variant: 'destructive' })
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return removeItem(itemId)
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (res.ok) {
        await fetchCart()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update quantity', variant: 'destructive' })
    }
  }

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' })
      if (res.ok) {
        setItems([])
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear cart', variant: 'destructive' })
    }
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart, isLoading }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}