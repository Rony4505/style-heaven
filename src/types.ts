export type ProductStatus = 'Active' | 'Low Stock' | 'Out of Stock'
export type Lang = 'en' | 'bn'
export type OrderStatus = 'Confirmed' | 'Packed' | 'Shipped' | 'Out for delivery' | 'Delivered'
export type CampaignType = 'offer' | 'discount' | 'advertising' | 'coupon'
export type PaymentMethod = 'Visa / Mastercard' | 'bKash' | 'Nagad' | 'Cash on delivery'
export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple'
export type UserRole = 'customer' | 'admin' | 'moderator'

export type ColorOption = {
  name: string
  hex: string
}

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
  hasSize: boolean
  hasColor: boolean
  sizes: string[]
  colors: ColorOption[]
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
  password?: string
  role: UserRole
  provider?: AuthProvider
}

export type Moderator = {
  id: string
  name: string
  email: string
  phone: string
  password: string
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
  startAt: string
  endAt: string
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
  payCardName: string
  payCardNumber: string
  payBkash: string
  payNagad: string
  defaultShipping: number
  deliveryCharges: Record<string, number>
  moderators: Moderator[]
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

const NAMED_HEX: Record<string, string> = {
  'Jamdani Cream': '#f4e7d0',
  'Champagne Gold': '#d4b56a',
  Blush: '#e8b4b8',
  Charcoal: '#3d3a38',
  Midnight: '#1b2436',
  Ivory: '#f6f1e6',
  Bronze: '#b08d57',
}

export function namedHex(name: string) {
  return NAMED_HEX[name] || '#c4a35a'
}

export function asColor(value: unknown): ColorOption {
  if (value && typeof value === 'object' && 'name' in (value as object)) {
    const c = value as ColorOption
    return { name: c.name, hex: c.hex || namedHex(c.name) }
  }
  const name = String(value ?? '')
  return { name, hex: namedHex(name) }
}

export function colorName(value: ColorOption | string | undefined) {
  if (!value) return ''
  return typeof value === 'string' ? value : value.name
}

export function campaignDays(startAt: string, endAt: string) {
  const ms = new Date(endAt).getTime() - new Date(startAt).getTime()
  return Math.max(1, Math.round(ms / 86400000))
}

export function toInputDate(iso: string) {
  if (!iso) return ''
  return iso.slice(0, 10)
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
