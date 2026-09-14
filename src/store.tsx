import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createCatalog } from './data/catalog'
import { stockStatus, type CartItem, type Order, type Product, type User } from './types'

type Toast = { id: number; message: string }

type Store = {
  products: Product[]
  cart: CartItem[]
  user: User | null
  orders: Order[]
  toasts: Toast[]
  searchOpen: boolean
  cartOpen: boolean
  menuOpen: boolean
  setSearchOpen: (v: boolean) => void
  setCartOpen: (v: boolean) => void
  setMenuOpen: (v: boolean) => void
  addToCart: (productId: string, size: string, qty?: number) => void
  updateQty: (productId: string, size: string, qty: number) => void
  removeFromCart: (productId: string, size: string) => void
  clearCart: () => void
  login: (email: string, name?: string) => void
  logout: () => void
  toast: (message: string) => void
  upsertProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  placeOrder: (input: {
    customer: string
    payment: string
    total: number
    items?: { name: string; qty: number; price: number }[]
  }) => Order
}

const KEY = 'style-heaven-store-v2'
const StoreContext = createContext<Store | null>(null)

function seedOrders(): Order[] {
  const names = [
    'Ayesha Rahman',
    'Nafisa Karim',
    'Farhan Ahmed',
    'Meherin Chowdhury',
    'Sadia Islam',
    'Rafiul Hasan',
  ]
  const payments = ['Visa', 'bKash', 'Nagad', 'SSLCommerz']
  const statuses: Order['status'][] = ['Paid', 'Processing', 'Shipped', 'Delivered']
  return Array.from({ length: 24 }, (_, i) => ({
    id: `SH-24${String(108 + i)}`,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    items: [{ name: 'Silk Scarf', qty: 1, price: 6450 + i * 250 }],
    total: 6570 + i * 250,
    status: statuses[i % statuses.length],
    customer: names[i % names.length],
    payment: payments[i % payments.length],
  }))
}

type Persisted = {
  products: Product[]
  cart: CartItem[]
  user: User | null
  orders: Order[]
}

function load(): Persisted {
  const catalog = createCatalog()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { products: catalog, cart: [], user: null, orders: seedOrders() }
    const parsed = JSON.parse(raw) as Persisted
    return {
      products: parsed.products?.length ? parsed.products : catalog,
      cart: parsed.cart ?? [],
      user: parsed.user ?? null,
      orders: parsed.orders?.length ? parsed.orders : seedOrders(),
    }
  } catch {
    return { products: catalog, cart: [], user: null, orders: seedOrders() }
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const data = load()
    setProducts(data.products)
    setCart(data.cart)
    setUser(data.user)
    setOrders(data.orders)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(KEY, JSON.stringify({ products, cart, user, orders }))
  }, [products, cart, user, orders, ready])

  const toast = (message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }

  const value = useMemo<Store>(
    () => ({
      products,
      cart,
      user,
      orders,
      toasts,
      searchOpen,
      cartOpen,
      menuOpen,
      setSearchOpen,
      setCartOpen,
      setMenuOpen,
      toast,
      addToCart: (productId, size, qty = 1) => {
        const product = products.find((p) => p.id === productId)
        if (!product || product.stock <= 0) {
          toast('This piece is currently unavailable.')
          return
        }
        setCart((items) => {
          const found = items.find((i) => i.productId === productId && i.size === size)
          if (found) {
            return items.map((i) =>
              i.productId === productId && i.size === size ? { ...i, qty: i.qty + qty } : i,
            )
          }
          return [...items, { productId, size, qty }]
        })
        setCartOpen(true)
        toast('Added to bag')
      },
      updateQty: (productId, size, qty) => {
        setCart((items) =>
          items
            .map((i) => (i.productId === productId && i.size === size ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        )
      },
      removeFromCart: (productId, size) => {
        setCart((items) => items.filter((i) => !(i.productId === productId && i.size === size)))
      },
      clearCart: () => setCart([]),
      login: (email, name) => {
        const admin = email.toLowerCase().includes('admin')
        setUser({
          email,
          name: name || (admin ? 'Admin' : email.split('@')[0]),
          role: admin ? 'admin' : 'customer',
        })
      },
      logout: () => setUser(null),
      upsertProduct: (product) => {
        const next = { ...product, status: stockStatus(product.stock) }
        setProducts((list) => {
          const index = list.findIndex((p) => p.id === next.id)
          if (index === -1) return [next, ...list]
          const copy = [...list]
          copy[index] = next
          return copy
        })
      },
      deleteProduct: (id) => setProducts((list) => list.filter((p) => p.id !== id)),
      placeOrder: ({ customer, payment, total, items }) => {
        const order: Order = {
          id: `SH-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString(),
          items:
            items ??
            cart.map((item) => {
              const product = products.find((p) => p.id === item.productId)
              return {
                name: product?.name ?? 'Item',
                qty: item.qty,
                price: product?.price ?? 0,
              }
            }),
          total,
          status: 'Paid',
          customer,
          payment,
        }
        setOrders((list) => [order, ...list])
        setCart([])
        return order
      },
    }),
    [products, cart, user, orders, toasts, searchOpen, cartOpen, menuOpen],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('Store missing')
  return ctx
}

export function useCartCount() {
  const { cart } = useStore()
  return cart.reduce((sum, item) => sum + item.qty, 0)
}

export function useCartLines() {
  const { cart, products } = useStore()
  return cart.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    return { ...item, product }
  })
}
