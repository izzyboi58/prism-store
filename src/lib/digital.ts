import prisma from './prisma'
import { createHash, randomBytes } from 'crypto'

export interface DigitalDelivery {
  downloadUrl: string
  licenseKey?: string
  expiresAt?: Date
  maxDownloads?: number
}

export async function generateLicenseKey(productId: string, orderId: string): Promise<string> {
  const prefix = productId.slice(0, 4).toUpperCase()
  const random = randomBytes(8).toString('hex').toUpperCase()
  const hash = createHash('sha256').update(`${productId}-${orderId}-${Date.now()}`).digest('hex').slice(0, 8).toUpperCase()
  return `${prefix}-${random}-${hash}`
}

export async function createDigitalDelivery(
  userId: string,
  digitalFileId: string,
  orderId?: string
): Promise<DigitalDelivery> {
  const digitalFile = await prisma.digitalFile.findUnique({
    where: { id: digitalFileId },
    include: { product: true },
  })

  if (!digitalFile) throw new Error('Digital file not found')

  const licenseKey = digitalFile.product.type === 'DIGITAL' 
    ? await generateLicenseKey(digitalFile.productId, orderId || '')
    : undefined

  const download = await prisma.download.create({
    data: {
      userId,
      digitalFileId,
      orderId,
      ipAddress: 'unknown',
    },
  })

  const downloadUrl = `/api/download/${download.id}`

  return {
    downloadUrl,
    licenseKey,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxDownloads: 5,
  }
}

export async function verifyDownloadAccess(
  downloadId: string,
  userId: string
): Promise<{ allowed: boolean; digitalFile?: any; error?: string }> {
  const download = await prisma.download.findUnique({
    where: { id: downloadId },
    include: { digitalFile: { include: { product: true } } },
  })

  if (!download) {
    return { allowed: false, error: 'Download not found' }
  }

  if (download.userId !== userId) {
    return { allowed: false, error: 'Unauthorized' }
  }

  const userDownloads = await prisma.download.count({
    where: {
      userId,
      digitalFileId: download.digitalFileId,
    },
  })

  if (userDownloads >= 5) {
    return { allowed: false, error: 'Maximum downloads reached' }
  }

  if (download.digitalFile.product.status !== 'ACTIVE') {
    return { allowed: false, error: 'Product no longer available' }
  }

  return { allowed: true, digitalFile: download.digitalFile }
}

export async function incrementDownloadCount(downloadId: string): Promise<void> {
  await prisma.download.update({
    where: { id: downloadId },
    data: { downloadedAt: new Date() },
  })
}

export async function getUserDownloads(userId: string) {
  return prisma.download.findMany({
    where: { userId },
    include: {
      digitalFile: {
        include: { product: { include: { images: true } } },
      },
      order: true,
    },
    orderBy: { downloadedAt: 'desc' },
  })
}