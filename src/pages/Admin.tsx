import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Image as ImageIcon,
  LayoutGrid,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Trash2,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import { useStore } from '../store'
import {
  formatBdt,
  stockStatus,
  campaignDays,
  toInputDate,
  type Campaign,
  type CampaignType,
  type ColorOption,
  type HeroSlide,
  type Moderator,
  type Order,
  type OrderStatus,
  type Product,
} from '../types'
import { Chrome } from '../components/Chrome'
import { ImageCarousel } from '../components/Carousel'
import { DISTRICTS } from '../data/districts'

const NAV = [
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'orders', label: 'Orders', icon: LayoutGrid },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

type Tab = (typeof NAV)[number]['id']
const STATUSES: OrderStatus[] = ['Confirmed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered']

async function filesToUrls(files: FileList | null) {
  if (!files?.length) return [] as string[]
  return Promise.all(
    [...files].map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.readAsDataURL(file)
        }),
    ),
  )
}

function downloadCsv(name: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function AdminPage() {
  const store = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('products')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Product | null>(null)
  const [orderView, setOrderView] = useState<Order | null>(null)
  const [customerKey, setCustomerKey] = useState<string | null>(null)
  const perPage = 10

  const filtered = useMemo(() => {
    return store.products.filter((p) => {
      const hay = `${p.name} ${p.code} ${p.collection} ${p.category}`.toLowerCase()
      return !q || hay.includes(q.toLowerCase())
    })
  }, [store.products, q])
  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const slice = filtered.slice((page - 1) * perPage, page * perPage)

  if (!store.user || (store.user.role !== 'admin' && store.user.role !== 'moderator')) {
    return <Navigate to="/login" replace />
  }

  const tabs = store.user.role === 'admin' ? NAV : NAV.filter((item) => item.id !== 'settings')

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/" className="admin-brand">
          <span>Style Heaven</span>
          <small>E-commerce back office</small>
        </Link>
        <nav>
          {tabs.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? 'on' : ''}
              onClick={() => {
                setTab(item.id)
                setPage(1)
              }}
            >
              <item.icon size={18} />
              {item.label}
              {item.id === 'orders' ? <em>{store.orders.length}</em> : null}
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <div>
            <h1>{tab[0].toUpperCase() + tab.slice(1)}</h1>
            <p>Style Heaven operations</p>
          </div>
          <div className="admin-tools">
            <div className="admin-search">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
            </div>
            <button className="icon-btn dark">
              <Bell size={18} />
            </button>
            <button className="admin-user" onClick={() => navigate('/account')}>
              <span className="avatar">A</span>
              <span>
                <b>{store.user?.name || 'Admin'}</b>
                <small>{store.user.role === 'moderator' ? 'Moderator' : 'Super Administrator'}</small>
              </span>
            </button>
          </div>
        </header>

        {tab === 'products' && (
          <ProductsTab
            slice={slice}
            filtered={filtered}
            page={page}
            pages={pages}
            perPage={perPage}
            setPage={setPage}
            setEditing={setEditing}
          />
        )}
        {tab === 'orders' && <OrdersTab onView={setOrderView} />}
        {tab === 'customers' && <CustomersTab onOpen={setCustomerKey} />}
        {tab === 'payments' && <PaymentsTab />}
        {tab === 'media' && <MediaTab />}
        {tab === 'settings' && store.user.role === 'admin' && <SettingsTab />}
      </div>

      {editing && <ProductModal product={editing} onClose={() => setEditing(null)} />}
      {orderView && <OrderModal order={orderView} onClose={() => setOrderView(null)} />}
      {customerKey && (
        <CustomerModal customerKey={customerKey} onClose={() => setCustomerKey(null)} />
      )}
      <Chrome />
    </div>
  )
}

function ProductsTab({
  slice,
  filtered,
  page,
  pages,
  perPage,
  setPage,
  setEditing,
}: {
  slice: Product[]
  filtered: Product[]
  page: number
  pages: number
  perPage: number
  setPage: (n: number | ((p: number) => number)) => void
  setEditing: (p: Product) => void
}) {
  const { deleteProduct } = useStore()

  return (
    <section className="admin-panel">
      <div className="panel-head">
        <div>
          <h2>Products</h2>
          <p>
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{' '}
            {filtered.length}
          </p>
        </div>
        <button
          className="gold-btn compact"
          onClick={() =>
            setEditing({
              id: `p-new-${Date.now()}`,
              slug: `new-piece-${Date.now()}`,
              name: '',
              subtitle: '',
              code: 'SH-NEW-01',
              category: 'Scarves',
              collection: 'Signature Collection',
              buyingPrice: 0,
              sellingPrice: 0,
              stock: 0,
              status: 'Out of Stock',
              images: ['/images/silk-gold.jpg'],
              description: '',
              sizes: ['M'],
              colors: [{ name: 'Champagne Gold', hex: '#d4b56a' }],
              material: '100% mulberry silk',
              origin: 'Handwoven in Bengal',
              imageScrollSeconds: 4,
              hasSize: true,
              hasColor: true,
              shopVisible: true,
            })
          }
        >
          <Plus size={16} /> Add product
        </button>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Code</th>
              <th>Category</th>
              <th>Buy</th>
              <th>Sell</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Scroll (s)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((p) => (
              <tr key={p.id}>
                <td>
                  <ImageCarousel className="thumb-carousel" images={p.images} seconds={p.imageScrollSeconds} />
                </td>
                <td>
                  <strong>{p.name}</strong>
                  <small>{p.subtitle}</small>
                </td>
                <td className="mono">{p.code}</td>
                <td>{p.category}</td>
                <td>{formatBdt(p.buyingPrice)}</td>
                <td>{formatBdt(p.sellingPrice)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={`status-pill ${p.status.replace(/\s/g, '').toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>
                <td>{p.imageScrollSeconds}s</td>
                <td className="actions">
                  <Link to={`/product/${p.slug}`} className="icon-btn dark">
                    <Eye size={16} />
                  </Link>
                  <button className="icon-btn dark" onClick={() => setEditing(p)}>
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn dark danger" onClick={() => deleteProduct(p.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <button disabled={page === 1} onClick={() => setPage((n) => Number(n) - 1)}>
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button key={n} className={n === page ? 'on' : ''} onClick={() => setPage(n)}>
            {n}
          </button>
        ))}
        <button disabled={page === pages} onClick={() => setPage((n) => Number(n) + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  )
}

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { upsertProduct, categories, addCategory } = useStore()
  const [form, setForm] = useState(product)
  const [newCat, setNewCat] = useState('')
  const [newSize, setNewSize] = useState('')
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#d4b56a')

  const addSizeToProduct = () => {
    const value = newSize.trim()
    if (!value || form.sizes.includes(value)) return
    setForm({ ...form, sizes: [...form.sizes, value] })
    setNewSize('')
  }

  const addColorToProduct = () => {
    const name = newColorName.trim()
    if (!name) return
    const next: ColorOption = { name, hex: newColorHex }
    setForm({
      ...form,
      colors: [...form.colors.filter((c) => c.name !== name), next],
    })
    setNewColorName('')
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form
        className="modal wide"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          upsertProduct({ ...form, status: stockStatus(form.stock) })
          if (form.category) addCategory(form.category)
          onClose()
        }}
      >
        <h2>{product.name ? 'Edit product' : 'Add product'}</h2>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Code
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </label>
        <label>
          Description
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <div className="form-grid two">
          <label>
            Buying price
            <input
              type="number"
              value={form.buyingPrice}
              onChange={(e) => setForm({ ...form, buyingPrice: Number(e.target.value) })}
            />
          </label>
          <label>
            Sell price
            <input
              type="number"
              value={form.sellingPrice}
              onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
            />
          </label>
        </div>
        <label>
          Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="inline-add">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category" />
          <button
            type="button"
            className="ghost"
            onClick={() => {
              if (!newCat.trim()) return
              addCategory(newCat)
              setForm({ ...form, category: newCat.trim() })
              setNewCat('')
            }}
          >
            Save category
          </button>
        </div>
        <label>
          Stock
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          />
        </label>
        <label>
          Image scroll (seconds)
          <input
            type="number"
            min={2}
            value={form.imageScrollSeconds}
            onChange={(e) => setForm({ ...form, imageScrollSeconds: Number(e.target.value) })}
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.hasSize}
            onChange={(e) => setForm({ ...form, hasSize: e.target.checked })}
          />
          Show size option on this product
        </label>
        {form.hasSize && (
          <div className="option-box">
            <p>Sizes</p>
            <div className="chip-row">
              {form.sizes.map((s) => (
                <button
                  type="button"
                  key={s}
                  className="chip on"
                  onClick={() => setForm({ ...form, sizes: form.sizes.filter((x) => x !== s) })}
                >
                  {s} ×
                </button>
              ))}
            </div>
            <div className="inline-add">
              <input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Add size"
              />
              <button type="button" className="ghost" onClick={addSizeToProduct}>
                Add size
              </button>
            </div>
          </div>
        )}
        <label className="check">
          <input
            type="checkbox"
            checked={form.hasColor}
            onChange={(e) => setForm({ ...form, hasColor: e.target.checked })}
          />
          Show colour option on this product
        </label>
        {form.hasColor && (
          <div className="option-box">
            <p>Colours</p>
            <div className="chip-row">
              {form.colors.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  className="chip on color-chip"
                  onClick={() => setForm({ ...form, colors: form.colors.filter((x) => x.name !== c.name) })}
                >
                  <i style={{ background: c.hex }} />
                  {c.name}
                  <span>{c.hex}</span> ×
                </button>
              ))}
            </div>
            <div className="color-add">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                title="Colour plate"
              />
              <input
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                placeholder="#d4b56a"
              />
              <input
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Colour name"
              />
              <button type="button" className="ghost" onClick={addColorToProduct}>
                Add colour
              </button>
            </div>
          </div>
        )}
        <label>
          Images (as many as you like)
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const urls = await filesToUrls(e.target.files)
              if (urls.length) setForm({ ...form, images: [...form.images, ...urls] })
            }}
          />
        </label>
        <div className="image-edit">
          {form.images.map((src, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="gold-btn compact" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  )
}

function contactLinks(order: Order) {
  const phone = `${order.phoneDial}${order.phone.replace(/\D/g, '').replace(/^0/, '')}`
  return {
    mail: `mailto:${order.email}?subject=Style Heaven order ${order.id}`,
    tel: `tel:+${phone}`,
    wa: `https://wa.me/${phone}?text=${encodeURIComponent(`Style Heaven ${order.trackingNumber}`)}`,
  }
}

function OrdersTab({ onView }: { onView: (o: Order) => void }) {
  const { orders, updateOrder } = useStore()
  const [drafts, setDrafts] = useState<Record<string, OrderStatus>>({})
  return (
    <section className="admin-panel">
      <h2>Orders</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const links = contactLinks(o)
            const draft = drafts[o.id] ?? o.status
            const dirty = draft !== o.status
            return (
              <tr key={o.id}>
                <td className="mono">
                  {o.id}
                  <small>{o.trackingNumber}</small>
                </td>
                <td>{o.guest ? 'Unknown' : o.customerName}</td>
                <td>{o.payment}</td>
                <td>
                  <div className="status-edit">
                    <select
                      value={draft}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [o.id]: e.target.value as OrderStatus }))
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    {dirty && (
                      <button
                        className="gold-btn compact"
                        onClick={() => {
                          updateOrder(o.id, { status: draft })
                          setDrafts((d) => {
                            const next = { ...d }
                            delete next[o.id]
                            return next
                          })
                        }}
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </td>
                <td>BDT {formatBdt(o.total)}</td>
                <td className="actions">
                  <button className="icon-btn dark" title="Details" onClick={() => onView(o)}>
                    <Eye size={16} />
                  </button>
                  <Link className="icon-btn dark" to={`/track/${o.trackingNumber}`} title="Track">
                    <Truck size={16} />
                  </Link>
                  <a className="icon-btn dark" href={links.mail} title="Gmail">
                    <Mail size={16} />
                  </a>
                  <a className="icon-btn dark" href={links.tel} title="Call">
                    <Phone size={16} />
                  </a>
                  <a className="icon-btn dark" href={links.wa} target="_blank" rel="noreferrer" title="WhatsApp">
                    <MessageCircle size={16} />
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const { setInvoiceOrder } = useStore()
  const links = contactLinks(order)
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h2>Order {order.id}</h2>
        <p>Tracking: {order.trackingNumber}</p>
        <p>
          {order.guest ? 'Unknown' : order.customerName} · {order.email} · +{order.phoneDial} {order.phone}
        </p>
        <p>
          {order.address}, {order.city} {order.postal}
        </p>
        <ul>
          {order.items.map((item, i) => (
            <li key={i}>
              {item.name} · {item.size} · {item.color} × {item.qty}
            </li>
          ))}
        </ul>
        <p>Payment: {order.payment} {order.paymentAccount}</p>
        <div className="modal-actions">
          <a className="ghost" href={links.wa} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <button
            className="gold-btn compact"
            onClick={() => {
              setInvoiceOrder(order)
              onClose()
            }}
          >
            Invoice
          </button>
        </div>
      </div>
    </div>
  )
}

function customerKeyOf(order: Order) {
  return order.userEmail || order.email || order.phone || order.id
}

function CustomersTab({ onOpen }: { onOpen: (key: string) => void }) {
  const { orders } = useStore()
  const groups = useMemo(() => {
    const map = new Map<string, Order[]>()
    orders.forEach((o) => {
      const key = customerKeyOf(o)
      map.set(key, [...(map.get(key) ?? []), o])
    })
    return [...map.entries()]
  }, [orders])

  return (
    <section className="admin-panel">
      <h2>Customers</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contact</th>
            <th>Products</th>
            <th>Spend</th>
            <th>Running</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {groups.map(([key, list]) => {
            const guest = list.every((o) => o.guest)
            const spend = list.reduce((s, o) => s + o.total, 0)
            const qty = list.reduce((s, o) => s + o.items.reduce((n, i) => n + i.qty, 0), 0)
            const running = list.filter((o) => o.status !== 'Delivered').length
            return (
              <tr key={key}>
                <td>{guest ? 'Unknown' : list[0].customerName}</td>
                <td>
                  {list[0].email}
                  <small>
                    +{list[0].phoneDial} {list[0].phone}
                  </small>
                </td>
                <td>{qty}</td>
                <td>BDT {formatBdt(spend)}</td>
                <td>{running}</td>
                <td>
                  <button className="text-btn" onClick={() => onOpen(key)}>
                    View
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

function CustomerModal({ customerKey, onClose }: { customerKey: string; onClose: () => void }) {
  const { orders, updateOrder } = useStore()
  const [drafts, setDrafts] = useState<Record<string, OrderStatus>>({})
  const list = orders.filter((o) => customerKeyOf(o) === customerKey)
  const guest = list.every((o) => o.guest)
  const first = list[0]
  const running = list.filter((o) => o.status !== 'Delivered')
  const past = list.filter((o) => o.status === 'Delivered')
  if (!first) return null
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h2>{guest ? 'Unknown' : first.customerName}</h2>
        <p>{first.email}</p>
        <p>
          +{first.phoneDial} {first.phone}
        </p>
        <p>
          {first.address}, {first.city} {first.postal}
        </p>
        <h3>Running</h3>
        {running.length === 0 && <p className="muted">None</p>}
        {running.map((o) => {
          const draft = drafts[o.id] ?? o.status
          const dirty = draft !== o.status
          return (
            <div key={o.id} className="order-row">
              <span>{o.trackingNumber}</span>
              <select
                value={draft}
                onChange={(e) => setDrafts((d) => ({ ...d, [o.id]: e.target.value as OrderStatus }))}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {dirty && (
                <button
                  className="gold-btn compact"
                  onClick={() => {
                    updateOrder(o.id, { status: draft })
                    setDrafts((d) => {
                      const next = { ...d }
                      delete next[o.id]
                      return next
                    })
                  }}
                >
                  Submit
                </button>
              )}
              <Link to={`/track/${o.trackingNumber}`}>Track</Link>
            </div>
          )
        })}
        <h3>Past</h3>
        {past.map((o) => (
          <p key={o.id}>
            {o.id} · BDT {formatBdt(o.total)}
          </p>
        ))}
      </div>
    </div>
  )
}

function PaymentsTab() {
  const { orders } = useStore()
  const exportExcel = () => {
    downloadCsv('style-heaven-payments.csv', [
      ['Order', 'Customer', 'Email', 'Phone', 'Method', 'Account', 'Total', 'Date'],
      ...orders.map((o) => [
        o.id,
        o.guest ? 'Unknown' : o.customerName,
        o.email,
        `+${o.phoneDial}${o.phone}`,
        o.payment,
        o.paymentAccount,
        String(o.total),
        o.createdAt,
      ]),
    ])
  }
  return (
    <section className="admin-panel">
      <div className="panel-head">
        <h2>Payments</h2>
        <button className="ghost" onClick={exportExcel}>
          <Download size={16} /> Excel
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Method</th>
            <th>Account</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                {o.guest ? 'Unknown' : o.customerName}
                <small>{o.email}</small>
              </td>
              <td>{o.payment}</td>
              <td>{o.paymentAccount}</td>
              <td>BDT {formatBdt(o.total)}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function MediaTab() {
  const { media, setMedia, products } = useStore()
  const [title, setTitle] = useState('New offer')
  const [type, setType] = useState<CampaignType>('offer')
  const [productId, setProductId] = useState(products[0]?.id ?? '')
  const [value, setValue] = useState('10')
  const [startAt, setStartAt] = useState(toInputDate(new Date().toISOString()))
  const [endAt, setEndAt] = useState(toInputDate(new Date(Date.now() + 7 * 86400000).toISOString()))
  const [code, setCode] = useState('HEAVEN10')

  const addSlide = async (files: FileList | null, kind: 'hero' | 'ad') => {
    const urls = await filesToUrls(files)
    if (!urls.length) return
    if (kind === 'hero') {
      const extra: HeroSlide[] = urls.map((image, i) => ({
        id: `h-${Date.now()}-${i}`,
        image,
        title: '3D product',
      }))
      setMedia({ ...media, heroSlides: [...media.heroSlides, ...extra] })
    } else {
      setMedia({
        ...media,
        ads: [...media.ads, ...urls.map((image, i) => ({ id: `a-${Date.now()}-${i}`, image, title: 'Ad', link: '/shop' }))],
      })
    }
  }

  return (
    <section className="admin-panel">
      <h2>Media</h2>
      <label>
        Home 3D / product scroll (seconds)
        <input
          type="number"
          min={2}
          value={media.heroSeconds}
          onChange={(e) => setMedia({ ...media, heroSeconds: Number(e.target.value) })}
        />
      </label>
      <label>
        Advertising scroll (seconds)
        <input
          type="number"
          min={2}
          value={media.adSeconds}
          onChange={(e) => setMedia({ ...media, adSeconds: Number(e.target.value) })}
        />
      </label>
      <h3>Home 3D images</h3>
      <input type="file" accept="image/*" multiple onChange={(e) => addSlide(e.target.files, 'hero')} />
      <div className="image-edit">
        {media.heroSlides.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() =>
              setMedia({ ...media, heroSlides: media.heroSlides.filter((x) => x.id !== s.id) })
            }
          >
            <img src={s.image} alt={s.title} />
          </button>
        ))}
      </div>
      <h3>Advertising</h3>
      <input type="file" accept="image/*" multiple onChange={(e) => addSlide(e.target.files, 'ad')} />
      <div className="image-edit">
        {media.ads.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => setMedia({ ...media, ads: media.ads.filter((x) => x.id !== s.id) })}
          >
            <img src={s.image} alt={s.title} />
          </button>
        ))}
      </div>
      <h3>Offer / discount / coupon</h3>
      <div className="form-grid two">
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as CampaignType)}>
            <option value="offer">Offer</option>
            <option value="discount">Discount</option>
            <option value="advertising">Advertising</option>
            <option value="coupon">Coupon</option>
          </select>
        </label>
        <label>
          Product
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Value / %
          <input value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label>
          Start date
          <input type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </label>
        <label>
          End date
          <input type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </label>
        <p className="day-count">
          Duration: {campaignDays(startAt, endAt)} day{campaignDays(startAt, endAt) === 1 ? '' : 's'}
        </p>
        {type === 'coupon' && (
          <label>
            Coupon code
            <input value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
        )}
      </div>
      <button
        className="gold-btn compact"
        onClick={() => {
          const next: Campaign = {
            id: `c-${Date.now()}`,
            type,
            title,
            productId,
            value,
            startAt: new Date(startAt).toISOString(),
            endAt: new Date(endAt).toISOString(),
            code: type === 'coupon' ? code : undefined,
          }
          setMedia({ ...media, campaigns: [next, ...media.campaigns] })
        }}
      >
        Save campaign
      </button>
      <ul>
        {media.campaigns.map((c) => (
          <li key={c.id}>
            {c.type} · {c.title} · {toInputDate(c.startAt)} → {toInputDate(c.endAt)} ·{' '}
            {campaignDays(c.startAt, c.endAt)} days
            <button
              className="text-btn"
              onClick={() =>
                setMedia({ ...media, campaigns: media.campaigns.filter((x) => x.id !== c.id) })
              }
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SettingsTab() {
  const { settings, setSettings, backup, restore } = useStore()
  const [mod, setMod] = useState({ name: '', email: '', phone: '', password: '' })

  const addModerator = () => {
    if (!mod.name || !mod.email || !mod.password) return
    const next: Moderator = { id: `mod-${Date.now()}`, ...mod }
    setSettings({ ...settings, moderators: [...settings.moderators, next] })
    setMod({ name: '', email: '', phone: '', password: '' })
  }

  return (
    <section className="admin-panel">
      <h2>Settings</h2>
      <h3>Security</h3>
      <label>
        Admin Gmail
        <input
          value={settings.adminEmail}
          onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
        />
      </label>
      <label>
        Admin password
        <input
          type="password"
          value={settings.adminPassword}
          onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
        />
      </label>
      <label>
        Admin phone
        <input
          value={settings.adminPhone}
          onChange={(e) => setSettings({ ...settings, adminPhone: e.target.value })}
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={settings.twoFactor}
          onChange={(e) => setSettings({ ...settings, twoFactor: e.target.checked })}
        />
        Two-factor authentication
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={settings.loginAlerts}
          onChange={(e) => setSettings({ ...settings, loginAlerts: e.target.checked })}
        />
        Login alerts
      </label>

      <h3>Store payment accounts</h3>
      <label>
        Card name
        <input
          value={settings.payCardName}
          onChange={(e) => setSettings({ ...settings, payCardName: e.target.value })}
        />
      </label>
      <label>
        Card number
        <input
          value={settings.payCardNumber}
          onChange={(e) => setSettings({ ...settings, payCardNumber: e.target.value })}
        />
      </label>
      <label>
        bKash number
        <input
          value={settings.payBkash}
          onChange={(e) => setSettings({ ...settings, payBkash: e.target.value })}
        />
      </label>
      <label>
        Nagad number
        <input
          value={settings.payNagad}
          onChange={(e) => setSettings({ ...settings, payNagad: e.target.value })}
        />
      </label>

      <h3>District delivery charges</h3>
      <label>
        Default shipping
        <input
          type="number"
          value={settings.defaultShipping}
          onChange={(e) => setSettings({ ...settings, defaultShipping: Number(e.target.value) })}
        />
      </label>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>District</th>
              <th>Charge (BDT)</th>
            </tr>
          </thead>
          <tbody>
            {DISTRICTS.map((d) => (
              <tr key={d}>
                <td>{d}</td>
                <td>
                  <input
                    type="number"
                    value={settings.deliveryCharges[d] ?? settings.defaultShipping}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        deliveryCharges: { ...settings.deliveryCharges, [d]: Number(e.target.value) },
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Moderators</h3>
      <p className="muted">Staff who can run products, orders, customers, payments, and media.</p>
      <div className="form-grid two">
        <label>
          Name
          <input value={mod.name} onChange={(e) => setMod({ ...mod, name: e.target.value })} />
        </label>
        <label>
          Email
          <input value={mod.email} onChange={(e) => setMod({ ...mod, email: e.target.value })} />
        </label>
        <label>
          Phone
          <input value={mod.phone} onChange={(e) => setMod({ ...mod, phone: e.target.value })} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={mod.password}
            onChange={(e) => setMod({ ...mod, password: e.target.value })}
          />
        </label>
      </div>
      <button type="button" className="gold-btn compact" onClick={addModerator}>
        Add moderator
      </button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {settings.moderators.length === 0 && (
            <tr>
              <td colSpan={4}>No moderators yet.</td>
            </tr>
          )}
          {settings.moderators.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.phone}</td>
              <td>
                <button
                  className="text-btn"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      moderators: settings.moderators.filter((x) => x.id !== m.id),
                    })
                  }
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Data backup</h3>
      <button
        className="ghost"
        onClick={() => {
          const blob = new Blob([backup()], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'style-heaven-backup.json'
          a.click()
          URL.revokeObjectURL(url)
        }}
      >
        Download backup
      </button>
      <label>
        Restore backup
        <input
          type="file"
          accept="application/json"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            restore(await file.text())
          }}
        />
      </label>
    </section>
  )
}
