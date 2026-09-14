import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Chrome, StoreHeader } from '../components/Chrome'
import { ImageCarousel } from '../components/Carousel'
import { activeCampaigns, useStore } from '../store'
import { formatBdt, colorName, type Product } from '../types'
import { tx } from '../i18n'

function ShopCard({ product }: { product: Product }) {
  const { addToCart, lang, media } = useStore()
  const t = tx(lang)
  const [size, setSize] = useState(product.hasSize ? product.sizes[0] ?? '' : '')
  const [color, setColor] = useState(product.hasColor ? colorName(product.colors[0]) : '')
  const deal = activeCampaigns(media.campaigns).find(
    (c) => c.productId === product.id && (c.type === 'discount' || c.type === 'offer'),
  )

  return (
    <article className="product-card shop-card">
      <Link to={`/product/${product.slug}`} className="card-img">
        <ImageCarousel images={product.images} seconds={product.imageScrollSeconds} alt={product.name} />
        {deal && <span className="deal-pill">{deal.title}</span>}
      </Link>
      <h3>
        <Link to={`/product/${product.slug}`}>{product.name}</Link>
      </h3>
      <p>{product.subtitle}</p>
      <strong>৳ {formatBdt(product.sellingPrice)}</strong>
      {product.hasSize && product.sizes.length > 0 && (
        <label>
          {t.size}
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {product.sizes.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      )}
      {product.hasColor && product.colors.length > 0 && (
        <div className="color-field">
          <span>{t.colour}</span>
          <div className="color-picks">
            {product.colors.map((option) => (
              <button
                type="button"
                key={option.name}
                className={color === option.name ? 'on' : ''}
                style={{ background: option.hex }}
                title={`${option.name} ${option.hex}`}
                onClick={() => setColor(option.name)}
              />
            ))}
          </div>
          <small>
            {color} {product.colors.find((c) => c.name === color)?.hex}
          </small>
        </div>
      )}
      <button
        className="gold-btn compact full"
        disabled={product.stock <= 0}
        onClick={() => addToCart(product.id, size, color)}
      >
        {t.addToBag}
      </button>
    </article>
  )
}

export function ShopPage() {
  const { products, lang } = useStore()
  const [params] = useSearchParams()
  const t = tx(lang)
  const category = params.get('category')
  const collection = params.get('collection')
  const list = useMemo(
    () =>
      products.filter((p) => {
        if (!p.shopVisible) return false
        if (category && p.category !== category) return false
        if (collection && p.collection !== collection) return false
        return true
      }),
    [products, category, collection],
  )

  return (
    <div className="shop-page">
      <StoreHeader />
      <main className="shop-wrap">
        <p className="crumbs">
          <Link to="/">{t.home}</Link> <span>/</span> {category || collection || t.shop}
        </p>
        <h1>{category || collection || t.collections}</h1>
        <div className="product-grid">
          {list.map((p) => (
            <ShopCard key={p.id} product={p} />
          ))}
        </div>
      </main>
      <Chrome />
    </div>
  )
}

export function CollectionsPage() {
  const { lang } = useStore()
  const t = tx(lang)
  const collections = [
    {
      title: 'Signature Scarves',
      copy: 'Jamdani motifs on mulberry silk.',
      to: '/shop?category=Scarves',
      image: '/images/scarf-jamdani.jpg',
    },
    {
      title: 'Sarees',
      copy: 'Heritage, woven in light.',
      to: '/shop?category=Sarees',
      image: '/images/hero-model.jpg',
    },
    {
      title: 'Ready to Wear',
      copy: 'Blouses, kaftans, evening silk.',
      to: '/shop?category=Dresses',
      image: '/images/silk-charcoal.jpg',
    },
    {
      title: 'Maison',
      copy: 'Silk for the private rooms of the house.',
      to: '/shop?category=Accessories',
      image: '/images/silk-ivory.jpg',
    },
  ]

  return (
    <div className="shop-page collections-page">
      <StoreHeader />
      <main className="shop-wrap">
        <p className="crumbs">
          <Link to="/">{t.home}</Link> <span>/</span> {t.collections}
        </p>
        <h1>{t.collections}</h1>
        <div className="collection-grid">
          {collections.map((c) => (
            <Link to={c.to} className="collection-card" key={c.title}>
              <img src={c.image} alt="" />
              <div>
                <h2>{c.title}</h2>
                <p>{c.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Chrome />
    </div>
  )
}
