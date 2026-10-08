import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yourstore.com' },
    update: {},
    create: {
      email: 'admin@yourstore.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('Created admin:', admin.email)

  // Create test customer
  const customerPassword = await hash('customer123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Test Customer',
      password: customerPassword,
      role: 'CUSTOMER',
    },
  })
  console.log('Created customer:', customer.email)

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
    },
  })

  const software = await prisma.category.upsert({
    where: { slug: 'software' },
    update: {},
    create: {
      name: 'Software & Tools',
      slug: 'software',
      description: 'Productivity, design, and development tools',
    },
  })

  const ebooks = await prisma.category.upsert({
    where: { slug: 'ebooks' },
    update: {},
    create: {
      name: 'Ebooks & Courses',
      slug: 'ebooks',
      description: 'Learn new skills with expert content',
    },
  })

  const templates = await prisma.category.upsert({
    where: { slug: 'templates' },
    update: {},
    create: {
      name: 'Templates & Themes',
      slug: 'templates',
      description: 'Website templates, UI kits, presentations',
    },
  })

  console.log('Created categories')

  // Create physical products
  const laptop = await prisma.product.upsert({
    where: { slug: 'premium-laptop' },
    update: {},
    create: {
      name: 'Premium Laptop 15"',
      slug: 'premium-laptop',
      description: 'High-performance laptop with latest processor, 16GB RAM, 512GB SSD. Perfect for work and creative tasks.',
      shortDesc: 'High-performance laptop with latest processor, 16GB RAM, 512GB SSD',
      price: 1299.99,
      compareAt: 1499.99,
      cost: 900,
      sku: 'LAP-001',
      trackQty: true,
      quantity: 25,
      weight: 1.8,
      status: 'ACTIVE',
      type: 'PHYSICAL',
      categoryId: electronics.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', alt: 'Premium Laptop', position: 0 },
        ],
      },
      variants: {
        create: [
          { name: 'Silver / 16GB / 512GB', sku: 'LAP-001-SIL', price: 1299.99, quantity: 10, attributes: { color: 'Silver', ram: '16GB', storage: '512GB' } },
          { name: 'Space Gray / 16GB / 512GB', sku: 'LAP-001-SG', price: 1299.99, quantity: 8, attributes: { color: 'Space Gray', ram: '16GB', storage: '512GB' } },
          { name: 'Silver / 32GB / 1TB', sku: 'LAP-001-SIL-32', price: 1599.99, quantity: 5, attributes: { color: 'Silver', ram: '32GB', storage: '1TB' } },
        ],
      },
    },
  })

  const headphones = await prisma.product.upsert({
    where: { slug: 'wireless-headphones' },
    update: {},
    create: {
      name: 'Wireless Noise-Canceling Headphones',
      slug: 'wireless-headphones',
      description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and exceptional sound quality.',
      shortDesc: 'Premium wireless headphones with ANC and 30-hour battery',
      price: 349.99,
      compareAt: 399.99,
      cost: 180,
      sku: 'AUD-001',
      trackQty: true,
      quantity: 50,
      weight: 0.3,
      status: 'ACTIVE',
      type: 'PHYSICAL',
      categoryId: electronics.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'Wireless Headphones', position: 0 },
        ],
      },
      variants: {
        create: [
          { name: 'Black', sku: 'AUD-001-BLK', price: 349.99, quantity: 20, attributes: { color: 'Black' } },
          { name: 'Silver', sku: 'AUD-001-SIL', price: 349.99, quantity: 15, attributes: { color: 'Silver' } },
          { name: 'Rose Gold', sku: 'AUD-001-RG', price: 349.99, quantity: 15, attributes: { color: 'Rose Gold' } },
        ],
      },
    },
  })

  // Create digital products
  const designCourse = await prisma.product.upsert({
    where: { slug: 'ui-design-masterclass' },
    update: {},
    create: {
      name: 'UI Design Masterclass',
      slug: 'ui-design-masterclass',
      description: 'Complete course on modern UI design. Learn Figma, design systems, prototyping, and handoff. 40+ hours of video content.',
      shortDesc: 'Complete UI design course with Figma, design systems, and prototyping',
      price: 199,
      compareAt: 299,
      cost: 0,
      sku: 'DIG-UI-001',
      trackQty: false,
      quantity: 999,
      status: 'ACTIVE',
      type: 'DIGITAL',
      categoryId: ebooks.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1558655146-9f40138edc84?w=800', alt: 'UI Design Course', position: 0 },
        ],
      },
      digitalFile: {
        create: {
          url: 'https://example.com/downloads/ui-design-masterclass.zip',
          name: 'UI Design Masterclass - Complete Course.zip',
          size: 5242880000,
          mimeType: 'application/zip',
        },
      },
    },
  })

  const reactTemplate = await prisma.product.upsert({
    where: { slug: 'react-dashboard-template' },
    update: {},
    create: {
      name: 'React Admin Dashboard Template',
      slug: 'react-dashboard-template',
      description: 'Production-ready React admin dashboard with TypeScript, Tailwind CSS, authentication, charts, tables, and more.',
      shortDesc: 'Production-ready React admin dashboard with TypeScript & Tailwind',
      price: 79,
      compareAt: 129,
      cost: 0,
      sku: 'DIG-REACT-001',
      trackQty: false,
      quantity: 999,
      status: 'ACTIVE',
      type: 'DIGITAL',
      categoryId: templates.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', alt: 'React Dashboard Template', position: 0 },
        ],
      },
      digitalFile: {
        create: {
          url: 'https://example.com/downloads/react-dashboard-template.zip',
          name: 'React Admin Dashboard Template.zip',
          size: 104857600,
          mimeType: 'application/zip',
        },
      },
    },
  })

  const ebook = await prisma.product.upsert({
    where: { slug: 'javascript-advanced-guide' },
    update: {},
    create: {
      name: 'Advanced JavaScript Patterns',
      slug: 'javascript-advanced-guide',
      description: 'Deep dive into advanced JavaScript patterns, functional programming, async patterns, and modern best practices. 350+ pages.',
      shortDesc: 'Advanced JavaScript patterns and best practices guide',
      price: 39,
      compareAt: 59,
      cost: 0,
      sku: 'DIG-JS-001',
      trackQty: false,
      quantity: 999,
      status: 'ACTIVE',
      type: 'DIGITAL',
      categoryId: ebooks.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', alt: 'JavaScript Book', position: 0 },
        ],
      },
      digitalFile: {
        create: {
          url: 'https://example.com/downloads/advanced-javascript-patterns.pdf',
          name: 'Advanced JavaScript Patterns.pdf',
          size: 5242880,
          mimeType: 'application/pdf',
        },
      },
    },
  })

  const figmaKit = await prisma.product.upsert({
    where: { slug: 'design-system-figma-kit' },
    update: {},
    create: {
      name: 'Design System Figma Kit',
      slug: 'design-system-figma-kit',
      description: 'Complete design system with 200+ components, tokens, icons, and documentation. Ready for Figma.',
      shortDesc: 'Complete design system with 200+ components for Figma',
      price: 49,
      compareAt: 79,
      cost: 0,
      sku: 'DIG-FIG-001',
      trackQty: false,
      quantity: 999,
      status: 'ACTIVE',
      type: 'DIGITAL',
      categoryId: templates.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', alt: 'Figma Design System', position: 0 },
        ],
      },
      digitalFile: {
        create: {
          url: 'https://example.com/downloads/design-system-figma-kit.fig',
          name: 'Design System Figma Kit.fig',
          size: 52428800,
          mimeType: 'application/octet-stream',
        },
      },
    },
  })

  console.log('Created products')

  // Create a sample supplier
  const supplier = await prisma.supplier.upsert({
    where: { id: 'supplier-1' },
    update: {},
    create: {
      id: 'supplier-1',
      name: 'TechDrop Suppliers',
      email: 'orders@techdropsuppliers.com',
      type: 'CUSTOM_API',
      apiUrl: 'https://api.techdropsuppliers.com',
      apiKey: 'test-api-key',
      autoFulfill: true,
    },
  })

  await prisma.supplierProduct.upsert({
    where: { id: 'supplier-product-1' },
    update: {},
    create: {
      id: 'supplier-product-1',
      supplierId: supplier.id,
      productId: laptop.id,
      supplierSku: 'TECH-LAP-001',
      cost: 900,
      syncInventory: true,
    },
  })

  console.log('Created supplier')

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })