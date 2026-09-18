import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import { useStore } from '../store'
import { tx } from '../i18n'
import { asColor, colorName, formatBdt, type Product } from '../types'

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const n = parseInt(full.padEnd(6, '0').slice(0, 6), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function mix(hex: string, target: number, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  const f = (c: number) => Math.round(c + (target - c) * amount)
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000
}

function isLight(hex: string) {
  return luminance(hex) > 150
}

const ALL = '__all__'

export function Showcase({ seconds = 6 }: { seconds?: number }) {
  const { products, orders, categories, addToCart, lang } = useStore()
  const t = tx(lang)
  const visible = useMemo(
    () => products.filter((p) => p.shopVisible !== false && p.stock > 0 && p.images[0]),
    [products],
  )
  // Units sold per product, so each category can lead with its best seller.
  const sold = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of orders) {
      for (const it of o.items) map.set(it.productId, (map.get(it.productId) ?? 0) + it.qty)
    }
    return map
  }, [orders])
  const tabs = useMemo(() => {
    const present = new Set(visible.map((p) => p.category))
    const ordered = categories.filter((c) => present.has(c))
    for (const c of present) if (!ordered.includes(c)) ordered.push(c)
    return ordered
  }, [visible, categories])
  const [category, setCategory] = useState(ALL)
  const list = useMemo(() => {
    const pool = category === ALL ? visible : visible.filter((p) => p.category === category)
    const score = (p: Product) => (sold.get(p.id) ?? 0) * 10 + (p.featured ? 1 : 0)
    return [...pool].sort((a, b) => score(b) - score(a))
  }, [visible, category, sold])
  const [index, setIndex] = useState(0)
  const [colorIdx, setColorIdx] = useState(0)
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const [paused, setPaused] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const stage = useRef<HTMLDivElement>(null)

  const product: Product | undefined = list[index % Math.max(1, list.length)]
  const colors = product?.colors.length ? product.colors.map(asColor) : [asColor('Champagne Gold')]
  const active = colors[colorIdx % colors.length]
  const hex = active.hex || '#c4a35a'

  useEffect(() => {
    setColorIdx(0)
  }, [product?.id])

  const pickCategory = (next: string) => {
    if (next === category) return
    setCategory(next)
    setDir('next')
    setIndex(0)
  }

  useEffect(() => {
    if (list.length < 2 || paused) return
    const id = window.setInterval(() => {
      setDir('next')
      setIndex((i) => (i + 1) % list.length)
    }, Math.max(3, seconds) * 1000)
    return () => window.clearInterval(id)
  }, [list.length, seconds, paused])

  if (!product) {
    if (category !== ALL && visible.length) {
      setCategory(ALL)
      setIndex(0)
    }
    return null
  }

  const go = (step: number) => {
    setDir(step > 0 ? 'next' : 'prev')
    setIndex((i) => (i + step + list.length) % list.length)
  }

  const light = isLight(hex)
  const veryDark = luminance(hex) < 40
  const style = {
    '--sc-deep': mix(hex, 0, light ? 0.86 : 0.82),
    '--sc-mid': veryDark ? mix(hex, 255, 0.16) : mix(hex, 0, light ? 0.68 : 0.55),
    '--sc-glow': light ? mix(hex, 0, 0.42) : mix(hex, 255, veryDark ? 0.3 : 0.18),
    '--sc-accent': light ? mix(hex, 255, 0.55) : mix(hex, 255, 0.45),
    '--sc-rx': `${tilt.y}deg`,
    '--sc-ry': `${tilt.x}deg`,
  } as CSSProperties

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = stage.current?.getBoundingClientRect()
    if (!box) return
    const px = (e.clientX - box.left) / box.width - 0.5
    const py = (e.clientY - box.top) / box.height - 0.5
    setTilt({ x: px * 10, y: -py * 6 })
  }

  // Only swap the photo per colour when the product actually has one image per colour.
  const perColorImages = product.images.length >= colors.length
  const image = (perColorImages ? product.images[colorIdx % colors.length] : undefined) || product.images[0]

  return (
    <section
      className="showcase"
      style={style}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false)
        setTilt({ x: 0, y: 0 })
      }}
    >
      <div className="sc-bg" />
      <div className="sc-grain" />

      <div className="sc-grid">
        <aside className="sc-left">
          <p className="sc-kicker">{t.showcaseKicker}</p>
          {tabs.length > 1 && (
            <nav className="sc-tabs" aria-label="Categories">
              <button
                type="button"
                className={category === ALL ? 'on' : ''}
                onClick={() => pickCategory(ALL)}
              >
                {t.allProducts}
              </button>
              {tabs.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={category === c ? 'on' : ''}
                  onClick={() => pickCategory(c)}
                >
                  {c}
                </button>
              ))}
            </nav>
          )}
          <h2 key={product.id} className="sc-title">
            {t.showcaseTitle1}
            <br />
            <em>{t.showcaseTitle2}</em>
          </h2>
          <p className="sc-sub">{product.description || product.subtitle}</p>
          <ul className="sc-rail" key={category}>
            {list.map((p, i) => (
              <li key={p.id}>
                <button
                  className={i === index ? 'on' : ''}
                  onClick={() => {
                    setDir(i > index ? 'next' : 'prev')
                    setIndex(i)
                  }}
                  aria-label={p.name}
                  type="button"
                >
                  <img src={p.images[0]} alt="" className={p.cutout ? 'cutout' : ''} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="sc-stage" ref={stage} onMouseMove={onMove}>
          <div className="sc-ring" />
          <div key={`${product.id}-${colorIdx}`} className={`sc-card ${dir}${product.cutout ? ' cutout' : ''}`}>
            <img src={image} alt={product.name} draggable={false} />
            <span className="sc-tag">{product.code}</span>
          </div>
          <div className="sc-shadow" />
          <button className="sc-arrow left" onClick={() => go(-1)} aria-label="Previous" type="button">
            <ChevronLeft size={22} />
          </button>
          <button className="sc-arrow right" onClick={() => go(1)} aria-label="Next" type="button">
            <ChevronRight size={22} />
          </button>
        </div>

        <aside className="sc-right">
          <p className="sc-collection">
            {product.category} · {product.collection}
            {index === 0 && list.length > 1 && <span className="sc-popular">{t.mostPopular}</span>}
          </p>
          <h3 key={`${product.id}-name`} className="sc-name">
            {product.name}
          </h3>
          <p className="sc-price">৳ {formatBdt(product.sellingPrice)}</p>
          {product.hasColor && (
            <div className="sc-colors">
              <span>{t.colour}</span>
              <div>
                {colors.map((c, i) => (
                  <button
                    key={c.name}
                    className={i === colorIdx % colors.length ? 'on' : ''}
                    style={{ background: c.hex }}
                    onClick={() => setColorIdx(i)}
                    aria-label={c.name}
                    type="button"
                  />
                ))}
              </div>
              <small>{colorName(active)}</small>
            </div>
          )}
          <div className="sc-actions">
            <Link to={`/product/${product.slug}`} className="sc-shop">
              {t.shopNow} <span>→</span>
            </Link>
            <button
              className="sc-bag"
              type="button"
              onClick={() =>
                addToCart(
                  product.id,
                  product.hasSize ? product.sizes[0] ?? '' : '',
                  product.hasColor ? colorName(active) : '',
                )
              }
            >
              <ShoppingBag size={16} /> {t.addToBag}
            </button>
          </div>
          <p className="sc-count">
            {String(index + 1).padStart(2, '0')} <i /> {String(list.length).padStart(2, '0')}
          </p>
        </aside>
      </div>

      <div className="sc-dots">
        {list.map((p, i) => (
          <button
            key={p.id}
            className={i === index ? 'on' : ''}
            onClick={() => {
              setDir(i > index ? 'next' : 'prev')
              setIndex(i)
            }}
            aria-label={p.name}
            type="button"
          />
        ))}
      </div>
    </section>
  )
}
