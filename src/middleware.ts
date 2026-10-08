import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (path.startsWith('/checkout') && !token) {
      const callbackUrl = encodeURIComponent(path)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path.startsWith('/admin')) return !!token && token.role === 'ADMIN'
        if (path.startsWith('/checkout')) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/account/:path*'],
}