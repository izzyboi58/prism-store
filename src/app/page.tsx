import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download, Truck, Shield, Star } from 'lucide-react'

const features = [
  {
    icon: Download,
    title: 'Digital Goods',
    description: 'Instant download after purchase. Software, ebooks, templates, and more.',
  },
  {
    icon: Truck,
    title: 'Physical Products',
    description: 'Curated physical products with fast shipping and dropshipping options.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Powered by Stripe. Your payment information is always protected.',
  },
  {
    icon: Star,
    title: 'Quality Guaranteed',
    description: 'Hand-picked products with 30-day money-back guarantee.',
  },
]

const categories = [
  {
    name: 'Software & Tools',
    slug: 'software',
    count: 42,
    description: 'Productivity, design, development tools',
  },
  {
    name: 'Ebooks & Courses',
    slug: 'ebooks',
    count: 128,
    description: 'Learn new skills with expert content',
  },
  {
    name: 'Templates & Themes',
    slug: 'templates',
    count: 67,
    description: 'Website templates, UI kits, presentations',
  },
  {
    name: 'Graphics & Assets',
    slug: 'graphics',
    count: 203,
    description: 'Icons, illustrations, photos, fonts',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Digital & Physical Products{' '}
              <span className="text-primary">Delivered Instantly</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Discover thousands of digital goods, software, courses, and curated physical products.
              Instant downloads, secure payments, and quality guaranteed.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </Link>
              <Link href="/shop?category=digital">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse Digital Goods
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="mt-2 text-muted-foreground">Explore our curated collections</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop?category=${category.slug}`}
                className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 text-3xl">📦</div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{category.count} products</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Why Choose Us?</h2>
            <p className="mt-2 text-muted-foreground">Built for modern digital commerce</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Start Selling?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators and merchants selling digital and physical products worldwide.
            Set up your store in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/register">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}