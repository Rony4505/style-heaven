import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createCatalog } from './data/catalog'
import {
  DEFAULT_CATEGORIES,
  DEFAULT_COLORS,
  DEFAULT_SIZES,
  stockStatus,
  type Campaign,
  type CartItem,
  type HeroSlide,
  type Lang,
  type MediaSettings,
  type Order,
  type OrderItem,
  type OrderStatus,
  type Product,
  type SiteSettings,
  type User,
} from './types'

type Toast = { id: number; message: string }

type Store = {
  ready: boolean
  lang: Lang
  setLang: (l: Lang) => void
  products: Product[]
  cart: CartItem[]
  user: User | null
  orders: Order[]
  users: User[]
  categories: string[]
  sizes: string[]
  colors: string[]
  media: MediaSettings
  settings: SiteSettings
  toasts: Toast[]
  searchOpen: boolean
  cartOpen: boolean
  menuOpen: boolean
  invoiceOrder: Order | null
  setSearchOpen: (v: boolean) => void
  setCartOpen: (v: boolean) => void
  setMenuOpen: (v: boolean) => void
  setInvoiceOrder: (o: Order | null) => void
  addToCart: (productId: string, size: string, color: string, qty?: number) => void
  updateQty: (productId: string, size: string, color: string, qty: number) => void
  removeFromCart: (productId: string, size: string, color: string) => void
  clearCart: () => void
  login: (email: string, password: string, name?: string, phone?: string) => boolean
  register: (input: { name: string; email: string; password: string; phone?: string }) => boolean
  logout: () => void
  toast: (message: string) => void
  upsertProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  addCategory: (name: string) => void
  addSize: (name: string) => void
  deleteSize: (name: string) => void
  addColor: (name: string) => void
  deleteColor: (name: string) => void
  setMedia: (media: MediaSettings) => void
  setSettings: (s: SiteSettings) => void
  placeOrder: (input: Omit<Order, 'id' | 'trackingNumber' | 'createdAt' | 'status'> & {
    status?: OrderStatus
  }) => Order
  updateOrder: (id: string, patch: Partial<Order>) => void
  backup: () => string
  restore: (json: string) => boolean
}

const KEY = 'style-heaven-store-v3'
const StoreContext = createContext<Store | null>(null)

function trackingCode() {
  return `SH-TRK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function seedMedia(): MediaSettings {
  return {
    heroSeconds: 5,
    adSeconds: 6,
    heroSlides: [
      { id: 'h1', image: '/images/hero-model.jpg', title: 'Jamdani Saree' },
      { id: 'h2', image: '/images/scarf-jamdani.jpg', title: 'Signature Scarf' },
      { id: 'h3', image: '/images/silk-gold.jpg', title: 'Champagne Silk' },
      { id: 'h4', image: '/images/silk-charcoal.jpg', title: 'Atelier Kaftan' },
    ],
    ads: [
      {
        id: 'a1',
        image: '/images/silk-gold.jpg',
        title: 'Heritage week — complimentary shipping',
        link: '/shop',
      },
    ],
    campaigns: [
      {
        id: 'c1',
        type: 'coupon',
        title: 'Heaven 10',
        productId: '',
        value: '10',
        days: 30,
        startAt: new Date().toISOString(),
        code: 'HEAVEN10',
      },
    ],
  }
}

function seedSettings(): SiteSettings {
  return {
    adminEmail: 'admin@styleheaven.com',
    adminPassword: 'admin123',
    adminPhone: '+8801712345678',
    twoFactor: false,
    loginAlerts: true,
    sessionHours: 12,
  }
}

function seedOrders(products: Product[]): Order[] {
  const people = [
    {
      name: 'Ayesha Rahman',
      email: 'ayesha@mail.com',
      phone: '1712345678',
      guest: false,
    },
    {
      name: 'Unknown',
      email: 'guest.one@mail.com',
      phone: '1811223344',
      guest: true,
    },
    {
      name: 'Farhan Ahmed',
      email: 'farhan@mail.com',
      phone: '1911002200',
      guest: false,
    },
  ]
  const statuses: OrderStatus[] = ['Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered']
  const pays = ['Visa / Mastercard', 'bKash', 'Nagad', 'Cash on delivery'] as const
  return Array.from({ length: 8 }, (_, i) => {
    const person = people[i % people.length]
    const product = products[i % products.length]
    const price = product?.sellingPrice ?? 6500
    return {
      id: `SH-24${String(108 + i)}`,
      trackingNumber: `SH-TRK-24${String(108 + i)}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      items: [
        {
          productId: product?.id ?? '',
          name: product?.name ?? 'Silk Scarf',
          qty: 1,
          price,
          size: product?.sizes[0] ?? '',
          color: product?.colors[0] ?? '',
        },
      ],
      subtotal: price,
      shipping: 120,
      discount: 0,
      total: price + 120,
      status: statuses[i % statuses.length],
      payment: pays[i % pays.length],
      paymentAccount: i % 4 === 3 ? 'COD' : '**** 4580',
      customerName: person.name,
      email: person.email,
      phone: person.phone,
      phoneDial: '880',
      address: '12 Gulshan Avenue',
      city: 'Dhaka',
      district: 'Dhaka',
      postal: '1212',
      country: 'Bangladesh',
      guest: person.guest,
      userEmail: person.guest ? undefined : person.email,
    }
  })
}

type Persisted = {
  products: Product[]
  cart: CartItem[]
  user: User | null
  users: User[]
  orders: Order[]
  categories: string[]
  sizes: string[]
  colors: string[]
  media: MediaSettings
  settings: SiteSettings
  lang: Lang
}

function load(): Persisted {
  const catalog = createCatalog()
  const fallback: Persisted = {
    products: catalog,
    cart: [],
    user: null,
    users: [
      { name: 'Admin', email: 'admin@styleheaven.com', phone: '+8801712345678', role: 'admin' },
      { name: 'Ayesha Rahman', email: 'ayesha@mail.com', phone: '1712345678', role: 'customer' },
      { name: 'Farhan Ahmed', email: 'farhan@mail.com', phone: '1911002200', role: 'customer' },
    ],
    orders: seedOrders(catalog),
    categories: [...DEFAULT_CATEGORIES],
    sizes: [...DEFAULT_SIZES],
    colors: [...DEFAULT_COLORS],
    media: seedMedia(),
    settings: seedSettings(),
    lang: 'en',
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<Persisted>
    return {
      ...fallback,
      ...parsed,
      products: parsed.products?.length ? parsed.products : catalog,
      media: parsed.media ?? fallback.media,
      settings: parsed.settings ?? fallback.settings,
    }
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [media, setMedia] = useState<MediaSettings>(seedMedia())
  const [settings, setSettings] = useState<SiteSettings>(seedSettings())
  const [toasts, setToasts] = useState<Toast[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const data = load()
    setProducts(data.products)
    setCart(data.cart)
    setUser(data.user)
    setUsers(data.users)
    setOrders(data.orders)
    setCategories(data.categories)
    setSizes(data.sizes)
    setColors(data.colors)
    setMedia(data.media)
    setSettings(data.settings)
    setLang(data.lang)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const payload: Persisted = {
      products,
      cart,
      user,
      users,
      orders,
      categories,
      sizes,
      colors,
      media,
      settings,
      lang,
    }
    localStorage.setItem(KEY, JSON.stringify(payload))
  }, [products, cart, user, users, orders, categories, sizes, colors, media, settings, lang, ready])

  const toast = (message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }

  const value = useMemo<Store>(
    () => ({
      ready,
      lang,
      setLang,
      products,
      cart,
      user,
      users,
      orders,
      categories,
      sizes,
      colors,
      media,
      settings,
      toasts,
      searchOpen,
      cartOpen,
      menuOpen,
      invoiceOrder,
      setSearchOpen,
      setCartOpen,
      setMenuOpen,
      setInvoiceOrder,
      toast,
      addToCart: (productId, size, color, qty = 1) => {
        const product = products.find((p) => p.id === productId)
        if (!product || product.stock <= 0) {
          toast('This piece is currently unavailable.')
          return
        }
        setCart((items) => {
          const found = items.find(
            (i) => i.productId === productId && i.size === size && i.color === color,
          )
          if (found) {
            return items.map((i) =>
              i.productId === productId && i.size === size && i.color === color
                ? { ...i, qty: i.qty + qty }
                : i,
            )
          }
          return [...items, { productId, size, color, qty }]
        })
        setCartOpen(true)
        toast(lang === 'bn' ? 'ব্যাগে যোগ হয়েছে' : 'Added to bag')
      },
      updateQty: (productId, size, color, qty) => {
        setCart((items) =>
          items
            .map((i) =>
              i.productId === productId && i.size === size && i.color === color ? { ...i, qty } : i,
            )
            .filter((i) => i.qty > 0),
        )
      },
      removeFromCart: (productId, size, color) => {
        setCart((items) =>
          items.filter((i) => !(i.productId === productId && i.size === size && i.color === color)),
        )
      },
      clearCart: () => setCart([]),
      login: (email, password, name, phone) => {
        const em = email.trim().toLowerCase()
        if (em === settings.adminEmail.toLowerCase()) {
          if (password !== settings.adminPassword) {
            toast('Wrong admin password.')
            return false
          }
          setUser({
            email: settings.adminEmail,
            name: 'Admin',
            phone: settings.adminPhone,
            role: 'admin',
          })
          return true
        }
        const existing = users.find((u) => u.email.toLowerCase() === em)
        setUser(
          existing ?? {
            email: em,
            name: name || em.split('@')[0],
            phone,
            role: 'customer',
          },
        )
        if (!existing) {
          setUsers((list) => [
            ...list,
            { email: em, name: name || em.split('@')[0], phone, role: 'customer' },
          ])
        }
        return true
      },
      register: ({ name, email, password, phone }) => {
        const em = email.trim().toLowerCase()
        if (users.some((u) => u.email.toLowerCase() === em)) {
          toast('An account with this email already exists.')
          return false
        }
        const next: User = { name, email: em, phone, role: 'customer' }
        setUsers((list) => [...list, next])
        setUser(next)
        void password
        return true
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
      addCategory: (name) => {
        const clean = name.trim()
        if (!clean) return
        setCategories((list) => (list.includes(clean) ? list : [...list, clean]))
      },
      addSize: (name) => {
        const clean = name.trim()
        if (!clean) return
        setSizes((list) => (list.includes(clean) ? list : [...list, clean]))
      },
      deleteSize: (name) => setSizes((list) => list.filter((s) => s !== name)),
      addColor: (name) => {
        const clean = name.trim()
        if (!clean) return
        setColors((list) => (list.includes(clean) ? list : [...list, clean]))
      },
      deleteColor: (name) => setColors((list) => list.filter((s) => s !== name)),
      setMedia,
      setSettings,
      placeOrder: (input) => {
        const order: Order = {
          ...input,
          id: `SH-${Date.now().toString().slice(-6)}`,
          trackingNumber: trackingCode(),
          createdAt: new Date().toISOString(),
          status: input.status ?? (input.payment === 'Cash on delivery' ? 'Confirmed' : 'Confirmed'),
        }
        setOrders((list) => [order, ...list])
        setCart([])
        setInvoiceOrder(order)
        return order
      },
      updateOrder: (id, patch) => {
        setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)))
      },
      backup: () =>
        JSON.stringify(
          {
            products,
            cart,
            user,
            users,
            orders,
            categories,
            sizes,
            colors,
            media,
            settings,
            lang,
          },
          null,
          2,
        ),
      restore: (json) => {
        try {
          const parsed = JSON.parse(json) as Partial<Persisted>
          if (parsed.products) setProducts(parsed.products)
          if (parsed.orders) setOrders(parsed.orders)
          if (parsed.users) setUsers(parsed.users)
          if (parsed.categories) setCategories(parsed.categories)
          if (parsed.sizes) setSizes(parsed.sizes)
          if (parsed.colors) setColors(parsed.colors)
          if (parsed.media) setMedia(parsed.media)
          if (parsed.settings) setSettings(parsed.settings)
          toast('Backup restored.')
          return true
        } catch {
          toast('Invalid backup file.')
          return false
        }
      },
    }),
    [
      ready,
      lang,
      products,
      cart,
      user,
      users,
      orders,
      categories,
      sizes,
      colors,
      media,
      settings,
      toasts,
      searchOpen,
      cartOpen,
      menuOpen,
      invoiceOrder,
    ],
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
  return cart.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }))
}

export function activeCampaigns(campaigns: Campaign[]) {
  const now = Date.now()
  return campaigns.filter((c) => {
    const start = new Date(c.startAt).getTime()
    return now >= start && now <= start + c.days * 86400000
  })
}

export function orderItemsFromCart(
  cart: CartItem[],
  products: Product[],
): OrderItem[] {
  return cart.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    return {
      productId: item.productId,
      name: product?.name ?? 'Item',
      qty: item.qty,
      price: product?.sellingPrice ?? 0,
      size: item.size,
      color: item.color,
    }
  })
}
