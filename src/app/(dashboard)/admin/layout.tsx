'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Box,
  FileText,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Suppliers', href: '/admin/suppliers', icon: Box },
  { name: 'Digital Files', href: '/admin/digital', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user && (session.user as any).role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user || (session.user as any).role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card">
        <div className="flex h-16 items-center px-6 border-b">
          <Link href="/admin" className="text-xl font-bold">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
            View Store
          </Button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-semibold">
              {navigation.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))?.name || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {(session.user as any).role}
              </span>
              <Button variant="ghost" size="icon" onClick={() => router.push('/api/auth/signout')}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}