import prisma from './prisma'
import { SupplierType } from '@prisma/client'

export interface SupplierOrderRequest {
  supplierProductId: string
  quantity: number
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  customerEmail: string
  referenceId: string
}

export interface SupplierOrderResponse {
  success: boolean
  orderId?: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: Date
  error?: string
}

export abstract class BaseSupplier {
  abstract readonly type: SupplierType
  abstract readonly name: string

  abstract placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse>
  abstract getTracking(orderId: string): Promise<{ trackingNumber: string; trackingUrl: string; status: string } | null>
  abstract syncInventory(productId: string): Promise<{ quantity: number; price: number } | null>
  abstract validateCredentials(): Promise<boolean>
}

export class ManualSupplier extends BaseSupplier {
  readonly type = 'MANUAL' as SupplierType
  readonly name = 'Manual Fulfillment'

  async placeOrder(): Promise<SupplierOrderResponse> {
    return { success: true, orderId: `MANUAL-${Date.now()}` }
  }

  async getTracking(): Promise<null> {
    return null
  }

  async syncInventory(): Promise<null> {
    return null
  }

  async validateCredentials(): Promise<boolean> {
    return true
  }
}

export class AliExpressSupplier extends BaseSupplier {
  readonly type = 'ALIEXPRESS' as SupplierType
  readonly name = 'AliExpress'

  private apiKey: string
  private apiSecret: string

  constructor(apiKey: string, apiSecret: string) {
    super()
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }

  async placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
    try {
      const response = await fetch('https://api.aliexpress.com/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          product_id: request.supplierProductId,
          quantity: request.quantity,
          shipping_address: request.shippingAddress,
          buyer_email: request.customerEmail,
          reference_id: request.referenceId,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        return {
          success: true,
          orderId: data.order_id,
          trackingNumber: data.tracking_number,
          trackingUrl: data.tracking_url,
          estimatedDelivery: data.estimated_delivery ? new Date(data.estimated_delivery) : undefined,
        }
      }

      return { success: false, error: data.error_message || 'Failed to place order' }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async getTracking(orderId: string): Promise<{ trackingNumber: string; trackingUrl: string; status: string } | null> {
    try {
      const response = await fetch(`https://api.aliexpress.com/order/tracking/${orderId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      })
      const data = await response.json()
      return {
        trackingNumber: data.tracking_number,
        trackingUrl: data.tracking_url,
        status: data.status,
      }
    } catch {
      return null
    }
  }

  async syncInventory(productId: string): Promise<{ quantity: number; price: number } | null> {
    return null
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch('https://api.aliexpress.com/account/verify', {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export class SpocketSupplier extends BaseSupplier {
  readonly type = 'SPOCKET' as SupplierType
  readonly name = 'Spocket'

  private apiKey: string

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async placeOrder(request: SupplierOrderRequest): Promise<SupplierOrderResponse> {
    try {
      const response = await fetch('https://api.spocket.co/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          line_items: [{
            variant_id: request.supplierProductId,
            quantity: request.quantity,
          }],
          shipping_address: request.shippingAddress,
          customer_email: request.customerEmail,
        }),
      })

      const data = await response.json()
      
      return {
        success: true,
        orderId: data.id,
        trackingNumber: data.tracking_number,
        trackingUrl: data.tracking_url,
      }
    } catch (error) {
      return { success: false, error: 'Failed to place Spocket order' }
    }
  }

  async getTracking(orderId: string) {
    return null
  }

  async syncInventory() {
    return null
  }

  async validateCredentials(): Promise<boolean> {
    return true
  }
}

export function getSupplier(supplierType: SupplierType, config: Record<string, string>): BaseSupplier {
  switch (supplierType) {
    case 'ALIEXPRESS':
      return new AliExpressSupplier(config.apiKey!, config.apiSecret!)
    case 'SPOCKET':
      return new SpocketSupplier(config.apiKey!)
    case 'CJ_DROPSHIPPING':
      return new ManualSupplier()
    case 'PRINTFUL':
      return new ManualSupplier()
    case 'PRINTIFY':
      return new ManualSupplier()
    default:
      return new ManualSupplier()
  }
}

export async function fulfillOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              supplier: {
                include: { supplier: true },
              },
            },
          },
        },
      },
    },
  })

  if (!order) throw new Error('Order not found')

  for (const item of order.items) {
    const supplierRecord = item.product.supplier?.supplier
    if (supplierRecord) {
      const supplier = getSupplier(supplierRecord.type, {
        apiKey: supplierRecord.apiKey || '',
        apiSecret: supplierRecord.apiKey || '',
      })

      const result = await supplier.placeOrder({
        supplierProductId: item.product.supplier?.supplierSku ?? '',
        quantity: item.quantity,
        shippingAddress: order.shippingAddress as any,
        customerEmail: order.email,
        referenceId: order.id,
      })

      if (result.success && result.trackingNumber) {
        await prisma.shipment.create({
          data: {
            orderId: order.id,
            trackingNumber: result.trackingNumber,
            carrier: supplier.name,
            status: 'IN_TRANSIT',
            shippedAt: new Date(),
            items: {
              create: {
                orderItemId: item.id,
                quantity: item.quantity,
              },
            },
          },
        })

        await prisma.order.update({
          where: { id: order.id },
          data: {
            fulfillmentStatus: 'FULFILLED',
            status: 'SHIPPED',
          },
        })
      }
    }
  }
}

export async function syncAllInventory(): Promise<void> {
  const supplierProducts = await prisma.supplierProduct.findMany({
    where: { syncInventory: true },
    include: { product: true, supplier: true },
  })

  for (const sp of supplierProducts) {
    const supplier = getSupplier(sp.supplier.type, {
      apiKey: sp.supplier.apiKey || '',
      apiSecret: sp.supplier.apiKey || '',
    })

    const inventory = await supplier.syncInventory(sp.productId)
    if (inventory) {
      await prisma.product.update({
        where: { id: sp.productId },
        data: { quantity: inventory.quantity },
      })
      await prisma.supplierProduct.update({
        where: { id: sp.id },
        data: { lastSynced: new Date() },
      })
    }
  }
}