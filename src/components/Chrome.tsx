import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react'
import { useCartCount, useCartLines, useStore } from '../store'
import { formatBdt } from '../types'

export function StoreHeader() {
  const { setMenuOpen, setSearchOpen, setCartOpen } = useStore()
  const count = useCartCount()

  return (
    <header className="store-header">
      <button className="icon-btn" aria-label="Menu" onClick={() => setMenuOpen(true)}>
        <Menu size={22} strokeWidth={1.4} />
      </button>
      <Link to="/" className="wordmark">
        Style Heaven
      </Link>
      <div className="header-actions">
        <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
          <Search size={20} strokeWidth={1.4} />
        </button>
        <Link to="/account" className="icon-btn" aria-label="Account">
          <UserRound size={20} strokeWidth={1.4} />
        </Link>
        <button className="icon-btn bag-btn" aria-label="Bag" onClick={() => setCartOpen(true)}>
          <ShoppingBag size={20} strokeWidth={1.4} />
          <span className="bag-badge">{count}</span>
        </button>
      </div>
    </header>
  )
}

export function MenuDrawer() {
  const { menuOpen, setMenuOpen, user } = useStore()
  if (!menuOpen) return null
  return (
    <div className="overlay" onClick={() => setMenuOpen(false)}>
      <aside className="drawer drawer-left" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <span className="wordmark sm">Style Heaven</span>
          <button className="icon-btn dark" onClick={() => setMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="drawer-nav">
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/collections" onClick={() => setMenuOpen(false)}>Collections</Link>
          <Link to="/shop?category=Scarves" onClick={() => setMenuOpen(false)}>Scarves</Link>
          <Link to="/shop?category=Sarees" onClick={() => setMenuOpen(false)}>Sarees</Link>
          <Link to="/account" onClick={() => setMenuOpen(false)}>Account</Link>
          <Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
          {(user?.role === 'admin' || true) && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}>Back office</Link>
          )}
        </nav>
      </aside>
    </div>
  )
}

export function SearchModal() {
  const { searchOpen, setSearchOpen, products } = useStore()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  if (!searchOpen) return null
  const list = products
    .filter((p) =>
      q.trim()
        ? `${p.name} ${p.sku} ${p.collection} ${p.category}`.toLowerCase().includes(q.toLowerCase())
        : p.shopVisible,
    )
    .slice(0, 8)
  return (
    <div className="overlay" onClick={() => setSearchOpen(false)}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-field">
          <Search size={18} />
          <input
            autoFocus
            placeholder="Search products, SKU, collections…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchOpen(false)
            }}
          />
        </div>
        <div className="search-results">
          {list.map((p) => (
            <button
              key={p.id}
              className="search-row"
              onClick={() => {
                setSearchOpen(false)
                navigate(`/product/${p.slug}`)
              }}
            >
              <img src={p.image} alt="" />
              <span>
                <strong>{p.name}</strong>
                <em>{p.sku}</em>
              </span>
              <b>৳ {formatBdt(p.price)}</b>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, updateQty, removeFromCart } = useStore()
  const lines = useCartLines()
  const navigate = useNavigate()
  const subtotal = lines.reduce((sum, l) => sum + (l.product?.price ?? 0) * l.qty, 0)
  if (!cartOpen) return null
  return (
    <div className="overlay" onClick={() => setCartOpen(false)}>
      <aside className="drawer drawer-right" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>Your bag</h3>
          <button className="icon-btn dark" onClick={() => setCartOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="cart-lines">
          {lines.length === 0 && <p className="muted">Your bag is empty.</p>}
          {lines.map((line) => (
            <div className="cart-line" key={`${line.productId}-${line.size}`}>
              <img src={line.product?.image} alt="" />
              <div>
                <strong>{line.product?.name}</strong>
                <p>{line.size}</p>
                <p>৳ {formatBdt(line.product?.price ?? 0)}</p>
                <div className="qty">
                  <button onClick={() => updateQty(line.productId, line.size, line.qty - 1)}>-</button>
                  <span>{line.qty}</span>
                  <button onClick={() => updateQty(line.productId, line.size, line.qty + 1)}>+</button>
                  <button className="text-btn" onClick={() => removeFromCart(line.productId, line.size)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-foot">
          <div className="row-between">
            <span>Subtotal</span>
            <strong>৳ {formatBdt(subtotal)}</strong>
          </div>
          <button
            className="gold-btn full"
            disabled={!lines.length}
            onClick={() => {
              setCartOpen(false)
              navigate('/checkout')
            }}
          >
            Checkout
          </button>
        </div>
      </aside>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  )
}

export function Chrome() {
  return (
    <>
      <MenuDrawer />
      <SearchModal />
      <CartDrawer />
      <Toasts />
    </>
  )
}

export function AdminBell() {
  return (
    <button className="icon-btn dark" aria-label="Notifications">
      <Bell size={18} />
    </button>
  )
}
