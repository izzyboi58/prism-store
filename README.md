# YourStore - Full-Stack E-Commerce Platform

A modern, full-featured e-commerce platform built with Next.js 14, supporting both physical and digital products, dropshipping automation, and secure payments.

## Features

- **Product Catalog**: Categories, variants, images, digital/physical products
- **Shopping Cart**: Persistent cart with quantity management
- **Checkout**: Multi-step checkout with Stripe payments
- **Digital Goods**: Instant download delivery with license keys
- **Dropshipping**: Supplier integration framework (AliExpress, Spocket, Custom APIs)
- **Admin Dashboard**: Orders, products, customers, analytics
- **Authentication**: NextAuth.js with credentials and OAuth
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + custom components
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
cd ecommerce
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for NextAuth (min 32 chars) |
| `NEXTAUTH_URL` | Your app URL |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (dashboard)/     # Admin dashboard
│   ├── (shop)/          # Shop pages (products, cart, checkout)
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── admin/           # Admin components
│   ├── layout/          # Header, Footer
│   ├── products/        # Product components
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions & clients
├── types/               # TypeScript types
└── middleware.ts        # Auth middleware
```

## Database Schema

Key models:
- **User**: Customers, admins with roles
- **Product**: Physical/digital products with variants
- **Category**: Hierarchical categories
- **Order**: Orders with items, shipments
- **Cart**: Persistent shopping carts
- **Supplier**: Dropshipping suppliers
- **DigitalFile**: Digital product files
- **Download**: Download tracking

## Dropshipping Integration

The platform includes a supplier framework supporting:
- Manual fulfillment
- AliExpress (via API)
- Spocket
- CJ Dropshipping
- Printful/Printify
- Custom API integrations

To add a supplier:
1. Create supplier in admin
2. Configure API credentials
3. Link products to supplier SKUs
4. Enable auto-fulfillment

## Digital Goods Delivery

Digital products are delivered via:
- Secure download links (expiring, limited downloads)
- License key generation
- Order-based access control
- Download tracking

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Database

Use a managed PostgreSQL provider:
- Supabase (recommended)
- Neon
- Railway
- PlanetScale

### Stripe Webhooks

Configure webhook endpoint:
```
https://yourdomain.com/api/webhooks/stripe
```

Events to subscribe:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `checkout.session.completed`

## Admin Access

Default admin credentials (after seeding):
- Email: `admin@yourstore.com`
- Password: `admin123`

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

## License

MIT