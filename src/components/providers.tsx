'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/hooks/use-cart'
import { Toaster } from '@/components/ui/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </SessionProvider>
  )
}