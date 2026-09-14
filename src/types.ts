export type ProductStatus = 'Active' | 'Low Stock' | 'Out of Stock'

export type Product = {
  id: string
  slug: string
  name: string
  subtitle: string
  sku: string
  category: string
  collection: string
  price: number
  stock: number
  status: ProductStatus
  image: string
  description: string
  motif?: string
  sizeOptions: string[]
  material: string
  origin: string
  shade: string
  featured?: boolean
  shopVisible?: boolean
}

export type CartItem = {
  productId: string
  size: string
  qty: number
}

export type User = {
  name: string
  email: string
  role: 'customer' | 'admin'
}

export type Order = {
  id: string
  createdAt: string
  items: { name: string; qty: number; price: number }[]
  total: number
  status: 'Paid' | 'Processing' | 'Shipped' | 'Delivered'
  customer: string
  payment: string
}

export function stockStatus(stock: number): ProductStatus {
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 14) return 'Low Stock'
  return 'Active'
}

export function formatBdt(n: number) {
  return n.toLocaleString('en-BD')
}

export const CATEGORIES = [
  'Scarves',
  'Tops',
  'Dresses',
  'Loungewear',
  'Accessories',
  'Sarees',
] as const
