import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Info, Search, ShoppingBag, Truck, X } from 'lucide-react'
import { Chrome, StoreHeader } from '../components/Chrome'
import { ImageCarousel } from '../components/Carousel'
import { SIGNATURE_SLUG } from '../data/catalog'
import { useStore } from '../store'
import { formatBdt, colorName } from '../types'
import { tx } from '../i18n'

export function ProductPage() {
  const { slug } = useParams()
  const { products, addToCart, lang } = useStore()
  const t = tx(lang)
  const product =
    products.find((p) => p.slug === slug) ||
    products.find((p) => p.slug === SIGNATURE_SLUG) ||
    products[0]
  const [size, setSize] = useState(product?.hasSize ? product.sizes[0] ?? '' : '')
  const [color, setColor] = useState(product?.hasColor ? colorName(product.colors[0]) : '')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setSize(product?.hasSize ? product.sizes[0] ?? '' : '')
    setColor(product?.hasColor ? colorName(product.colors[0]) : '')
  }, [product?.id])

  if (!product) return null

  return (
    <div className="product-page">
      <StoreHeader />
      <div className="product-split">
        <section className="product-media">
          <ImageCarousel
            className="pdp-carousel"
            images={product.images}
            seconds={product.imageScrollSeconds}
            alt={product.name}
          />
          <button className="view-larger" onClick={() => setOpen(true)}>
            <Search size={14} /> View larger
          </button>
        </section>
        <section className="product-info">
          <p className="crumbs">
            <Link to="/">{t.home}</Link>
            <span>/</span>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            <span>/</span>
            <span>{product.collection}</span>
          </p>
          <h1>
            {product.featured ? (
              <>
                Signature
                <br />
                silk scarf
              </>
            ) : (
              product.name
            )}
          </h1>
          <div className="diamond" />
          <p className="motif">{product.motif || product.material}</p>
          <p className="price">৳ {formatBdt(product.sellingPrice)}</p>
          <p className="desc">{product.description}</p>

          {product.hasSize && product.sizes.length > 0 && (
            <>
              <div className="size-label">
                <span>{t.size}</span>
                <button className="info-dot" title="Measured unstretched." type="button">
                  <Info size={14} />
                </button>
              </div>
              <label className="select-wrap">
                <select value={size} onChange={(e) => setSize(e.target.value)}>
                  {product.sizes.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          {product.hasColor && product.colors.length > 0 && (
            <>
              <div className="size-label">
                <span>{t.colour}</span>
              </div>
              <div className="color-picks">
                {product.colors.map((option) => (
                  <button
                    type="button"
                    key={option.name}
                    className={color === option.name ? 'on' : ''}
                    style={{ background: option.hex }}
                    title={`${option.name} ${option.hex}`}
                    onClick={() => setColor(option.name)}
                  >
                    <span className="sr-only">{option.name}</span>
                  </button>
                ))}
              </div>
              <p className="color-code">
                {color} · {product.colors.find((c) => c.name === color)?.hex}
              </p>
            </>
          )}

          <div className="add-row">
            <button
              className="gold-btn add-btn"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product.id, size, color)}
            >
              {t.addToBag}
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
        </section>
      </div>
      {open && (
        <div className="lightbox" onClick={() => setOpen(false)}>
          <button className="icon-btn light" onClick={() => setOpen(false)}>
            <X />
          </button>
          <ImageCarousel images={product.images} seconds={product.imageScrollSeconds} alt={product.name} />
        </div>
      )}
      <Chrome />
    </div>
  )
}
