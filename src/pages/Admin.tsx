import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Image as ImageIcon,
  LayoutGrid,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react'
import { useStore } from '../store'
import { formatBdt, stockStatus, type Product } from '../types'
import { Chrome } from '../components/Chrome'

const NAV = [
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'orders', label: 'Orders', icon: LayoutGrid, badge: 24 },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

type Tab = (typeof NAV)[number]['id']

export function AdminPage() {
  const { user, products, orders, upsertProduct, deleteProduct } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('products')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Product | null>(null)
  const [filter, setFilter] = useState<'all' | Product['status']>('all')
  const perPage = 10

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const hay = `${p.name} ${p.sku} ${p.collection} ${p.category}`.toLowerCase()
      if (q && !hay.includes(q.toLowerCase())) return false
      if (filter !== 'all' && p.status !== filter) return false
      return true
    })
  }, [products, q, filter])

  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const slice = filtered.slice((page - 1) * perPage, page * perPage)

  const exportCsv = () => {
    const header = 'Name,SKU,Category,Stock,Price,Status\n'
    const body = filtered
      .map((p) => `${p.name},${p.sku},${p.category},${p.stock},${p.price},${p.status}`)
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'style-heaven-products.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/" className="admin-brand">
          <span>Style Heaven</span>
          <small>E-commerce back office</small>
        </Link>
        <nav>
          {NAV.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? 'on' : ''}
              onClick={() => setTab(item.id)}
            >
              <item.icon size={18} />
              {item.label}
              {'badge' in item && item.badge ? <em>{item.badge}</em> : null}
            </button>
          ))}
        </nav>
        <div className="admin-foot">
          <div className="mark">S</div>
          <div>
            <strong>Style Heaven</strong>
            <p>Luxury redefined</p>
          </div>
          <small>© 2026 Style Heaven<br />All rights reserved</small>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <div>
            <label className="hamburger">
              <span />
              <span />
              <span />
            </label>
            <div>
              <h1>
                {tab === 'products' ? 'Product management' : tab[0].toUpperCase() + tab.slice(1)}
              </h1>
              <p>
                {tab === 'products'
                  ? 'Manage your silk collection and inventory'
                  : 'Style Heaven operations'}
              </p>
            </div>
          </div>
          <div className="admin-tools">
            <div className="admin-search">
              <Search size={16} />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setPage(1)
                }}
                placeholder="Search products, SKU, collections…"
              />
              <kbd>⌘ K</kbd>
            </div>
            <button className="icon-btn dark">
              <Bell size={18} />
            </button>
            <button className="admin-user" onClick={() => navigate('/account')}>
              <span className="avatar">A</span>
              <span>
                <b>{user?.name || 'Admin'}</b>
                <small>Super Administrator</small>
              </span>
            </button>
          </div>
        </header>

        {tab === 'products' && (
          <section className="admin-panel">
            <div className="panel-head">
              <div>
                <h2>Products</h2>
                <p>
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{' '}
                  {filtered.length} products
                </p>
              </div>
              <div className="panel-actions">
                <div className="filter-wrap">
                  <Filter size={16} />
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value as typeof filter)
                      setPage(1)
                    }}
                  >
                    <option value="all">Filter</option>
                    <option>Active</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
                <button className="ghost" onClick={exportCsv}>
                  <Download size={16} /> Export
                </button>
                <button
                  className="gold-btn compact"
                  onClick={() =>
                    setEditing({
                      id: `p-new-${Date.now()}`,
                      slug: `new-piece-${Date.now()}`,
                      name: '',
                      subtitle: 'Atelier',
                      sku: 'SH-NEW-00',
                      category: 'Scarves',
                      collection: 'Signature Collection',
                      price: 0,
                      stock: 0,
                      status: 'Out of Stock',
                      image: '/images/silk-gold.jpg',
                      description: '',
                      sizeOptions: ['Regular – 90cm x 200cm'],
                      material: '100% mulberry silk',
                      origin: 'Handwoven in Bengal',
                      shade: 'Champagne Gold',
                      shopVisible: true,
                    })
                  }
                >
                  <Plus size={16} /> Add product
                </button>
                <button className="icon-btn dark">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th />
                    <th>Thumbnail</th>
                    <th>Product name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Price (BDT)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>
                        <img className="thumb" src={p.image} alt="" />
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                        <small>{p.subtitle}</small>
                      </td>
                      <td className="mono">{p.sku}</td>
                      <td>{p.category}</td>
                      <td className={`stock ${p.status.replace(/\s/g, '').toLowerCase()}`}>
                        {p.stock}
                      </td>
                      <td>{formatBdt(p.price)}</td>
                      <td>
                        <span className={`pill ${p.status.replace(/\s/g, '').toLowerCase()}`}>
                          {p.status === 'Active' && '● '}
                          {p.status === 'Low Stock' && '● '}
                          {p.status === 'Out of Stock' && '● '}
                          {p.status}
                        </span>
                      </td>
                      <td className="actions">
                        <Link to={`/product/${p.slug}`} className="icon-btn dark" title="View">
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

            <div className="table-foot">
              <p>
                Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of{' '}
                {filtered.length} products.
              </p>
              <div className="pager">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={n === page ? 'on' : ''} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ))}
                <button disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <p className="admin-note">
              Prices are shown in BDT (Bangladeshi Taka). Stock levels are updated in real time.
              <span>Last updated: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </section>
        )}

        {tab === 'orders' && (
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
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.payment}</td>
                    <td>
                      <span className="pill active">{o.status}</span>
                    </td>
                    <td>BDT {formatBdt(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {tab !== 'products' && tab !== 'orders' && (
          <section className="admin-panel empty-panel">
            <SlidersHorizontal size={28} />
            <h2>{tab[0].toUpperCase() + tab.slice(1)}</h2>
            <p>This ledger will fill as the house grows.</p>
          </section>
        )}
      </div>

      {editing && (
        <ProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            upsertProduct({ ...p, status: stockStatus(p.stock) })
            setEditing(null)
          }}
        />
      )}
      <Chrome />
    </div>
  )
}

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product
  onClose: () => void
  onSave: (p: Product) => void
}) {
  const [form, setForm] = useState(product)
  return (
    <div className="overlay" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          onSave(form)
        }}
      >
        <h2>{product.name ? 'Edit product' : 'Add product'}</h2>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          SKU
          <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </label>
        <div className="form-grid two">
          <label>
            Price
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </label>
        </div>
        <label>
          Category
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </label>
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
