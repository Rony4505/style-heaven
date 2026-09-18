import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CATALOG_VERSION, createCatalog } from './data/catalog'
import { defaultDeliveryCharges } from './data/districts'
import {
  DEFAULT_CATEGORIES,
  DEFAULT_COLORS,
  DEFAULT_SIZES,
  asColor,
  colorName,
  stockStatus,
  type AuthProvider,
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
  register: (input: {
    name: string
    email: string
    password?: string
    phone?: string
    provider?: AuthProvider
  }) => boolean
  socialLogin: (provider: AuthProvider, input: { name: string; email: string; phone?: string }) => boolean
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

const KEY = 'style-heaven-store-v4'
const PREV_KEY = 'style-heaven-store-v3'
const StoreContext = createContext<Store | null>(null)

function trackingCode() {
  return `SH-TRK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function seedMedia(): MediaSettings {
  return {
    heroSeconds: 5,
    adSeconds: 6,
    heroSlides: [
      { id: 'h1', image: '/products/tee-black.webp', title: 'Essential Black Tee' },
      { id: 'h2', image: '/products/shirt-oxford-blue.webp', title: 'Oxford Shirt' },
      { id: 'h3', image: '/products/jeans-indigo.webp', title: 'Slim Indigo Jeans' },
      { id: 'h4', image: '/products/hoodie-charcoal.webp', title: 'Charcoal Hoodie' },
    ],
    ads: [
      {
        id: 'a1',
        image: '/products/tee-cream.webp',
        title: 'New season — complimentary shipping',
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
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 30 * 86400000).toISOString(),
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
    payCardName: 'Style Heaven Ltd',
    payCardNumber: '4532 8890 1144 6721',
    payBkash: '01712345678',
    payNagad: '01812345678',
    defaultShipping: 160,
    deliveryCharges: defaultDeliveryCharges(),
    moderators: [],
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
          size: product?.hasSize ? product.sizes[0] ?? '' : '',
          color: product?.hasColor ? colorName(product.colors[0]) : '',
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
  catalogVersion?: number
}

function migrateProduct(p: Product): Product {
  return {
    ...p,
    hasSize: p.hasSize ?? true,
    hasColor: p.hasColor ?? true,
    colors: (p.colors ?? []).map(asColor),
    description: p.description ?? '',
  }
}

function migrateCampaign(c: Campaign & { days?: number }): Campaign {
  const startAt = c.startAt || new Date().toISOString()
  const endAt =
    c.endAt ||
    new Date(new Date(startAt).getTime() + Math.max(1, c.days || 7) * 86400000).toISOString()
  return {
    id: c.id,
    type: c.type,
    title: c.title,
    productId: c.productId,
    value: c.value,
    startAt,
    endAt,
    code: c.code,
  }
}

function migrateSettings(s?: Partial<SiteSettings> | null): SiteSettings {
  const base = seedSettings()
  return {
    ...base,
    ...s,
    deliveryCharges: { ...base.deliveryCharges, ...(s?.deliveryCharges ?? {}) },
    moderators: s?.moderators ?? [],
    payCardName: s?.payCardName || base.payCardName,
    payCardNumber: s?.payCardNumber || base.payCardNumber,
    payBkash: s?.payBkash || base.payBkash,
    payNagad: s?.payNagad || base.payNagad,
  }
}

function load(): Persisted {
  const catalog = createCatalog()
  const fallback: Persisted = {
    products: catalog,
    cart: [],
    user: null,
    users: [
      {
        name: 'Admin',
        email: 'admin@styleheaven.com',
        phone: '+8801712345678',
        role: 'admin',
        provider: 'email',
      },
      {
        name: 'Ayesha Rahman',
        email: 'ayesha@mail.com',
        phone: '1712345678',
        password: 'user123',
        role: 'customer',
        provider: 'email',
      },
      {
        name: 'Farhan Ahmed',
        email: 'farhan@mail.com',
        phone: '1911002200',
        password: 'user123',
        role: 'customer',
        provider: 'email',
      },
    ],
    orders: seedOrders(catalog),
    categories: [...DEFAULT_CATEGORIES],
    sizes: [...DEFAULT_SIZES],
    colors: [...DEFAULT_COLORS],
    media: seedMedia(),
    settings: seedSettings(),
    lang: 'en',
    catalogVersion: CATALOG_VERSION,
  }
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(PREV_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<Persisted>
    // A stale seed catalog (older demo products) is swapped for the current one while
    // keeping the shopper's own data (cart, account, orders, settings).
    const staleCatalog = (parsed.catalogVersion ?? 1) < CATALOG_VERSION
    const products = (!staleCatalog && parsed.products?.length ? parsed.products : catalog).map(
      migrateProduct,
    )
    const media = parsed.media ?? fallback.media
    const isOldDemoImage = (src: string) => src.startsWith('/images/')
    const heroSlides =
      staleCatalog && media.heroSlides?.every((s) => isOldDemoImage(s.image))
        ? fallback.media.heroSlides
        : media.heroSlides
    const ads =
      staleCatalog && media.ads?.every((a) => isOldDemoImage(a.image)) ? fallback.media.ads : media.ads
    return {
      ...fallback,
      ...parsed,
      products,
      cart: staleCatalog ? [] : parsed.cart ?? [],
      categories: staleCatalog ? fallback.categories : parsed.categories ?? fallback.categories,
      sizes: staleCatalog ? fallback.sizes : parsed.sizes ?? fallback.sizes,
      colors: staleCatalog ? fallback.colors : parsed.colors ?? fallback.colors,
      media: {
        ...fallback.media,
        ...media,
        heroSlides,
        ads,
        campaigns: (media.campaigns ?? []).map(migrateCampaign),
      },
      settings: migrateSettings(parsed.settings),
      catalogVersion: CATALOG_VERSION,
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
      catalogVersion: CATALOG_VERSION,
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
            provider: 'email',
          })
          return true
        }
        const mod = settings.moderators.find((m) => m.email.toLowerCase() === em)
        if (mod) {
          if (mod.password !== password) {
            toast('Wrong moderator password.')
            return false
          }
          setUser({
            email: mod.email,
            name: mod.name,
            phone: mod.phone,
            role: 'moderator',
            provider: 'email',
          })
          return true
        }
        const existing = users.find((u) => u.email.toLowerCase() === em)
        if (existing?.provider && existing.provider !== 'email') {
          toast(`Please continue with ${existing.provider}.`)
          return false
        }
        if (existing?.password && existing.password !== password) {
          toast('Wrong password.')
          return false
        }
        const next: User = existing ?? {
          email: em,
          name: name || em.split('@')[0],
          phone,
          password,
          role: 'customer',
          provider: 'email',
        }
        setUser(next)
        if (!existing) setUsers((list) => [...list, next])
        return true
      },
      register: ({ name, email, password, phone, provider = 'email' }) => {
        const em = email.trim().toLowerCase()
        if (
          users.some((u) => u.email.toLowerCase() === em) ||
          em === settings.adminEmail.toLowerCase() ||
          settings.moderators.some((m) => m.email.toLowerCase() === em)
        ) {
          toast('An account with this email already exists.')
          return false
        }
        const next: User = {
          name,
          email: em,
          phone,
          password,
          role: 'customer',
          provider,
        }
        setUsers((list) => [...list, next])
        setUser(next)
        return true
      },
      socialLogin: (provider, input) => {
        const em = input.email.trim().toLowerCase()
        if (!em) {
          toast('Email is required.')
          return false
        }
        if (em === settings.adminEmail.toLowerCase()) {
          toast('Use the admin password to sign in.')
          return false
        }
        const existing = users.find((u) => u.email.toLowerCase() === em)
        if (existing) {
          setUser(existing)
          return true
        }
        const next: User = {
          name: input.name || em.split('@')[0],
          email: em,
          phone: input.phone,
          role: 'customer',
          provider,
        }
        setUsers((list) => [...list, next])
        setUser(next)
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
          if (parsed.products) setProducts(parsed.products.map(migrateProduct))
          if (parsed.orders) setOrders(parsed.orders)
          if (parsed.users) setUsers(parsed.users)
          if (parsed.categories) setCategories(parsed.categories)
          if (parsed.sizes) setSizes(parsed.sizes)
          if (parsed.colors) setColors(parsed.colors)
          if (parsed.media) {
            setMedia({
              ...parsed.media,
              campaigns: (parsed.media.campaigns ?? []).map(migrateCampaign),
            })
          }
          if (parsed.settings) setSettings(migrateSettings(parsed.settings))
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
    const end = new Date(c.endAt).getTime()
    return now >= start && now <= end
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
