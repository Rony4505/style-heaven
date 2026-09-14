export type ProductStatus = 'Active' | 'Low Stock' | 'Out of Stock'
export type Lang = 'en' | 'bn'
export type OrderStatus = 'Confirmed' | 'Packed' | 'Shipped' | 'Out for delivery' | 'Delivered'
export type CampaignType = 'offer' | 'discount' | 'advertising' | 'coupon'
export type PaymentMethod = 'Visa / Mastercard' | 'bKash' | 'Nagad' | 'Cash on delivery'

export type Product = {
  id: string
  slug: string
  name: string
  subtitle: string
  code: string
  category: string
  collection: string
  buyingPrice: number
  sellingPrice: number
  stock: number
  status: ProductStatus
  images: string[]
  description: string
  motif?: string
  sizes: string[]
  colors: string[]
  material: string
  origin: string
  imageScrollSeconds: number
  featured?: boolean
  shopVisible?: boolean
}

export type CartItem = {
  productId: string
  size: string
  color: string
  qty: number
}

export type User = {
  name: string
  email: string
  phone?: string
  role: 'customer' | 'admin'
}

export type OrderItem = {
  productId: string
  name: string
  qty: number
  price: number
  size: string
  color: string
}

export type Order = {
  id: string
  trackingNumber: string
  createdAt: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  status: OrderStatus
  payment: PaymentMethod
  paymentAccount: string
  customerName: string
  email: string
  phone: string
  phoneDial: string
  address: string
  city: string
  district: string
  postal: string
  country: string
  guest: boolean
  userEmail?: string
}

export type HeroSlide = {
  id: string
  image: string
  title: string
}

export type AdSlide = {
  id: string
  image: string
  title: string
  link: string
}

export type Campaign = {
  id: string
  type: CampaignType
  title: string
  productId: string
  value: string
  days: number
  startAt: string
  code?: string
}

export type MediaSettings = {
  heroSlides: HeroSlide[]
  heroSeconds: number
  ads: AdSlide[]
  adSeconds: number
  campaigns: Campaign[]
}

export type SiteSettings = {
  adminEmail: string
  adminPassword: string
  adminPhone: string
  twoFactor: boolean
  loginAlerts: boolean
  sessionHours: number
}

export function stockStatus(stock: number): ProductStatus {
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 14) return 'Low Stock'
  return 'Active'
}

export function formatBdt(n: number) {
  return n.toLocaleString('en-BD')
}

export function productImage(p?: Product | null) {
  return p?.images?.[0] || ''
}

export const DEFAULT_CATEGORIES = [
  'Scarves',
  'Tops',
  'Dresses',
  'Loungewear',
  'Accessories',
  'Sarees',
]

export const DEFAULT_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'Regular – 90cm x 200cm',
  'Grande – 110cm x 220cm',
  '90cm x 90cm',
  '2.5m',
  '5.5m with blouse piece',
  'Standard pair',
  'King pair',
]

export const DEFAULT_COLORS = [
  'Jamdani Cream',
  'Champagne Gold',
  'Blush',
  'Charcoal',
  'Midnight',
  'Ivory',
  'Bronze',
]
