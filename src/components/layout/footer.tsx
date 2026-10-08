import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { label: 'All Products', href: '/shop' },
      { label: 'Digital Goods', href: '/shop?category=digital' },
      { label: 'Physical Products', href: '/shop?category=physical' },
      { label: 'New Arrivals', href: '/shop?sort=newest' },
      { label: 'Best Sellers', href: '/shop?sort=popular' },
    ],
    support: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns Policy', href: '/returns' },
      { label: 'Track Order', href: '/track' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
      { label: 'Affiliates', href: '/affiliates' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  }

  const socialLinks = [
    { label: 'Twitter', href: 'https://twitter.com', icon: '𝕏' },
    { label: 'Instagram', href: 'https://instagram.com', icon: '📷' },
    { label: 'Facebook', href: 'https://facebook.com', icon: 'f' },
    { label: 'YouTube', href: 'https://youtube.com', icon: '▶' },
  ]

  return (
    <footer className="border-t bg-muted/50" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="text-xl font-bold" aria-label="YourStore Home">
              YourStore
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop shop for digital goods and physical products.
              Quality products, instant delivery, great prices.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Shop">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Shop</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} YourStore. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Payment Methods</span>
              <div className="flex gap-2 text-muted-foreground">
                <span className="text-xl">💳</span>
                <span className="text-xl">💳</span>
                <span className="text-xl">💳</span>
                <span className="text-xl">💳</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}