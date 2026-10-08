'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold" aria-label="Home">
            YourStore
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6">
            <Link href="/shop" className="text-sm font-medium transition-colors hover:text-primary">Shop</Link>
            <Link href="/shop?category=digital" className="text-sm font-medium transition-colors hover:text-primary">Digital</Link>
            <Link href="/shop?category=physical" className="text-sm font-medium transition-colors hover:text-primary">Physical</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              onFocus={() => setSearchOpen(true)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                0
              </span>
            </Link>

            {status === 'loading' ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              <div className="relative">
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 py-4">
          <div className="flex flex-col gap-4">
            <Link href="/shop" className="text-sm font-medium">Shop</Link>
            <Link href="/shop?category=digital" className="text-sm font-medium">Digital</Link>
            <Link href="/shop?category=physical" className="text-sm font-medium">Physical</Link>
            {session ? (
              <>
                <Link href="/account" className="text-sm font-medium">Account</Link>
                <Button variant="link" onClick={() => signOut()}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="link">Sign In</Button></Link>
                <Link href="/register"><Button variant="link">Sign Up</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}