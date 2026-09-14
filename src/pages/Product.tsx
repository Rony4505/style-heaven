import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Info, Search, ShoppingBag, Truck, X } from 'lucide-react'
import { Chrome, StoreHeader } from '../components/Chrome'
import { SIGNATURE_SLUG } from '../data/catalog'
import { useStore } from '../store'
import { formatBdt } from '../types'

export function ProductPage() {
  const { slug } = useParams()
  const { products, addToCart } = useStore()
  const product =
    products.find((p) => p.slug === slug) ||
    products.find((p) => p.slug === SIGNATURE_SLUG) ||
    products[0]
  const [size, setSize] = useState(product?.sizeOptions[0] ?? '')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const related = useMemo(
    () => products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 3),
    [products, product],
  )

  if (!product) return null

  return (
    <div className="product-page">
      <StoreHeader />
      <div className="product-split">
        <section className="product-media">
          <img src={product.image} alt={product.name} />
          <button className="view-larger" onClick={() => setOpen(true)}>
            <Search size={14} /> View larger
          </button>
        </section>
        <section className="product-info">
          <p className="crumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            <span>/</span>
            <span>{product.collection}</span>
          </p>
          <h1>
            {product.featured ? (
              <>
                Style Heaven signature
                <br />
                silk scarf
              </>
            ) : (
              product.name
            )}
          </h1>
          <div className="diamond" />
          <p className="motif">{product.motif || product.material}</p>
          <p className="price">৳ {formatBdt(product.price)}</p>
          <p className="desc">{product.description}</p>

          <div className="size-label">
            <span>Size</span>
            <button
              className="info-dot"
              title="Measured unstretched, including the woven border."
              type="button"
            >
              <Info size={14} />
            </button>
          </div>
          <label className="select-wrap">
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              {product.sizeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <div className="add-row">
            <button
              className="gold-btn add-btn"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product.id, size)}
            >
              Add to bag
            </button>
            <button
              className="gold-btn bag-split"
              aria-label="Open bag"
              onClick={() => navigate('/checkout')}
            >
              <ShoppingBag size={18} />
            </button>
          </div>

          <p className="ship-note">
            <Truck size={16} /> Complimentary shipping on all orders.
          </p>

          <div className="traits">
            <div>
              <LeafIcon />
              <span>Heritage craftsmanship</span>
            </div>
            <div>
              <YarnIcon />
              <span>100% mulberry silk</span>
            </div>
            <div>
              <WeaveIcon />
              <span>Handwoven in Bengal</span>
            </div>
          </div>
        </section>
      </div>
      {open && (
        <div className="lightbox" onClick={() => setOpen(false)}>
          <button className="icon-btn light" onClick={() => setOpen(false)}>
            <X />
          </button>
          <img src={product.image} alt={product.name} />
        </div>
      )}
      {related.length > 0 && (
        <section className="related hide-desktop">
          {/* kept for mobile density; desktop matches the mockup without this block */}
        </section>
      )}
      <Chrome />
    </div>
  )
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#8a7346" strokeWidth="1.2">
      <path d="M5 19c8-1 12-8 13-15-7 1-14 6-13 15Z" />
      <path d="M8 16c2-2 5-5 8-7" />
    </svg>
  )
}

function YarnIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#8a7346" strokeWidth="1.2">
      <circle cx="12" cy="12" r="7" />
      <path d="M7 9c3 1 7 1 10 0M6.5 12.5c3 .8 8 .8 11 0M8 16c2.4.6 5.4.6 8 0" />
    </svg>
  )
}

function WeaveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#8a7346" strokeWidth="1.2">
      <path d="M4 8h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16" />
    </svg>
  )
}
