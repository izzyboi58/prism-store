import { Product, Category, Order, Cart, User, ProductVariant, ProductImage } from '@prisma/client'

export type ProductWithRelations = Product & {
  category: Category
  images: ProductImage[]
  variants: ProductVariant[]
}

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product & {
      images: ProductImage[]
      variants: ProductVariant[]
    }
    variant?: ProductVariant | null
  })[]
}

export type CartItem = {
  id: string
  cartId: string
  productId: string
  variantId: string | null
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
    variant?: ProductVariant | null
  })[]
  user: Pick<User, 'id' | 'name' | 'email'>
}

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  variantId: string | null
  name: string
  sku: string
  price: number
  quantity: number
  total: number
}

export type CheckoutData = {
  email: string
  phone?: string
  shippingAddress: AddressFormData
  billingAddress: AddressFormData
  sameAsBilling: boolean
  paymentMethodId?: string
}

export type AddressFormData = {
  name: string
  phone?: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type ProductFilters = {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
  page?: number
  limit?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type StripePaymentIntent = {
  clientSecret: string
  paymentIntentId: string
}

export type SupplierConfig = {
  id: string
  name: string
  type: 'ALIEXPRESS' | 'SPOCKET' | 'CJ_DROPSHIPPING' | 'PRINTFUL' | 'PRINTIFY' | 'CUSTOM_API'
  apiUrl?: string
  apiKey?: string
  autoFulfill: boolean
}